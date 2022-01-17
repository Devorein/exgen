import fs from 'fs/promises';
import path from 'path';
import ts, {
	ArrowFunction,
	Block,
	CallExpression,
	ExpressionStatement,
	Identifier,
	ImportDeclaration,
	NamedImportBindings,
	PropertyAccessExpression,
	StringLiteral,
	VariableDeclaration,
	VariableDeclarationList,
	VariableStatement,
} from 'typescript';
import { ExampleInfo, FunctionExampleRecord } from './types';

function functionChecker(expressionStatement: ExpressionStatement, functionName: string) {
	function checker(functionCallExpressions: CallExpression[]): CallExpression[] | null {
		const lastCallExpression = functionCallExpressions[functionCallExpressions.length - 1];

		if (lastCallExpression.kind === 207) {
			const identifier = lastCallExpression.expression as Identifier | PropertyAccessExpression;
			if (identifier.kind === 79 && identifier.escapedText === functionName) {
				return functionCallExpressions;
			}
			// For property access expression
			else if (identifier.kind === 205) {
				return checker(functionCallExpressions.concat(identifier.expression as CallExpression));
			}
		}
		return null;
	}

	if (expressionStatement.kind === 237) {
		const functionExpression = expressionStatement.expression as CallExpression;
		return checker([functionExpression]);
	}
	return null;
}

// Check if the first argument is a string and second argument is an anonymous function expression
function argumentsChecker(
	callExpression: ts.CallExpression,
	cb: (stringArgument: StringLiteral, arrowFunctionArgument: ArrowFunction) => void
) {
	const stringLiteral = callExpression.arguments[0] as StringLiteral;
	if (stringLiteral.kind === 10 || stringLiteral.kind === 14) {
		const arrowFunction = callExpression.arguments[1] as ArrowFunction;
		if (arrowFunction.kind === 213) {
			cb(stringLiteral, arrowFunction);
		}
	}
}

// Check if a variable is equal to the passed identifier
export function variableChecker(
	variableStatement: VariableStatement,
	variableName: string,
	cb: (initializer: ts.Expression) => void
) {
	if (variableStatement.kind === 236) {
		const variableDeclarationList = variableStatement.declarationList as VariableDeclarationList;
		if (variableDeclarationList.kind === 254) {
			const variableDeclaration = variableDeclarationList.declarations[0] as VariableDeclaration;
			if (variableDeclaration.kind === 253) {
				const identifier = variableDeclaration.name as Identifier;
				if (identifier.escapedText === variableName && variableDeclaration.initializer) {
					cb(variableDeclaration.initializer);
				}
			}
		}
	}
}

export async function extractExamples(testFilesDirectory: string) {
	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
	const functionExamplesRecord: FunctionExampleRecord = {};

	async function traverse(testFilesDirectory: string) {
		const testFiles = await fs.readdir(testFilesDirectory);
		for (let index = 0; index < testFiles.length; index++) {
			const testFile = testFiles[index];
			const testFilePath = path.join(testFilesDirectory, testFile);
			const fsStat = await fs.stat(testFilePath);
			if (fsStat.isDirectory()) {
				// If its a directory, recursively call the function
				await traverse(testFilePath);
			} else {
				// Make sure its a test file
				if (testFile.endsWith('test.ts')) {
					const program = ts.createProgram([testFilePath], {});
					const sourceFile = program.getSourceFile(testFilePath)!;
					const importedFunctions: Set<string> = new Set();
					for (let index = 0; index < sourceFile.statements.length; index++) {
						const statement = sourceFile.statements[index] as
							| ExpressionStatement
							| ImportDeclaration;
						if (statement.kind === 265) {
							if (statement.importClause) {
								const namedImports = statement.importClause.namedBindings as NamedImportBindings;
								if (namedImports.kind === 268) {
									const importSpecifiers = namedImports.elements;
									importSpecifiers.forEach((importSpecifier) => {
										importedFunctions.add(importSpecifier.name.escapedText as string);
									});
								}
							}
						} else {
							const describeFunctionStatement = functionChecker(statement, 'describe');
							if (describeFunctionStatement) {
								argumentsChecker(
									describeFunctionStatement[0],
									(describeFunctionFirstArgument, describeFunctionSecondArgument) => {
										const functionName = describeFunctionFirstArgument.text;
										// Make sure the function has been imported in the module
										if (importedFunctions.has(functionName)) {
											const describeFunctionBlock = describeFunctionSecondArgument.body as Block;
											if (describeFunctionBlock.kind === 234) {
												// Loop through all the function block statements
												for (
													let index = 0;
													index < describeFunctionBlock.statements.length;
													index++
												) {
													const describeFunctionBlockStatement = describeFunctionBlock.statements[
														index
													] as ExpressionStatement;
													const itFunctionStatement = functionChecker(
														describeFunctionBlockStatement,
														'it'
													);

													if (itFunctionStatement) {
														// Only if the first argument of it and describe are the same
														argumentsChecker(
															itFunctionStatement[0],
															(itFunctionFirstArgument, itFunctionSecondArgument) => {
																const exampleMessage = itFunctionFirstArgument.text;
																const exampleInfo: ExampleInfo = {
																	logs: [],
																	message: exampleMessage,
																	statements: [],
																};
																const itFunctionBlock = itFunctionSecondArgument.body as Block;
																if (itFunctionBlock.kind === 234) {
																	for (
																		let index = 0;
																		index < itFunctionBlock.statements.length;
																		index++
																	) {
																		const itFunctionBlockStatement = itFunctionBlock.statements[
																			index
																		] as ExpressionStatement;
																		// If its a function call expression
																		if (itFunctionBlockStatement.kind === 237) {
																			// Find the expect function call
																			const expectFunctionStatement = functionChecker(
																				itFunctionBlockStatement,
																				'expect'
																			);
																			if (expectFunctionStatement) {
																				const expectedValue =
																					expectFunctionStatement[0].arguments[0];
																				exampleInfo.logs.push({
																					output: printer.printNode(
																						ts.EmitHint.Unspecified,
																						expectedValue,
																						sourceFile
																					),
																					arg: printer.printNode(
																						ts.EmitHint.Unspecified,
																						expectFunctionStatement[
																							expectFunctionStatement.length - 1
																						].arguments[0],
																						sourceFile
																					),
																				});
																			} else {
																				exampleInfo.statements.push(
																					printer.printNode(
																						ts.EmitHint.Unspecified,
																						itFunctionBlockStatement,
																						sourceFile
																					)
																				);
																			}
																		} else {
																			// Add all the extra block statements
																			exampleInfo.statements.push(
																				printer.printNode(
																					ts.EmitHint.Unspecified,
																					itFunctionBlockStatement,
																					sourceFile
																				)
																			);
																		}
																	}
																	// Add the example info corresponding to the function name
																	if (!functionExamplesRecord[functionName]) {
																		functionExamplesRecord[functionName] = [exampleInfo];
																	} else {
																		functionExamplesRecord[functionName].push(exampleInfo);
																	}
																}
															}
														);
													}
												}
											}
										}
									}
								);
							}
						}
					}
				}
			}
		}
	}
	await traverse(testFilesDirectory);
	return functionExamplesRecord;
}

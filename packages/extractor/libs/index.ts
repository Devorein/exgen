import ts, {
  Block, ExpressionStatement, ImportDeclaration,
  NamedImportBindings
} from 'typescript';
import { ExampleInfo, FunctionExampleRecord } from './types';
import { argumentsChecker } from './utils/argumentsChecker';
import { functionChecker } from './utils/functionChecker';
import { traverseFiles } from './utils/traverseFiles';

export async function extractExamples(testFilesDirectory: string) {
	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
	const functionExamplesRecord: FunctionExampleRecord = {};

  await traverseFiles(testFilesDirectory, (testFilePath) => {
    const program = ts.createProgram([testFilePath], {});
    const sourceFile = program.getSourceFile(testFilePath)!;
    // A set to keep track of imported functions inside a test file
    const importedFunctions: Set<string> = new Set();
    for (let index = 0; index < sourceFile.statements.length; index++) {
      const statement = sourceFile.statements[index] as
        | ExpressionStatement
        | ImportDeclaration;
      
      // If the statement is an import clause
      if (statement.kind === 265) {
        if (statement.importClause) {
          const namedImports = statement.importClause.namedBindings as NamedImportBindings;
          // If its not a default import
          if (namedImports?.kind === 268) {
            const importSpecifiers = namedImports.elements;
            importSpecifiers.forEach((importSpecifier) => {
              importedFunctions.add(importSpecifier.name.escapedText as string);
            });
          }
        }
      } else {
        // Find the function named describe
        const describeFunctionStatement = functionChecker(statement, 'describe');
        if (describeFunctionStatement) {
          argumentsChecker(
            describeFunctionStatement[0],
            (describeFunctionFirstArgument, describeFunctionSecondArgument) => {
              const functionName = describeFunctionFirstArgument.text;
              // Make sure the function has been imported in the module
              if (importedFunctions.has(functionName)) {
                const describeFunctionBlock = describeFunctionSecondArgument.body as Block;
                // If we are inside a function block
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
                    // Find the `it` function
                    const itFunctionStatement = functionChecker(
                      describeFunctionBlockStatement,
                      'it'
                    );

                    if (itFunctionStatement) {
                      // Check the arguments of `it` function
                      argumentsChecker(
                        itFunctionStatement[0],
                        (itFunctionFirstArgument, itFunctionSecondArgument) => {
                          const exampleMessage = itFunctionFirstArgument.text;

                          const exampleInfo: ExampleInfo = {
                            // Stores all the statements that has to be logged
                            logs: [],
                            // Describes what the test is doing
                            message: exampleMessage,
                            // Stores all the statements that is part of the it block
                            statements: [],
                          };
                          const itFunctionBlock = itFunctionSecondArgument.body as Block;
                          // If we are inside a block
                          if (itFunctionBlock.kind === 234) {
                            // Loop through all the statements of the block
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
                                  // Expected value would be the 2nd argument
                                  const expectedValue =
                                    expectFunctionStatement[0].arguments[0];
                                  exampleInfo.logs.push({
                                    // print the node containing the expected value
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
                                  // The rest function calls are statements
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
  })

	return functionExamplesRecord;
}

import { CallExpression, ExpressionStatement, Identifier, PropertyAccessExpression } from "typescript";

/**
 * Check to see if a function statement name matches with the provided name
 * @param expressionStatement Function expression statement
 * @param functionName Name of the function to search for
 * @returns An array of call expressions or null, if its not found
 */
export function functionChecker(expressionStatement: ExpressionStatement, functionName: string) {
	function checker(functionCallExpressions: CallExpression[]): CallExpression[] | null {
		const lastCallExpression = functionCallExpressions[functionCallExpressions.length - 1];

		if (lastCallExpression.kind === 207) {
      // Get the identifier of the function
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
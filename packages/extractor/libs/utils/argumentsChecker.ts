import ts, { ArrowFunction, StringLiteral } from "typescript";

// Check if the first argument is a string and second argument is an anonymous function expression
export function argumentsChecker(
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
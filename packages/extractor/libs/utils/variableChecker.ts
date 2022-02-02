import ts, { Identifier, VariableDeclaration, VariableDeclarationList, VariableStatement } from "typescript";

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
import ts, { NamedImportBindings } from "typescript";

export function getNamedImportSpecifiers(importDeclaration: ts.ImportDeclaration) {
  const importedSpecifiers: Set<string> = new Set();

  if (importDeclaration.importClause) {
    const namedImports = importDeclaration.importClause.namedBindings as NamedImportBindings;
    // If its not a default import
    if (namedImports?.kind === 268) {
      const importSpecifiers = namedImports.elements;
      importSpecifiers.forEach((importSpecifier) => {
        importedSpecifiers.add(importSpecifier.name.escapedText as string);
      });
    }
  }

  return importedSpecifiers;
}
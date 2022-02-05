import ts, { NamedImportBindings } from "typescript";

/**
 * Returns a set of named import specifiers from an import declaration
 * @param importDeclaration Import declaration ast node
 * @returns A set of named import specifiers
 */
export function getNamedImportSpecifiers(importDeclaration: ts.ImportDeclaration) {
  // No two import specifier will be the same, so its redundant to use a set
  const importedSpecifiers: Array<string> = [];

  // Only move forward if the import clause is present
  if (importDeclaration.importClause) {
    const namedImports = importDeclaration.importClause.namedBindings as NamedImportBindings;
    // If its not a default import, it could also be undefined if there is only a default import thus using ?
    if (namedImports?.kind === 268) {
      const importSpecifiers = namedImports.elements;
      // Loop through each of the import specifier
      importSpecifiers.forEach((importSpecifier) => {
        importedSpecifiers.push(importSpecifier.name.escapedText as string);
      });
    }
  }

  return importedSpecifiers;
}
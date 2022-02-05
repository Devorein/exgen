import { createProject } from "@ts-morph/bootstrap";
import ts from "typescript";
import { getNamedImportSpecifiers } from "../../libs/utils/getNamedImportSpecifiers";

describe('getNamedImportSpecifiers', () => {
  it(`Return named import specifiers from import declaration`, async ()=> {
    const project = await createProject({useInMemoryFileSystem: true});
    const sourceFile = project.createSourceFile("main.ts", `import def, {a, b} from "../";`);
    const importedSpecifiers = getNamedImportSpecifiers(sourceFile.statements[0] as ts.ImportDeclaration)!;

    expect(importedSpecifiers.length).toBe(2);
    expect(importedSpecifiers).toStrictEqual(["a", "b"]);
  });

  it(`No named import specifiers`, async ()=> {
    const project = await createProject({useInMemoryFileSystem: true});
    const sourceFile = project.createSourceFile("main.ts", `import def from "../";`);
    const importedSpecifiers = getNamedImportSpecifiers(sourceFile.statements[0] as ts.ImportDeclaration)!;

    expect(importedSpecifiers.length).toBe(0);
  });
});
import { createProject } from "@ts-morph/bootstrap";
import { ExpressionStatement } from "typescript";
import { functionChecker } from "../../libs/utils/functionChecker";

describe('functionChecker', () => {
  it(`Return call expression if function is found`, async ()=> {
    const project = await createProject({useInMemoryFileSystem: true});
    const sourceFile = project.createSourceFile("main.ts", `desc("a", ()=>{});`);
    const expressions = functionChecker(sourceFile.statements[0] as ExpressionStatement, "desc");

    expect(expressions![0].kind).toStrictEqual(207);
  })

  it(`Return call expressions array if function is found`, async ()=> {
    const project = await createProject({useInMemoryFileSystem: true});
    const sourceFile = project.createSourceFile("main.ts", `expect(1).toBe(2);`);
    const expressions = functionChecker(sourceFile.statements[0] as ExpressionStatement, "expect")!;

    expect(expressions.length).toBe(2);
    expect([expressions[0].kind, expressions[1].kind]).toStrictEqual([207, 207]);
  })

  it(`Return null if function not found`, async ()=> {
    const project = await createProject({useInMemoryFileSystem: true});
    const sourceFile = project.createSourceFile("main.ts", `desc("a", ()=>{});`);
    const expressions = functionChecker(sourceFile.statements[0] as ExpressionStatement, "it");

    expect(expressions).toStrictEqual(null);
  })

  it(`Return null if expression statement is a variable statement`, async ()=> {
    const project = await createProject({useInMemoryFileSystem: true});
    const sourceFile = project.createSourceFile("main.ts", `const a = 1;`);
    const expressions = functionChecker(sourceFile.statements[0] as ExpressionStatement, "it");

    expect(expressions).toStrictEqual(null);
  })
});

import { createProject, ts } from "@ts-morph/bootstrap";
import { argumentsChecker } from "../../libs/utils/argumentsChecker";
import { functionChecker } from "../../libs/utils/functionChecker";

describe('argumentsChecker', () => {
  describe(`Call callback if condition matches`, () => {
    it(`for regular string`, async () => {
      const project = await createProject({useInMemoryFileSystem: true});
      const sourceFile = project.createSourceFile("main.ts", `
        describe('makeDouble', () => {});
      `);

      const functionStatement = functionChecker(sourceFile.statements[0] as ts.ExpressionStatement, 'describe')!;
      const jestFn = jest.fn();

      argumentsChecker(functionStatement[0], jestFn);
      expect(jestFn.mock.calls[0][0].kind).toBe(10);
      expect(jestFn.mock.calls[0][1].kind).toBe(213);
    })

    it(`for string literals`, async () => {
      const project = await createProject({useInMemoryFileSystem: true});
      const sourceFile = project.createSourceFile("main.ts", `
        describe(\`makeDouble\`, () => {});
      `);

      const functionStatement = functionChecker(sourceFile.statements[0] as ts.ExpressionStatement, 'describe')!;
      const jestFn = jest.fn();

      argumentsChecker(functionStatement[0], jestFn);
      expect(jestFn.mock.calls[0][0].kind).toBe(14);
      expect(jestFn.mock.calls[0][1].kind).toBe(213);
    })
  });
});

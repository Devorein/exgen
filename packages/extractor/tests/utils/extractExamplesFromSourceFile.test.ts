import { createProject } from "@ts-morph/bootstrap";

afterEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
  jest.resetAllMocks();
});

describe('extractExamplesFromSourceFile', () => {
  it(`Two it calls inside one describe call`, async () => {
    const {extractExamplesFromSourceFile} = await import("../../libs/utils/extractExamplesFromSourceFile");
    const project = await createProject({useInMemoryFileSystem: true});
    const sourceFile = project.createSourceFile("main.ts", `
      import { makeDouble } from './libs/makeDouble';
      import makeTriple from "./libs/makeTriple";
      
      // Needed to test for default import
      makeTriple(2);
      
      function getArgument() {
        return 1;
      };
      
      describe('makeDouble', () => {
        it("Convert 2 to double", () => {
          let argument = getArgument();
          argument+=1;
          const doubled = makeDouble(argument);
          expect(
            doubled
          ).toStrictEqual(4);
        });
      
        it("Convert 1 to double", () => {
          const doubled = makeDouble(1)
          expect(
            doubled
          ).toStrictEqual(1);
        });
      });
    `);
    
    expect(extractExamplesFromSourceFile(sourceFile)).toStrictEqual({
      makeDouble: [{
        logs: [{
          output: "4",
          arg: "doubled"
        }],
        message: "Convert 2 to double",
        statements: ["let argument = getArgument();", "argument += 1;", "const doubled = makeDouble(argument);"]
      }, {
        logs: [{
          output: "1",
          arg: "doubled"
        }],
        message: "Convert 1 to double",
        statements: ["const doubled = makeDouble(1);"]
      }]
    })
  })
});
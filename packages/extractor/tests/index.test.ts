
afterEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
  jest.resetAllMocks();
});

describe('extractExamples', () => {
  it(`Extract examples from source files`, async ()=> {
    const traverseFilesMock = jest.fn();
    // Call the cb twice to simulate test files inside nested directories 
    traverseFilesMock.mockImplementationOnce((_, cb) => {
      cb("root/file1.test.ts")
      cb("root/dir/file2.test.ts")
    });

    jest.mock("../libs/utils/traverseFiles", () => ({
      traverseFiles: traverseFilesMock
    }));

    const extractExamplesFromSourceFileMock = jest.fn();
    extractExamplesFromSourceFileMock.mockImplementationOnce(() => ({
      makeDouble: {
        a: 1,
        b: 1
      }
    })).mockImplementationOnce(() => ({
      makeTriple: {
        c: 1,
        d: 2
      }
    }));
    jest.mock("../libs/utils/extractExamplesFromSourceFile", () => ({
      extractExamplesFromSourceFile: extractExamplesFromSourceFileMock
    }))

    const createProgramMock = jest.fn();
    const getSourceFileMock = jest.fn();
    getSourceFileMock.mockImplementation(() => "sourcefile");
    createProgramMock.mockImplementation(() => ({
      getSourceFile: getSourceFileMock
    }));

    jest.mock("typescript", () => ({
      createProgram: createProgramMock
    }))

    const extractExamples = await import("../libs/index");

    const functionExamplesRecord = await extractExamples.default("root");
    
    expect(getSourceFileMock.mock.calls[0][0]).toBe("root/file1.test.ts")
    expect(getSourceFileMock.mock.calls[1][0]).toBe("root/dir/file2.test.ts")
    expect(createProgramMock.mock.calls[0][0][0]).toEqual("root/file1.test.ts");
    expect(createProgramMock.mock.calls[1][0][0]).toEqual("root/dir/file2.test.ts");
    expect(functionExamplesRecord).toStrictEqual({
      "makeDouble": {
        a: 1,
        b: 1
      },
      "makeTriple": {
        c: 1,
        d: 2
      }
    });
    expect(extractExamplesFromSourceFileMock.mock.calls[0][0]).toBe("sourcefile")
    expect(extractExamplesFromSourceFileMock.mock.calls[1][0]).toBe("sourcefile")
  });
});

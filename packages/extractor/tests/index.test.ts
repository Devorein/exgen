import path from "node:path";
import { extractExamples } from "../libs";

it(`Should work when describe block is present`, async () => {
  expect(await extractExamples(path.join(__dirname, "examples"))).toStrictEqual({
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
import path from "node:path";
import { extractExamples } from "../libs";

it(`Should work when describe block is present`, async () => {
  expect(await extractExamples(path.join(__dirname, "examples"))).toStrictEqual({
    makeDouble: [{
      logs: [{
        output: "2",
        arg: "doubled"
      }],
      message: "Convert to double 1",
      statements: ["const doubled = makeDouble(1);"]
    }]
  })
})
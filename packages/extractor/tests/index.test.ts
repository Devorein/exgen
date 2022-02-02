import path from "node:path";
import { extractExamples } from "../libs";

it(`Should work`, () => {
  expect(extractExamples(path.join(__dirname, "test.ts")))
})
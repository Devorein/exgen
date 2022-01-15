import path from "path";
import { generateExamples } from "typedoc-example-generator";

const testFileDirectory = path.join(__dirname, "tests");

generateExamples(testFileDirectory);
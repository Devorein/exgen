import path from "path";
import { generateExamples } from "typedoc-example-generator";

const testFileDirectory = path.resolve(__dirname, "../tests");
const modulesMarkdownFilePath = path.resolve(__dirname, "../docs/modules.md");

async function main() {
  console.log(await generateExamples(testFileDirectory));
}

main()
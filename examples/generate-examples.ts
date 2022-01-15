import path from 'node:path';
import { fileURLToPath } from "node:url";
import { extractExamples, generateExamples } from "typedoc-example-generator";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testFileDirectory = path.resolve(__dirname, "../tests");
const modulesMarkdownFilePath = path.resolve(__dirname, "../docs/modules.md");

async function main() {
  const functionExamplesRecord = await extractExamples(testFileDirectory);
  await generateExamples(modulesMarkdownFilePath, functionExamplesRecord, "@fauton/cfg")
}

main()
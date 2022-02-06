import extractExamples from "@exgen/extractor";
import path from "path";

async function main() {
  const extractedExamples = await extractExamples(path.resolve(__dirname, "../tests"));
  console.log(extractedExamples);
}

main();
import { embedExamples } from '@exgen/embedder';
import { extractExamples } from '@exgen/extractor';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testFileDirectory = path.resolve(__dirname, '../tests');
const modulesMarkdownFilePath = path.resolve(__dirname, '../docs/modules.md');

async function main() {
	const functionExamplesRecord = await extractExamples(testFileDirectory);
	await embedExamples(modulesMarkdownFilePath, functionExamplesRecord, '@fauton/cfg');
}

main();

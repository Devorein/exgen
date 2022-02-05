import ts from 'typescript';
import { FunctionExampleRecord } from './types';
import { extractExamplesFromSourceFile } from './utils/extractExamplesFromSourceFile';
import { traverseFiles } from './utils/traverseFiles';

export async function extractExamples(testFilesDirectory: string) {
	let functionExamplesRecord: FunctionExampleRecord = {};
  await traverseFiles(testFilesDirectory, (testFilePath) => {
    const program = ts.createProgram([testFilePath], {});
    const sourceFile = program.getSourceFile(testFilePath)!;
    functionExamplesRecord = {
      ...functionExamplesRecord,
      ...extractExamplesFromSourceFile(sourceFile)
    }
  })

	return functionExamplesRecord;
}

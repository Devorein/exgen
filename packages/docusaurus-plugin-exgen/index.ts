import { embedExamples } from '@exgen/embedder';
import { extractExamples } from '@exgen/extractor';
import { join } from 'path';

interface PluginOptions {
	packageDirectory: string;
	documentationDirectory: string;
	packageModuleMarkdownDirectory?: string | null;
	packages: string[];
	scope: string;
}

function exampleGenerator(_: any, opts: PluginOptions) {
	return {
		name: 'docusaurus-plugin-exgen',

		async loadContent() {
			const {
				packages,
				scope,
				documentationDirectory,
				packageModuleMarkdownDirectory,
				packageDirectory,
			} = opts;
			for (let index = 0; index < packages.length; index++) {
				const packageName = packages[index];
				const modulesMarkdownFilePath = join(
					documentationDirectory,
					`${packageName}/${
						packageModuleMarkdownDirectory ? `${packageModuleMarkdownDirectory}/` : ''
					}modules.md`
				);
				const testFilesDirectory = join(packageDirectory, `${packageName}/tests`);
				const functionExamplesRecord = await extractExamples(testFilesDirectory);
				await embedExamples(
					modulesMarkdownFilePath,
					functionExamplesRecord,
					`@${scope}/${packageName}`
				);
			}
		},
	};
}

module.exports.default = exampleGenerator;

import { join } from 'path';
import { extractExamples, generateExamples } from 'typedoc-example-generator';

interface PluginOptions {
  packageDirectory: string,
  moduleMarkdownDirectory: string,
  packages: string[],
  scope: string
}

function exampleGenerator(_: any, opts: PluginOptions) {
  return {
		name: 'docusaurus-plugin-example-generator',

		async loadContent() {
			const { packages, scope, moduleMarkdownDirectory, packageDirectory } = opts;
			for (let index = 0; index < packages.length; index++) {
				const packageName = packages[index];
				const modulesMarkdownFilePath = join(
					moduleMarkdownDirectory,
					`${packageName}/modules.md`
				);
				const testFilesDirectory = join(
					packageDirectory,
					`${packageName}/tests`
				);
				const functionExamplesRecord = await extractExamples(testFilesDirectory);
				await generateExamples(
					modulesMarkdownFilePath,
					functionExamplesRecord,
					`@${scope}/${packageName}`
				);
			}
		},
	};
}

module.exports.default = exampleGenerator;

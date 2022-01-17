import fs from 'fs/promises';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { Heading, HTML } from 'mdast-util-from-markdown/lib';
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter';
import { gfmTableFromMarkdown, gfmTableToMarkdown } from 'mdast-util-gfm-table';
import { toMarkdown } from 'mdast-util-to-markdown';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfmTable } from 'micromark-extension-gfm-table';
import { FunctionExampleRecord } from './types';

function normalizeString(inputString: string) {
	return inputString.replace(/`/g, '\\`').replace(/\\n/g, '\\\\n').split('\n').join('\\n');
}

export async function generateExamples(
	moduleMarkdownPath: string,
	functionExamplesRecord: FunctionExampleRecord,
	packageName: string
) {
	const moduleMarkdownContent = await fs.readFile(moduleMarkdownPath, 'utf-8');
	const markdownTree = fromMarkdown(moduleMarkdownContent, {
		extensions: [gfmTable, frontmatter(['toml', 'yaml'])],
		mdastExtensions: [gfmTableFromMarkdown, frontmatterFromMarkdown(['yaml', 'toml'])],
	});

	markdownTree.children.splice(1, 0, {
		type: 'html',
		value: `import CodeBlock from "@theme/CodeBlock";`,
	});

	// Skip first node since its the slug
	for (let index = 1; index < markdownTree.children.length; index++) {
		const markdownTreeChildren = markdownTree.children[index];
		// Only h3 are used as function headings
		if (markdownTreeChildren.type === 'heading' && markdownTreeChildren.depth === 3) {
			const [textChildNode] = markdownTreeChildren.children;
			// Make sure the function has an example in the record
			if (textChildNode.type === 'text' && functionExamplesRecord[textChildNode.value]) {
				for (let innerIndex = index + 1; ; innerIndex++) {
					const childNode = markdownTree.children[innerIndex];
					if (childNode?.type === 'heading' && childNode.depth === 4) {
						if (
							childNode.children[0]?.type === 'text' &&
							childNode.children[0].value === 'Defined in'
						) {
							const exampleInfos = functionExamplesRecord[textChildNode.value];
							exampleInfos.forEach(({ statements, logs, message }, exampleInfoIndex) => {
								const exampleCode: string[] = [
									`import { ${textChildNode.value} } from "${packageName}";\\n`,
								];
								statements.forEach((statement) => {
									exampleCode.push(normalizeString(statement));
								});

								logs.forEach(({ arg }) => {
									exampleCode.push(`console.log(${normalizeString(arg)});`);
								});

								const codeExampleHtmlNode: HTML = {
									type: 'html',
									value: [
										`##### ${message}`,
										`<div id="${textChildNode.value}-example-${exampleInfoIndex}" className="code-container">`,
										`\t<CodeBlock className="language-ts code-block">`,
										`{\`${exampleCode.join('\\n')}\`}`,
										'</CodeBlock>',
										`\t<CodeBlock className="language-ts code-block">`,
										`{\`${logs
											.map(
												({ arg, output }) =>
													`// ${normalizeString(arg)}\\n${normalizeString(output)}`
											)
											.join('\\n')}\`}`,
										'</CodeBlock>',
										'</div>',
									].join('\n'),
								};

								markdownTree.children.splice(innerIndex, 0, codeExampleHtmlNode);
							});

							const headerNode: Heading = {
								depth: 4,
								type: 'heading',
								children: [
									{
										type: 'text',
										value: 'Example',
									},
								],
							};

							markdownTree.children.splice(innerIndex, 0, headerNode);
							// Set the index, to skip the visited nodes, along with the inserted ones
							index = innerIndex + 1 + exampleInfos.length;
							break;
						}
					}
				}
			}
		}
	}

	// Add the slug with the transformed markdown tree
	await fs.writeFile(
		moduleMarkdownPath,
		toMarkdown(
			{
				type: 'root',
				children: markdownTree.children,
			},
			{
				rule: '_',
				extensions: [gfmTableToMarkdown(), frontmatterToMarkdown(['yaml', 'toml'])],
			}
		),
		'utf-8'
	);
}

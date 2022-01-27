import { readFile, writeFile } from 'fs/promises';
import fromMarkdown from 'mdast-util-from-markdown';
// @ts-ignore
import frontmatterUtil from 'mdast-util-frontmatter';
// @ts-ignore
import gfmTableUtil from 'mdast-util-gfm-table';
import toMarkdown from 'mdast-util-to-markdown';
// @ts-ignore
import frontMatter from 'micromark-extension-frontmatter';
// @ts-ignore
import gfmTable from 'micromark-extension-gfm-table';
import { FunctionExampleRecord } from './types';

function normalizeString(inputString: string) {
	return inputString.replace(/`/g, '\\`').replace(/\\n/g, '\\\\n').split('\n').join('\\n');
}

export async function embedExamples(
	moduleMarkdownPath: string,
	functionExamplesRecord: FunctionExampleRecord,
	packageName: string
) {
	const moduleMarkdownContent = await readFile(moduleMarkdownPath, 'utf-8');
	const markdownTree = fromMarkdown(moduleMarkdownContent, {
		extensions: [gfmTable, frontMatter({ type: 'yaml', marker: '-' })],
		mdastExtensions: [gfmTableUtil.fromMarkdown, frontmatterUtil.fromMarkdown(['yaml', 'toml'])],
	});

	markdownTree.children.splice(1, 0, {
		type: 'paragraph',
		children: [
			{
				type: 'text',
				value: `import CodeBlock from "@theme/CodeBlock";`,
			},
		],
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

								const codeExampleHtmlNode = {
									type: 'html',
									value: [
										`##### ${message}`,
										`<div id="${textChildNode.value}-example-${exampleInfoIndex}" className="code-container">`,
										`\t<CodeBlock className="language-ts code-block">`,
										`{\`${exampleCode.join('\\n')}\`}`,
										'</CodeBlock>',
										`\t<CodeBlock className="language-json code-block">`,
										`{\`${logs
											.map(
												({ arg, output }) =>
													`// ${normalizeString(arg)}\\n${normalizeString(output)}`
											)
											.join('\\n')}\`}`,
										'</CodeBlock>',
										'</div>',
									].join('\n'),
								} as const;

								markdownTree.children.splice(innerIndex, 0, codeExampleHtmlNode);
							});

							const headerNode = {
								depth: 4,
								type: 'heading',
								children: [
									{
										type: 'text',
										value: 'Example',
									},
								],
							} as any;

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
	await writeFile(
		moduleMarkdownPath,
		toMarkdown(
			{
				type: 'root',
				children: markdownTree.children,
			} as any,
			{
				rule: '_',
				extensions: [gfmTableUtil.toMarkdown(), frontmatterUtil.toMarkdown(['yaml', 'toml'])],
			}
		),
		'utf-8'
	);
}

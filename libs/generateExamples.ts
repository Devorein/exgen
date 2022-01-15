import fs from "fs/promises";
import { fromMarkdown } from "mdast-util-from-markdown";
import { Code, Heading } from "mdast-util-from-markdown/lib";
import { toMarkdown } from "mdast-util-to-markdown";
import { FunctionExampleRecord } from "./types";

export async function generateExamples(moduleMarkdownPath: string, functionExamplesRecord: FunctionExampleRecord, packageName: string) {
  const moduleMarkdownContent = await fs.readFile(moduleMarkdownPath, "utf-8");
  const markdownTree = fromMarkdown(moduleMarkdownContent);
  for (let index = 0; index < markdownTree.children.length; index++) {
    const markdownTreeChildren = markdownTree.children[index];
    // Only h3 are used as function headings
    if (markdownTreeChildren.type === "heading" && markdownTreeChildren.depth === 3) {
      const [textChildNode] = markdownTreeChildren.children;
      // Make sure the function has an example in the record
      if (textChildNode.type === "text" && functionExamplesRecord[textChildNode.value]) {
        const {code, result} = functionExamplesRecord[textChildNode.value];
        // Move to the defined in header
        for (let innerIndex = index + 1;; innerIndex++) {
          const childNode = markdownTree.children[innerIndex];
          // Find the ### Returns node
          if (childNode.type === "heading" && childNode.depth === 4) {
            if (childNode.children[0]?.type === "text" && childNode.children[0].value === "Defined in") {
              const codeUsageNode: Code = {
                type: "code",
                value: `import { ${textChildNode.value} } from "${packageName}";\n\n${code}`,
                lang: "ts",
              }, codeResultNode: Code = {
                type: "code",
                value: result,
                lang: "sh"
              }, headerNode: Heading = {
                depth: 4,
                type: "heading",
                children: [
                  {
                    type: "text",
                    value: "Example"
                  }
                ]
              }
              markdownTree.children.splice(innerIndex, 0, codeResultNode);
              markdownTree.children.splice(innerIndex, 0, codeUsageNode);
              markdownTree.children.splice(innerIndex, 0, headerNode);
              // Set the index, to skip the visited nodes, along with the inserted ones
              index = innerIndex + 3;
              break;
            }
          }
        }
      }
    }
  }
  await fs.writeFile(moduleMarkdownPath, toMarkdown(markdownTree, {
    rule: "_"
  }), "utf-8")
}
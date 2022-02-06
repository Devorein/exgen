import fs from "node:fs/promises";
import path from "node:path";

export async function traverseFiles(rootDirectory: string, cb: (filePath: string) => void) {
  async function traverse(directory: string) {
		const files = await fs.readdir(directory);
		for (let index = 0; index < files.length; index++) {
      
      const file = files[index];
      // Get the full file path
			const filePath = path.join(directory, file);
      
      const stat = await fs.stat(filePath);
      // Recursively visit the directory if its one
      if (stat.isDirectory()) {
        await traverse(filePath);
      }
      // Checking whether its a test file 
      else {
        if (file.endsWith("test.ts") || file.endsWith("test.js")) {
          cb(filePath)
        }
      }
    }
  } 

  await traverse(rootDirectory);
}
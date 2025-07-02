import { readdir } from "node:fs/promises";
import { join, relative } from "path";

const inputDir = "ui/build";
const outputFile = "static-routes.ts";

async function getAllFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = join(dir, dirent.name);
      return dirent.isDirectory() ? getAllFiles(res) : [res];
    })
  );
  return files.flat();
}

const allFiles = await getAllFiles(inputDir);

let imports = "";
let exports = "";

allFiles.forEach((filePath, i) => {
  const varName = `file_${i}`;
  // Get the path relative to the project root for Bun.file
  const relPath = `./${filePath.replace(/\\/g, "/")}`;
  const exportKey = relative(inputDir, filePath).replace(/\\/g, "/");
  imports += `import * as ${varName} from \"${relPath}\";\n`;
  exports += `  \"${exportKey}\": ${varName},\n`;
});

const content = `${imports}\nexport default {\n${exports}};\n`;

await Bun.write(outputFile, content);
console.log(`✅ Generated ${outputFile}`);

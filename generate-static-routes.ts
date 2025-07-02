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
  imports += `const ${varName} = Bun.file(\"${relPath}\");\n`;
  exports += `  \"${exportKey}\": { bytes: await ${varName}.bytes(), type: ${varName}.type },\n`;
});

const content = `${imports}\nexport default {\n${exports}};\n`;

await Bun.write(outputFile, content);
console.log(`✅ Generated ${outputFile}`);

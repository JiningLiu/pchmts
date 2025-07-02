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

let exports = "";

for (const i in allFiles) {
  const filePath = allFiles[i]!;
  const relPath = `./${filePath.replace(/\\/g, "/")}`;
  const exportKey = relative(inputDir, filePath).replace(/\\/g, "/");

  const file = Bun.file(relPath);
  exports += `  "${exportKey}": { bytes: "${(
    await file.bytes()
  ).toBase64()}", type: "${file.type}" },\n`;
}

const content = `export default {\n${exports}};\n`;

await Bun.write(outputFile, content);
console.log(`✅ Generated ${outputFile}`);

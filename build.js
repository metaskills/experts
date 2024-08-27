import * as esbuild from "esbuild";
import * as glob from "glob";
import { promises as fs } from "fs";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

async function removeDir(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
    console.log(`Removed ${dir} directory`);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Error removing ${dir} directory:`, error);
    }
  }
}

async function build() {
  // Remove dist directory
  await removeDir("dist");

  // Get all .js files from the src directory
  const entryPoints = glob.sync("src/**/*.js");

  // Get all dependencies and devDependencies from package.json
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];

  const commonConfig = {
    entryPoints,
    platform: "node",
    target: "node18",
    bundle: true,
    outdir: "dist",
    external,
  };

  // Build CommonJS version only
  await esbuild.build({
    ...commonConfig,
    format: "cjs",
    outExtension: { ".js": ".js" }, // Output .js files for CommonJS
  });

  console.log("Build complete");

  // Modify the generated files to use module.exports
  const distFiles = glob.sync("dist/**/*.js");
  for (const file of distFiles) {
    let content = await fs.readFile(file, "utf8");
    content = content.replace(
      /export {([^}]+)};/g,
      (_, exports) => `module.exports = { ${exports.trim()} };`
    );
    await fs.writeFile(file, content);
  }

  console.log("CommonJS conversion complete");
}

build().catch(console.error);

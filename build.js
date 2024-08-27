import * as esbuild from "esbuild";
import * as glob from "glob";
import { promises as fs } from "fs";
import { createRequire } from "module";

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
    external, // This line excludes all packages listed in dependencies and devDependencies
  };

  // Build ESM version
  await esbuild.build({
    ...commonConfig,
    format: "esm",
    outExtension: { ".js": ".js" },
  });

  // Build CommonJS version
  await esbuild.build({
    ...commonConfig,
    format: "cjs",
    outExtension: { ".js": ".cjs" },
  });

  console.log("Build complete");
}

build().catch(console.error);

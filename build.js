import * as esbuild from "esbuild";

async function build() {
  // Build ESM version
  await esbuild.build({
    entryPoints: ["src/index.js"],
    outfile: "dist/index.js",
    format: "esm",
    platform: "node",
    target: "node14",
    bundle: true,
  });

  // Build CommonJS version
  await esbuild.build({
    entryPoints: ["src/index.js"],
    outfile: "dist/index.cjs",
    format: "cjs",
    platform: "node",
    target: "node14",
    bundle: true,
  });

  console.log("Build complete");
}

build().catch(console.error);

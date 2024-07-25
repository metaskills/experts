import fs from "fs";
import url from "url";
import path from "path";
import PQueue from "p-queue";
import { opensearch } from "./opensearch.js";
import { openai } from "../../src/openai.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonFile = path.join(__dirname, "data.json");
const products = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
const queue = new PQueue({ concurrency: 10, autoStart: true });

const createEmbedding = async (input) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: input,
  });
  return response.data[0].embedding;
};

const indexProduct = async (product) => {
  const embedding = await createEmbedding(
    `${product.ProductName} ${product.ProductDescription}`
  );
  await opensearch.index({
    index: "products",
    id: product.ID,
    body: {
      name: product.ProductName,
      description: product.ProductDescription,
      category: product.Category,
      subcategory: product.SubCategory,
      embedding: embedding,
    },
  });
};

console.log("== Indexing Products ==");

queue.add(() => {
  console.log("  This could take a minute...");
});

products.forEach((product) => {
  queue.add(() => indexProduct(product));
});

await queue.onIdle().then(() => {
  console.log("   ✅ Indexed Products");
});

await opensearch.indices.refresh({ index: "products" });
console.log("   ✅ Refreshed Index");

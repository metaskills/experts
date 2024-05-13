import { openai } from "../../src/openai.js";
import { opensearch } from "../products/opensearch.js";
import { helperName, helperInstructions } from "../helpers.js";
import { Tool } from "../../src/experts/tool.js";
import { Categories } from "../products/categories.js";

const INSTRUCTIONS = helperInstructions("productsOpenSearch.md", {
  categories: Categories,
});

class ProductsOpenSearchTool extends Tool {
  constructor() {
    const name = helperName("ProductsOpenSearchTool");
    const description =
      "Creates a fully formed OpenSearch query based on the user's messages.";
    const instructions = INSTRUCTIONS;
    super(name, description, instructions, {
      temperature: 0.1,
      response_format: { type: "json_object" },
      parentsTools: [
        {
          type: "function",
          function: {
            name: ProductsOpenSearchTool.toolName,
            description:
              "Can turn customer's requests into search queries and return aggregate or itemized product data. Please be verbose and submit the customer's complete message or conversation summary needed to fulfill their latest request.",
            parameters: {
              type: "object",
              properties: { message: { type: "string" } },
              required: ["message"],
            },
            required: ["message"],
          },
        },
      ],
    });
  }

  async answered(output) {
    const args = JSON.parse(output);
    return await this.opensearchQuery(args);
  }

  // Private

  async opensearchQuery(args) {
    let rValue;
    let query = args.search_query;
    query = await this.replaceKnnEmbeddingVector(query);
    const response = await opensearch.search(query);
    if (args.search_type === "aggregate") {
      rValue = response.body.aggregations;
    }
    if (args.search_type === "items") {
      const responseIds = response.body.hits.hits.map((p) => p._id);
      const responseFull = await opensearch.search({
        index: "products",
        body: {
          _source: {
            excludes: ["embedding"],
          },
          query: {
            ids: {
              values: responseIds,
            },
          },
        },
        pretty: false,
      });
      rValue = responseFull.body.hits.hits;
    }
    return typeof rValue === "string" ? rValue : JSON.stringify(rValue);
  }

  async replaceKnnEmbeddingVector(obj) {
    if (obj !== null && typeof obj === "object") {
      for (const key in obj) {
        if (
          // Approximate k-NN
          key === "knn" &&
          obj[key].embedding &&
          obj[key].embedding.vector
        ) {
          const vector = await this.createEmbedding(obj[key].embedding.vector);
          obj[key].embedding.vector = vector;
        } else if (
          // Script Score k-NN
          key === "script" &&
          obj[key].source === "knn_score" &&
          obj[key].params.query_value
        ) {
          console.log("\n\n", obj[key]);
          const vector = await this.createEmbedding(
            obj[key].params.query_value
          );
          obj[key].params.query_value = vector;
        } else {
          await this.replaceKnnEmbeddingVector(obj[key]);
        }
      }
    }
    return obj;
  }

  async createEmbedding(input) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: input,
    });
    return response.data[0].embedding;
  }
}

export { ProductsOpenSearchTool };

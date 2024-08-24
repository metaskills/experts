import FormData from "form-data";
import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import { openai } from "../../src/openai.js";
import { helperName } from "../helpers.js";
import { Tool } from "../../src/index.js";
import { ProductsOpenSearchTool } from "./productsOpenSearchTool.js";

const INSTRUCTIONS = `
You are part of a product catalog panel of experts that responds to a customer's messages. Your job is to perform semantic and faceted search on apparel data. Use your code interpreter tool to make charts or graphs if the customer asks for them.

Follow these rules:

1. Use your 'products_open_search' to search for product data.
2. Always use your 'code_interpreter' tool to generate images for charts or graphs.
3. Respond only with the single word "Success" to the customer.
`.trim();

class ProductsTool extends Tool {
  constructor() {
    super({
      name: helperName("ProductsTool"),
      description: "Apparel product search assistant.",
      instructions: INSTRUCTIONS,
      temperature: 0.1,
      tools: [{ type: "code_interpreter" }],
      outputs: "tools",
      parentsTools: [
        {
          type: "function",
          function: {
            name: "products",
            description:
              "Can search and analyze the apparel product data. Please be verbose and submit the customer's complete message or conversation summary needed to fulfill their latest request.",
            parameters: {
              type: "object",
              properties: { message: { type: "string" } },
              required: ["message"],
            },
          },
        },
      ],
    });
    this.addAssistantTool(ProductsOpenSearchTool);
    this.on("imageFileDoneAsync", this.imageFileDoneAsync.bind(this));
  }

  async imageFileDoneAsync(content, _snapshot, data) {
    const { fileName, fileData } = await this.fileNameAndData(content);
    const url = await this.postImage(fileName, fileData);
    const imgContent = JSON.stringify({ chart_image_url: url });
    this.addExpertOutput(imgContent);
  }

  async fileNameAndData(content) {
    const id = content.file_id;
    const file = await openai.files.retrieve(id);
    const response = await openai.files.content(id);
    const chunks = [];
    for await (const chunk of response.body) {
      chunks.push(chunk);
    }
    const fileData = Buffer.concat(chunks);
    const type = await fileTypeFromBuffer(fileData);
    let fileName = file.filename;
    if (type?.ext) {
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      fileName = `${nameWithoutExt}.${type.ext}`;
    }
    return { fileName, fileData };
  }

  async postImage(fileName, fileData) {
    const fileType = await fileTypeFromBuffer(fileData);
    const formData = new FormData();
    formData.append("file", fileData, {
      filename: fileName,
      contentType: fileType.mime,
    });
    formData.append("token", process.env.POST_IMAGES_API_KEY);
    formData.append("upload_session", "FHDybB27uHG8uoP9r3QZT1x6Jk5vwMlD"); // Random string.
    formData.append("session_upload", Date.now());
    formData.append("expire", "1");
    formData.append("numfiles", "1");
    formData.append("optsize", "0");
    formData.append("adult", "0");
    formData.append("upload_referer", "aHR0cHM6Ly9wb3N0aW1nLmNjLw==");
    const response = await axios.post("https://postimg.cc/json", formData, {
      headers: formData.getHeaders(),
    });
    let url = response.data.url;
    url = `https://i.postimg.cc${url.split("postimg.cc")[1]}/${fileName}`;
    return url;
  }
}

export { ProductsTool };

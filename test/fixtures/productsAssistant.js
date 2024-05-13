import { helperName } from "../helpers.js";
import { Assistant } from "../../src/experts/assistant.js";
import { ProductsTool } from "./productsTool.js";

const INSTRUCTIONS = `
You are an assistant for an apparel company that orchestrates customer messages to the proper tool. All messages must use one or more tools to respond.

Follow these rules:

1. Do not mention download links in the response. 
2. Always show markdown images to the customer.
`.trim();

class ProductsAssistant extends Assistant {
  constructor() {
    const name = helperName("ProductsAssistant");
    const description = "Product apparel company's virtual assistant.";
    const instructions = INSTRUCTIONS;
    super(name, description, instructions, {
      temperature: 0.1,
    });
    this.addAssistantTool(ProductsTool);
  }
}

export { ProductsAssistant };

import { Tool } from "../../src/experts/tool.js";
import { Assistant } from "../../src/experts/assistant.js";
import { helperName } from "../helpers.js";

class MockDataTool extends Tool {
  constructor() {
    super({
      llm: false,
      parentsTools: [
        {
          type: "function",
          function: {
            name: "data_tool",
            description: "Returns data based on the message",
            parameters: {
              type: "object",
              properties: { message: { type: "string" } },
              required: ["message"],
            },
          },
        },
      ],
    });
    this.toolCallCount = 0;
  }

  async ask(message) {
    const data = {
      cows: [
        {
          name: "Bessie",
          age: 3,
          milk_production: "27 liters/day",
        },
        {
          name: "Gertie",
          age: 5.5,
          milk_production: "24 liters/day",
        },
      ],
    };
    this.toolCallCount++;
    return JSON.stringify(data);
  }
}

class HtmlTool extends Tool {
  constructor() {
    super({
      llm: false,
      parentsTools: [
        {
          type: "function",
          function: {
            name: "html_tool",
            description: "Format one or more items into HTML components.",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  description: "Array of items to render as HTML.",
                  items: {
                    type: "object",
                    properties: {
                      heading: {
                        type: "string",
                        description: "Data for the header tag.",
                      },
                      content: {
                        type: "string",
                        description: "Basic HTML content.",
                      },
                    },
                    required: ["heading", "content"],
                  },
                },
              },
              required: ["items"],
            },
          },
        },
      ],
    });
    this.toolCallCount = 0;
  }

  async ask(message) {
    const data = JSON.parse(message);
    data.items.forEach((item) => {
      const renderedTemplate = `<div class="my-Component"><h2>${item.heading}</h2><p>${item.content}</p></div>`;
      this.parent.addBufferedOutput(renderedTemplate);
    });
    this.toolCallCount++;
    return "Success. Added HTML to hidden buffered output only see by the user.";
  }
}

class HtmlAssistant extends Assistant {
  constructor() {
    super({
      name: helperName("HtmlAssistant"),
      instructions: `
## Rules

1. For each user message, use the 'data_tool' first to find items.
2. For each item from the 'data_tool', use the 'html_tool' to HTML format them.
3. HTML output is hidden to you. Assume the user can see it appended to your message.
    `,
      temperature: 0.1,
    });
    this.addAssistantTool(MockDataTool);
    this.addAssistantTool(HtmlTool);
  }
}

export { HtmlAssistant };

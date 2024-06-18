import { Tool } from "../../src/experts/tool.js";
import { Assistant } from "../../src/experts/assistant.js";

class AccountsTool extends Tool {
  constructor() {
    super({
      llm: false,
      parentsTools: [
        {
          type: "function",
          function: {
            name: "accounts_find_by_id",
            description: "Find an account by ID",
            parameters: {
              type: "object",
              properties: { id: { type: "integer" } },
              required: ["id"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "accounts_find_by_email",
            description: "Find an account by Email",
            parameters: {
              type: "object",
              properties: { email: { type: "string" } },
              required: ["email"],
            },
          },
        },
      ],
    });
  }

  async ask(message) {
    const params = JSON.parse(message);
    if (params.id) {
      return this.#findByID(params.id);
    } else if (params.email) {
      return this.#findByEmail(params.email);
    }
  }

  #findByID(id) {
    return JSON.stringify({
      id: id,
      email: "user@example.com",
      name: "Jordan Whitaker",
    });
  }

  #findByEmail(email) {
    return JSON.stringify({
      id: 838282,
      email: email,
      name: "Elena Prescott",
    });
  }
}

class AccountsAssistant extends Assistant {
  constructor() {
    super({
      instructions: "Routes messages to the right tool.",
    });
    this.addAssistantTool(AccountsTool);
  }
}

export { AccountsAssistant, AccountsTool };

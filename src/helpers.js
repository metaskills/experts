const DEBUG = process.env.DEBUG === "1";
const DEBUG_DELTAS = process.env.DEBUG_DELTAS === "1";
const DEBUG_EVENTS = process.env.DEBUG_EVENTS === "1";
const DEBUG_PRETTY_JSON = process.env.DEBUG_PRETTY_JSON === "0";

const debug = (message) => {
  if (DEBUG) {
    console.log(message);
  }
};

const debugEvent = (event) => {
  if (!DEBUG) return;

  const eventCopy = JSON.parse(JSON.stringify(event));
  if (eventCopy.data && eventCopy.data.instructions) {
    eventCopy.data.instructions = "[INSTRUCTIONS REMOVED]";
  }
  if (eventCopy.data && eventCopy.data.tools) {
    eventCopy.data.tools = eventCopy.data.tools.map((tool) => {
      if (
        tool.type === "function" &&
        tool.function &&
        tool.function.description
      ) {
        tool.function.description = "[DESCRIPTION REMOVED]";
      }
      return tool;
    });
  }

  const isToolCallEvent = eventCopy.data?.step_details?.type === "tool_calls";

  if (isToolCallEvent) {
    const toolCalls = eventCopy.data.step_details.tool_calls;
    toolCalls.forEach((toolCall) => {
      const emoji = getToolCallEmoji(toolCall.type);
      const toolCallData = toolCall[toolCall.type];
      const jsonOutput = DEBUG_PRETTY_JSON
        ? JSON.stringify(toolCallData, null, 2)
        : JSON.stringify(toolCallData);
      debug(`${emoji} Tool Call (${toolCall.type}): ${jsonOutput}`);
    });
  } else if (DEBUG_EVENTS) {
    if (event.event.includes("delta") && !DEBUG_DELTAS) return;
    const jsonOutput = DEBUG_PRETTY_JSON
      ? JSON.stringify(eventCopy, null, 2)
      : JSON.stringify(eventCopy);
    debug(`📡 Event: ${jsonOutput}`);
  }
};

const getToolCallEmoji = (toolType) => {
  switch (toolType) {
    case "file_search":
      return "🧰 🔍";
    case "code_interpreter":
      return "🧰 💻";
    default:
      return "🧰";
  }
};

const messagesContent = (messages) => {
  return messages
    .map((m) => {
      return m.content
        .filter((c) => c.type === "text")
        .map((c) => c.text.value)
        .join("\n\n");
    })
    .join("\n\n");
};

export { debug, debugEvent, messagesContent };

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
  if (!DEBUG_EVENTS) return;
  if (event.event.includes("delta") && !DEBUG_DELTAS) return;
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
  const jsonOutput = DEBUG_PRETTY_JSON
    ? JSON.stringify(eventCopy, null, 2)
    : JSON.stringify(eventCopy);
  debug(`📡 Event: ${jsonOutput}`);
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

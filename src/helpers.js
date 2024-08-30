const DEBUG = process.env.DEBUG === "1";
const DEBUG_DELTAS = process.env.DEBUG_DELTAS === "1";

const debug = (message) => {
  if (DEBUG) {
    console.log(message);
  }
};

const debugEvent = (event) => {
  if (!DEBUG) return;
  if (event.event.includes("delta") && !DEBUG_DELTAS) return;
  const eventCopy = JSON.parse(JSON.stringify(event));
  if (eventCopy.data && eventCopy.data.instructions) {
    eventCopy.data.instructions = "[INSTRUCTIONS REMOVED]";
  }
  debug(`📡 Event: ${JSON.stringify(eventCopy)}`);
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

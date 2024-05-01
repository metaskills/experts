const DEBUG = process.env.DEBUG === "1";
const isDebug = DEBUG;

const debug = (message) => {
  if (isDebug) {
    console.log(message);
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

export { debug, isDebug, messagesContent };

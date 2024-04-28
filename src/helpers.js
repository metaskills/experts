const DEBUG = process.env.DEBUG === "1";
const isDebug = DEBUG;

const debug = (message) => {
  if (isDebug) {
    console.log(message);
  }
};

const formatToolOutputs = (outputs) => {
  const result = outputs.map((item) => {
    if (typeof item === "string") {
      return item;
    } else {
      return JSON.stringify(item);
    }
  });
  return result.join("\n\n");
};

export { debug, isDebug, formatToolOutputs };

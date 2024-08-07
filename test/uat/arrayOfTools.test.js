import { helperThreadID } from "../helpers.js";
import { CreativeAssistant } from "../fixtures.js";

// TODO: Allow these tool calls to be async with a unique thread.

test("can call 3 tools in sequence", async () => {
  const threadID = await helperThreadID();
  const assistant = await CreativeAssistant.create();
  await assistant.ask(
    "RouteLLM: What it is and what you should know.",
    threadID
  );
}, 60000);

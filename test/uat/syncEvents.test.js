import { openai } from "../../src/openai.js";
import { helperThread, helperThreadID } from "../helpers.js";
import { SyncEventsAssistant } from "../fixtures.js";

test("testing that events emitted are capabile of async code and waited to complete", async () => {
  const assistant = await SyncEventsAssistant.create();
  const threadID = await helperThreadID();
  const output = await assistant.ask(
    "What do Ziggle whales like to eat?",
    threadID
  );
  expect(output).toMatch(/yeti/i);
  expect(output).toMatch(/crabs/i);
  // // Make sure assistant did not hear it from the grapevine.
  // const thread = await helperThread(threadID);
  // const threadTool = await helperThread(thread.metadata.answer_tool_one);
  // const lastMessages = await openai.beta.threads.messages.list(threadTool.id, {
  //   limit: 1,
  // });
  // const lastMessage = lastMessages.data[0];
  // expect(lastMessage.role).toBe("assistant");
  // expect(lastMessage.content[0].text.value).toBe("Success");
});

import { openai } from "../../src/openai.js";
import { helperThread, helperThreadID } from "../helpers.js";
import { OutputsAssistant } from "../fixtures.js";

test("forcing outputs from one tool to another", async () => {
  const assistant = await OutputsAssistant.create();
  const threadID = await helperThreadID();
  const output = await assistant.ask("What is my favorite food?", threadID);
  expect(output).toMatch(/peanut/i);
  expect(output).toMatch(/butter/i);
  // Make sure assistant did not hear it from the grapevine.
  const thread = await helperThread(threadID);
  const threadTool = await helperThread(thread.metadata.answer_tool_one);
  const lastMessages = await openai.beta.threads.messages.list(threadTool.id, {
    limit: 1,
  });
  const lastMessage = lastMessages.data[0];
  expect(lastMessage.role).toBe("assistant");
  expect(lastMessage.content[0].text.value).toBe("Success");
});

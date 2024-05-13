import { helperThreadID } from "../helpers.js";
import { EchoAssistant } from "../fixtures.js";

test("can ask the assistant a question using a thread id", async () => {
  const assistant = await EchoAssistant.create();
  const threadID = await helperThreadID();
  const output = await assistant.ask("hello 123", threadID);
  expect(output).toBe("hello 123");
});

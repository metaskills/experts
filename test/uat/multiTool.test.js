import { helperThreadID } from "../helpers.js";
import { AccountsAssistant } from "../fixtures.js";

test("can find an expert that has many tools", async () => {
  const assistant = await AccountsAssistant.create();
  const threadID = await helperThreadID();
  const output = await assistant.ask(
    "What is the name of the user with an id of 32916?",
    threadID
  );
  expect(output).toMatch(/Jordan Whitaker/i);
  const output2 = await assistant.ask(
    "What is the name of the user with email of person@company.com?",
    threadID
  );
  expect(output2).toMatch(/Elena Prescott/i);
}, 20000);

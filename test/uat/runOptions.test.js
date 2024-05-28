import { helperThreadID } from "../helpers.js";
import { CarpenterAssistant, DrillTool } from "../fixtures/toolboxAssistant.js";

test("an assistant with run_options or using run options to ask", async () => {
  const assistant = await CarpenterAssistant.create();
  const threadID = await helperThreadID();
  const output = await assistant.ask("start work", threadID);
  expect(DrillTool.calls).toBe(1);
  expect(output).toMatch(/hole.*wall/);
  const output2 = await assistant.ask("are you done?", threadID, {
    run: {
      additional_instructions:
        "The job is done! You would like to get paid. Ask for $200.",
    },
  });
  expect(output2).toMatch(/200/);
});

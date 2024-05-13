import { helperThreadID } from "../helpers.js";
import { ProductsAssistant } from "../fixtures.js";

test("a comprehensive opensearch assistant for product apparel catalog", async () => {
  const assistant = await ProductsAssistant.create();
  const threadID = await helperThreadID();
  // Can it query the OpenSearch DB for a simple aggregate count.
  // const totalAnswer = await assistant.ask(
  //   "What is the total amount of products available?",
  //   threadID
  // );
  // expect(totalAnswer).toMatch(/(5,000|5000)/);
  // Can it use code interperter to genereate a bar chart image along with the answer?
  // const totalChartAnswer = await assistant.ask(
  //   "Show me a bar chart image with totals of all top level categories.",
  //   threadID
  // );

  // expect(output2).toMatch(/123 hello/);
  // // Ensure each has own tread using metadata links.
  // const thread = await helperThread(threadID);
  // expect(thread.metadata.echo).toMatch(/thread_/);
  // const thread2 = await helperThread(thread.metadata.echo);
  // expect(thread2.metadata.tool).toMatch(/Experts\.js \(EchoTool\)/);
}, 180000);

// await assistant.ask("How many products do you have?");
// await assistant.ask("Show me a bar chart image with totals of each category.");
// await assistant.ask(
//   "Find men's accessories for a sophisticated comic book enthusiast."
// );

import { openai } from "../src/openai.js";

test("exports an openai client", () => {
  expect(openai).toBeInstanceOf(Object);
  expect(openai.beta).toBeInstanceOf(Object);
  expect(openai.beta.threads).toBeInstanceOf(Object);
});

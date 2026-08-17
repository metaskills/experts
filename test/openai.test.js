import { configureOpenAI, openai } from "../src/openai.js";

test("exports an openai client", () => {
  expect(openai).toBeInstanceOf(Object);
  expect(openai.beta).toBeInstanceOf(Object);
  expect(openai.beta.threads).toBeInstanceOf(Object);
});

test("configures the shared OpenAI client", () => {
  const client = configureOpenAI({
    apiKey: "test-key",
    baseURL: "http://localhost:4000/v1",
    maxRetries: 0,
  });

  expect(openai).toBe(client);
  expect(openai.baseURL).toBe("http://localhost:4000/v1");
  expect(openai.maxRetries).toBe(0);
});

import { OpenAI } from "openai";

const defaultOptions = () => ({
  apiKey: process.env.OPENAI_API_KEY,
});

let openai = new OpenAI(defaultOptions());

function configureOpenAI(options = {}) {
  openai = new OpenAI({ ...defaultOptions(), ...options });
  return openai;
}

export { configureOpenAI, openai };

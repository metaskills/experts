import "./env.js";
import fs from "fs";
import ejs from "ejs";
import url from "url";
import path from "path";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { openai } from "../src/openai.js";

const helperName = (use, options = {}) => {
  const rand = options.rand !== undefined ? options.rand : true;
  const name = `Experts.js (${use})`;
  if (!rand) return name;
  return name;
};

const helperPath = (filePath) => {
  const base = path.resolve(__dirname, "..");
  return path.join(base, filePath);
};

const helperInstructions = (file, context = {}) => {
  const template = fs.readFileSync(
    helperPath(`test/fixtures/${file}`),
    "utf-8"
  );
  return ejs.render(template, context);
};

const helperThread = async (threadID) => {
  return await openai.beta.threads.retrieve(threadID);
};

const helperThreadID = async () => {
  const thread = await openai.beta.threads.create();
  return thread.id;
};

const helperFindAllAssistants = async () => {
  const assistants = await openai.beta.assistants.list({ limit: 100 });
  return assistants.data;
};

const helperDeleteAllAssistants = async () => {
  const assistants = await helperFindAllAssistants();
  for (const assistant of assistants) {
    try {
      await openai.beta.assistants.del(assistant.id);
    } catch (error) {}
  }
};

const helperFindAssistant = async (name) => {
  const assistant = (
    await openai.beta.assistants.list({ limit: 100 })
  ).data.find((a) => a.name === name);
  return assistant;
};

const helperDeleteAssistant = async (name) => {
  const assistant = await helperFindAssistant(name);
  if (assistant !== undefined) {
    await openai.beta.assistants.del(assistant.id);
  }
};

const helperFindAllVectorStores = async () => {
  const vectorStores = await openai.beta.vectorStores.list({ limit: 100 });
  return vectorStores.data;
};

const helperDeleteAllVectorStores = async () => {
  const vectorStores = await helperFindAllVectorStores();
  for (const vectorStore of vectorStores) {
    try {
      await openai.beta.vectorStores.del(vectorStore.id);
    } catch (error) {
      console.log(error);
    }
  }
};

const helperFindAllFiles = async () => {
  const files = await openai.files.list({ limit: 100 });
  return files.data;
};

const helperDeleteAllFiles = async () => {
  const files = await helperFindAllFiles();
  for (const file of files) {
    try {
      await openai.files.del(file.id);
    } catch (error) {
      console.log(error);
    }
  }
};

export {
  helperName,
  helperPath,
  helperThread,
  helperInstructions,
  helperThreadID,
  helperDeleteAllAssistants,
  helperFindAssistant,
  helperDeleteAllVectorStores,
  helperFindAllFiles,
  helperDeleteAllFiles,
};

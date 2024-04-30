import url from "url";
import path from "path";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { openai } from "../src/openai.js";

const helperName = (use) => {
  const name = `Experts.js (${use})`;
  return `${name} ${Math.random().toString(36).substring(4)}`;
};

const helperPath = (filePath) => {
  const base = path.resolve(__dirname, "..");
  return path.join(base, filePath);
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
  return assistants.data.filter((a) => a.name?.startsWith("Experts.js"));
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
  return vectorStores.data.filter((a) => a.name?.startsWith("Experts.js"));
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

export {
  helperName,
  helperPath,
  helperThread,
  helperThreadID,
  helperDeleteAllAssistants,
  helperFindAssistant,
  helperDeleteAllVectorStores,
};

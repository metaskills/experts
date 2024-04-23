import { openai } from "../src/openai.js";

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

export {
  helperThreadID,
  helperFindAllAssistants,
  helperDeleteAllAssistants,
  helperFindAssistant,
  helperDeleteAssistant,
};

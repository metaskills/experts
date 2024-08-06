process.env.NODE_ENV = "test";

import {
  helperDeleteAllAssistants,
  helperDeleteAllVectorStores,
  helperDeleteAllFiles,
} from "./helpers.js";

export default async function () {
  await helperDeleteAllAssistants();
  await helperDeleteAllVectorStores();
  await helperDeleteAllFiles();
}

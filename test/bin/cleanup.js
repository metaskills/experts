import {
  helperDeleteAllAssistants,
  helperDeleteAllVectorStores,
  helperDeleteAllFiles,
} from "../../test/helpers.js";

await helperDeleteAllAssistants();
await helperDeleteAllVectorStores();
await helperDeleteAllFiles();

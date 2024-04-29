import {
  helperDeleteAllAssistants,
  helperDeleteAllVectorStores,
} from "./helpers.js";

export default async function () {
  await helperDeleteAllAssistants();
  await helperDeleteAllVectorStores();
}

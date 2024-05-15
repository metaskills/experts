import fs from "fs";
import { Client } from "@opensearch-project/opensearch";

const node = process.env.OPENSEARCH_URL || "http://admin:admin@localhost:9200";
const opensearch = new Client({
  node: ``,
  ssl: {
    ca: fs.readFileSync("/etc/ssl/certs/Comodo_AAA_Services_root.pem"),
    rejectUnauthorized: false,
  },
});

export { opensearch };

import fs from "fs";
import { Client } from "@opensearch-project/opensearch";

const opensearch = new Client({
  node: process.env.OPENSEARCH_URL || "http://admin:admin@localhost:9200",
  ssl: {
    ca: fs.readFileSync("/etc/ssl/certs/Comodo_AAA_Services_root.pem"),
    rejectUnauthorized: false,
  },
});

export { opensearch };

import fs from "fs";
import { Client } from "@opensearch-project/opensearch";

const host = process.env.OPENSEARCH_HOST || "localhost";
const opensearch = new Client({
  node: `https://admin:admin@${host}:9200`,
  ssl: {
    ca: fs.readFileSync("/etc/ssl/certs/Comodo_AAA_Services_root.pem"),
    rejectUnauthorized: false,
  },
});

export { opensearch };

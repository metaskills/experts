import { opensearch } from "./opensearch.js";

async function uniqueKeywords(fieldName) {
  const response = await opensearch.search({
    index: "products",
    body: {
      size: 0,
      query: {
        bool: {
          must: [
            {
              exists: {
                field: fieldName,
              },
            },
            {
              bool: {
                must_not: {
                  term: {
                    [fieldName]: "NaN",
                  },
                },
              },
            },
          ],
        },
      },
      aggs: {
        unique_keywords: {
          terms: {
            field: fieldName,
            size: 100,
          },
        },
      },
    },
  });
  const results = response.body.aggregations.unique_keywords.buckets.map(
    (bucket) => bucket.key
  );
  return [...new Set(results)].sort();
}

const Categories = await uniqueKeywords("category");
const SubCategories = await uniqueKeywords("subcategory");

export { Categories, SubCategories };

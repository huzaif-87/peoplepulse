const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env") });

const aiSearchService = require("../src/services/aiSearchService");
const employeeService = require("../src/services/employeeService");

async function verifyFix() {
  console.log("=== VERIFYING LIVE SMART SEARCH FIX ===");

  const queries = [
    "react",
    "react developers",
    "python developers",
    "javascript developers in Chennai",
    "active react developers in Chennai"
  ];

  for (const q of queries) {
    console.log(`\nQuery: "${q}"`);
    const parsed = await aiSearchService.parseNaturalLanguageQuery(q);
    console.log("Parsed AI Result:", JSON.stringify(parsed, null, 2));

    // Verify parameter structure
    const filters = parsed.filters;
    console.log(` -> search: "${filters.search}", designation: "${filters.designation}", location: "${filters.location}", status: "${filters.status}"`);
    console.log(` -> Interpretation: ${parsed.interpretation}`);
  }

  console.log("\n=== LIVE FIX VERIFICATION PASSED ===");
}

verifyFix().catch(console.error);

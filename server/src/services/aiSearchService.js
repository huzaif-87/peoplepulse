const { GoogleGenerativeAI } = require("@google/generative-ai");

const ALLOWED_DEPARTMENTS = [
  "Engineering",
  "Design",
  "Sales",
  "Marketing",
  "HR",
  "Finance",
  "Operations"
];

const ALLOWED_STATUSES = ["Active", "On Leave", "Inactive"];

const ALLOWED_LOCATIONS = [
  "Chennai",
  "Bangalore",
  "Hyderabad",
  "Mumbai",
  "Pune",
  "Delhi",
  "Remote"
];

const ALLOWED_EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Intern"];

const ALLOWED_SORT_BY = [
  "firstName",
  "lastName",
  "joiningDate",
  "department",
  "status",
  "location",
  "createdAt"
];

const ALLOWED_SORT_ORDER = ["asc", "desc"];

/**
 * Sanitizes and strictly validates raw AI filter output against explicit allowlists.
 * Prohibits MongoDB operator injection ($where, $gt, $regex, etc.).
 */
const validateAndSanitizeFilters = (rawObj) => {
  if (!rawObj || typeof rawObj !== "object") {
    return {
      filters: {
        search: "",
        designation: "",
        department: "",
        status: "",
        location: "",
        employmentType: "",
        joiningYear: "",
        sortBy: "createdAt",
        sortOrder: "desc"
      },
      interpretation: "Standard search",
      isEmployeeQuery: true
    };
  }

  // 1. Check if non-employee query
  if (rawObj.isEmployeeQuery === false || rawObj.unsupportedQuery === true) {
    return {
      isEmployeeQuery: false,
      message: "This search is designed for employee and workforce queries."
    };
  }

  // 2. Sanitize search string (strip dangerous characters & MongoDB operators)
  let search = typeof rawObj.search === "string" ? rawObj.search.trim() : "";
  search = search.replace(/[\$\{\}\[\]\<\>\\]/g, ""); // strip Mongo operator special chars
  if (search.startsWith("$")) {
    search = "";
  }

  // 3. Sanitize designation string (strip dangerous characters & MongoDB operators)
  let designation = typeof rawObj.designation === "string" ? rawObj.designation.trim() : "";
  designation = designation.replace(/[\$\{\}\[\]\<\>\\]/g, "");
  if (designation.startsWith("$")) {
    designation = "";
  }

  // 4. Department validation (Case-insensitive matching to exact allowlist)
  let department = "";
  if (typeof rawObj.department === "string" && rawObj.department.trim()) {
    const matchedDept = ALLOWED_DEPARTMENTS.find(
      (d) => d.toLowerCase() === rawObj.department.trim().toLowerCase()
    );
    if (matchedDept) {
      department = matchedDept;
    }
  }

  // 5. Status validation
  let status = "";
  if (typeof rawObj.status === "string" && rawObj.status.trim()) {
    const matchedStatus = ALLOWED_STATUSES.find(
      (s) => s.toLowerCase() === rawObj.status.trim().toLowerCase()
    );
    if (matchedStatus) {
      status = matchedStatus;
    }
  }

  // 6. Location validation
  let location = "";
  if (typeof rawObj.location === "string" && rawObj.location.trim()) {
    const matchedLoc = ALLOWED_LOCATIONS.find(
      (l) => l.toLowerCase() === rawObj.location.trim().toLowerCase()
    );
    if (matchedLoc) {
      location = matchedLoc;
    }
  }

  // 7. Employment Type validation
  let employmentType = "";
  if (typeof rawObj.employmentType === "string" && rawObj.employmentType.trim()) {
    const matchedEmp = ALLOWED_EMPLOYMENT_TYPES.find(
      (e) => e.toLowerCase() === rawObj.employmentType.trim().toLowerCase()
    );
    if (matchedEmp) {
      employmentType = matchedEmp;
    }
  }

  // 8. Joining Year validation
  let joiningYear = "";
  if (rawObj.joiningYear !== undefined && rawObj.joiningYear !== null && rawObj.joiningYear !== "") {
    const parsedYear = parseInt(rawObj.joiningYear, 10);
    const currentYear = new Date().getFullYear();
    if (!isNaN(parsedYear) && parsedYear >= 1970 && parsedYear <= currentYear + 1) {
      joiningYear = parsedYear;
    }
  }

  // 9. SortBy validation
  let sortBy = "createdAt";
  if (typeof rawObj.sortBy === "string" && rawObj.sortBy.trim()) {
    const matchedSort = ALLOWED_SORT_BY.find(
      (sb) => sb.toLowerCase() === rawObj.sortBy.trim().toLowerCase()
    );
    if (matchedSort) {
      sortBy = matchedSort;
    }
  }

  // 10. SortOrder validation
  let sortOrder = "desc";
  if (typeof rawObj.sortOrder === "string" && rawObj.sortOrder.trim()) {
    const lowerOrder = rawObj.sortOrder.trim().toLowerCase();
    if (ALLOWED_SORT_ORDER.includes(lowerOrder)) {
      sortOrder = lowerOrder;
    }
  }

  // Build human-readable interpretation
  const parts = [];
  if (status) parts.push(`Status: ${status}`);
  if (department) parts.push(`Department: ${department}`);
  if (designation) parts.push(`Role: ${designation}`);
  if (location) parts.push(`Location: ${location}`);
  if (employmentType) parts.push(`Employment: ${employmentType}`);
  if (joiningYear) parts.push(`Joined: ${joiningYear}`);
  if (search) parts.push(`Skill/Search: "${search}"`);

  const interpretation = parts.length > 0
    ? `Interpreted filters: ${parts.join(" • ")}`
    : "General employee search";

  return {
    isEmployeeQuery: true,
    filters: {
      search,
      designation,
      department,
      status,
      location,
      employmentType,
      joiningYear,
      sortBy,
      sortOrder
    },
    interpretation
  };
};

/**
 * Deterministic intent parser fallback for offline / test / missing API key scenarios.
 */
const fallbackHeuristicParse = (queryStr) => {
  const q = queryStr.toLowerCase().trim();

  // Check for obvious non-employee queries
  const nonEmployeeKeywords = [
    "weather", "recipe", "song", "movie", "capital of",
    "math", "joke", "translate", "how to make", "who is the president"
  ];
  if (nonEmployeeKeywords.some((kw) => q.includes(kw))) {
    return { isEmployeeQuery: false, message: "This search is designed for employee and workforce queries." };
  }

  let remainingText = q;

  // 1. Status
  let status = "";
  if (remainingText.includes("active") && !remainingText.includes("inactive")) {
    status = "Active";
    remainingText = remainingText.replace(/\bactive\b/g, "");
  } else if (remainingText.includes("inactive")) {
    status = "Inactive";
    remainingText = remainingText.replace(/\binactive\b/g, "");
  } else if (remainingText.includes("on leave") || remainingText.includes("leave")) {
    status = "On Leave";
    remainingText = remainingText.replace(/\b(on leave|leave)\b/g, "");
  }

  // 2. Department
  let department = "";
  for (const dept of ALLOWED_DEPARTMENTS) {
    if (remainingText.includes(dept.toLowerCase())) {
      department = dept;
      remainingText = remainingText.replace(new RegExp(`\\b${dept.toLowerCase()}\\b`, "g"), "");
      break;
    }
  }

  // 3. Location
  let location = "";
  for (const loc of ALLOWED_LOCATIONS) {
    if (remainingText.includes(loc.toLowerCase())) {
      location = loc;
      remainingText = remainingText.replace(new RegExp(`\\b${loc.toLowerCase()}\\b`, "g"), "");
      break;
    }
  }

  // 4. Employment Type
  let employmentType = "";
  if (remainingText.includes("full time") || remainingText.includes("full-time")) {
    employmentType = "Full-time";
    remainingText = remainingText.replace(/\bfull-time\b|\bfull time\b/g, "");
  } else if (remainingText.includes("part time") || remainingText.includes("part-time")) {
    employmentType = "Part-time";
    remainingText = remainingText.replace(/\bpart-time\b|\bpart time\b/g, "");
  } else if (remainingText.includes("contract")) {
    employmentType = "Contract";
    remainingText = remainingText.replace(/\bcontract\b/g, "");
  } else if (remainingText.includes("intern")) {
    employmentType = "Intern";
    remainingText = remainingText.replace(/\bintern\b/g, "");
  }

  // 5. Joining Year
  let joiningYear = "";
  const currentYear = new Date().getFullYear();
  if (remainingText.includes("this year")) {
    joiningYear = currentYear;
    remainingText = remainingText.replace(/\bthis year\b/g, "");
  } else {
    const yearMatch = remainingText.match(/\b(20\d{2}|19\d{2})\b/);
    if (yearMatch) {
      joiningYear = parseInt(yearMatch[1], 10);
      remainingText = remainingText.replace(yearMatch[0], "");
    }
  }

  // 6. Designation (Role) detection
  let designation = "";
  const roleMappings = [
    { keywords: ["developers", "developer"], role: "Developer" },
    { keywords: ["engineers", "engineer"], role: "Engineer" },
    { keywords: ["designers", "designer"], role: "Designer" },
    { keywords: ["managers", "manager"], role: "Manager" },
    { keywords: ["strategists", "strategist"], role: "Strategist" },
    { keywords: ["analysts", "analyst"], role: "Analyst" },
    { keywords: ["specialists", "specialist"], role: "Specialist" },
    { keywords: ["executives", "executive"], role: "Executive" },
    { keywords: ["leads", "lead"], role: "Lead" },
    { keywords: ["accountants", "accountant"], role: "Accountant" },
    { keywords: ["coordinators", "coordinator"], role: "Coordinator" }
  ];

  for (const { keywords, role } of roleMappings) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, "i");
      if (regex.test(remainingText)) {
        designation = role;
        remainingText = remainingText.replace(regex, "");
        break;
      }
    }
    if (designation) break;
  }

  // 7. Extract remaining keywords for skill / name search
  const fillerWords = [
    "in", "who", "joined", "employee", "employees", "staff", "people", "show", "find",
    "list", "get", "me", "with", "for", "and", "the", "a", "an", "all", "are", "is"
  ];
  const words = remainingText
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9\-\+\#]/g, "").trim())
    .filter((w) => w && !fillerWords.includes(w.toLowerCase()));

  const search = words.join(" ").trim();

  return validateAndSanitizeFilters({
    isEmployeeQuery: true,
    search,
    designation,
    department,
    status,
    location,
    employmentType,
    joiningYear,
    sortBy: "createdAt",
    sortOrder: "desc"
  });
};

/**
 * Natural language intent extraction using Google Gemini API.
 */
const parseNaturalLanguageQuery = async (userQuery) => {
  if (!userQuery || typeof userQuery !== "string" || !userQuery.trim()) {
    return {
      isEmployeeQuery: true,
      filters: {
        search: "",
        designation: "",
        department: "",
        status: "",
        location: "",
        employmentType: "",
        joiningYear: "",
        sortBy: "createdAt",
        sortOrder: "desc"
      },
      interpretation: "All employees"
    };
  }

  const queryClean = userQuery.trim();
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const currentYear = new Date().getFullYear();

  // If no API key configured or fake key string, use heuristic intent parser safely
  if (!apiKey || apiKey.startsWith("replace_") || apiKey.startsWith("AQ.")) {
    return fallbackHeuristicParse(queryClean);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const systemPrompt = `
You are the AI Intent Parser for PeoplePulse, an enterprise HR management platform.
Your ONLY task is to convert natural language employee search queries into structured JSON employee filters.

Context:
- Current calendar year: ${currentYear}
- "this year" means ${currentYear}

Allowed values:
- department: ${JSON.stringify(ALLOWED_DEPARTMENTS)} or null
- status: ${JSON.stringify(ALLOWED_STATUSES)} or null
- location: ${JSON.stringify(ALLOWED_LOCATIONS)} or null
- employmentType: ${JSON.stringify(ALLOWED_EMPLOYMENT_TYPES)} or null
- joiningYear: 4-digit integer or null
- designation: General job role title or null (e.g. "Developer", "Engineer", "Manager", "Designer", "Specialist", "Analyst", "Executive", "Lead")
- search: Skill name, programming language, candidate name, employee ID, or leftover search keyword string (e.g. "react", "python", "javascript", "Aarav", "EMP-1001") or null
- isEmployeeQuery: boolean (false ONLY if user asks non-employee questions like weather, math, general code examples, recipes)

CRITICAL INSTRUCTION FOR COMBINED QUERIES (Skills + Roles):
When a query contains both a skill/technology AND a role/designation, ALWAYS separate them into 'search' and 'designation'.
Examples:
- "react developers" -> search: "react", designation: "Developer"
- "python developers" -> search: "python", designation: "Developer"
- "javascript developers in Chennai" -> search: "javascript", designation: "Developer", location: "Chennai"
- "active react developers in Chennai" -> search: "react", designation: "Developer", status: "Active", location: "Chennai"
- "react developers in Bangalore who joined in 2025" -> search: "react", designation: "Developer", location: "Bangalore", joiningYear: 2025
- "developers" -> search: null, designation: "Developer"
- "react" -> search: "react", designation: null

JSON Output Schema:
{
  "isEmployeeQuery": boolean,
  "search": string or null,
  "designation": string or null,
  "department": string or null,
  "status": string or null,
  "location": string or null,
  "employmentType": string or null,
  "joiningYear": integer or null,
  "sortBy": "createdAt",
  "sortOrder": "desc"
}

User query: "${queryClean}"
Return JSON only.
`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    const parsedObj = JSON.parse(responseText);

    return validateAndSanitizeFilters(parsedObj);
  } catch (err) {
    console.error("Gemini API call failed, falling back to heuristic parser:", err.message);
    return fallbackHeuristicParse(queryClean);
  }
};

module.exports = {
  parseNaturalLanguageQuery,
  validateAndSanitizeFilters,
  ALLOWED_DEPARTMENTS,
  ALLOWED_STATUSES,
  ALLOWED_LOCATIONS,
  ALLOWED_EMPLOYMENT_TYPES
};

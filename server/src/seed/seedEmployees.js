const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config();

const connectDB = require("../config/db");
const Employee = require("../models/Employee");

const TOTAL_EMPLOYEES = 300;

const FIRST_NAMES = [
  "Aarav", "Ananya", "Rohan", "Priya", "Vikram", "Neha", "Aditya", "Pooja",
  "Karthik", "Divya", "Suresh", "Kavya", "Rahul", "Meera", "Sanjay", "Anjali",
  "Arjun", "Ritu", "Rajesh", "Sneha", "Amit", "Swati", "Deepak", "Shruti",
  "Varun", "Ishita", "Manish", "Nisha", "Gautam", "Preeti", "Alok", "Sunita",
  "Tarun", "Tanvi", "Abhishek", "Bhavna", "Kunal", "Shweta", "Nikhil", "Simran",
  "Harsh", "Kavita", "Yash", "Riya", "Aakash", "Srishti", "Pranav", "Payal"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Reddy", "Rao", "Nair", "Iyer", "Kumar",
  "Singh", "Gupta", "Joshi", "Deshmukh", "Chowdhury", "Banerjee", "Mehta", "Shah",
  "Agarwal", "Kapoor", "Malhotra", "Kulkarni", "Bhat", "Pillai", "Menon", "Gowda",
  "Shenoy", "Hegde", "Das", "Dutta", "Mukherjee", "Chatterjee", "Srinivasan", "Venkatesh"
];

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Sales",
  "Marketing",
  "HR",
  "Finance",
  "Operations"
];

const DESIGNATIONS_BY_DEPT = {
  Engineering: [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "QA Engineer",
    "Software Engineer",
    "Engineering Manager"
  ],
  Design: [
    "UI Designer",
    "UX Designer",
    "Product Designer",
    "Design Lead"
  ],
  Sales: [
    "Sales Executive",
    "Sales Manager",
    "Account Executive",
    "Business Development Executive"
  ],
  Marketing: [
    "Marketing Specialist",
    "Content Strategist",
    "SEO Specialist",
    "Marketing Manager"
  ],
  HR: [
    "HR Executive",
    "HR Manager",
    "Talent Acquisition Specialist",
    "People Operations Specialist"
  ],
  Finance: [
    "Accountant",
    "Financial Analyst",
    "Finance Manager",
    "Accounts Executive"
  ],
  Operations: [
    "Operations Executive",
    "Operations Manager",
    "Operations Analyst",
    "Process Associate"
  ]
};

const SKILLS_BY_DEPT = {
  Engineering: ["React", "Node.js", "JavaScript", "TypeScript", "MongoDB", "Python", "Docker", "AWS", "Git"],
  Design: ["Figma", "UI Design", "UX Research", "Prototyping", "Design Systems"],
  Sales: ["CRM", "Negotiation", "Communication", "Lead Generation", "Account Management"],
  Marketing: ["SEO", "Content Marketing", "Google Analytics", "Social Media", "Copywriting"],
  HR: ["Recruitment", "Employee Relations", "HRIS", "Talent Acquisition"],
  Finance: ["Excel", "Accounting", "Financial Analysis", "Taxation", "SAP"],
  Operations: ["Process Management", "Excel", "Operations Management", "Reporting"]
};

const LOCATIONS = [
  "Chennai",
  "Bangalore",
  "Hyderabad",
  "Mumbai",
  "Pune",
  "Delhi",
  "Remote"
];

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Intern"];
const STATUSES = ["Active", "On Leave", "Inactive"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubset(arr, minCount = 2, maxCount = 5) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  return shuffled.slice(0, count);
}

function getRandomDateInPastYears(years = 5) {
  const now = new Date();
  const past = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
  const timestamp = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(timestamp);
}

const seedEmployees = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    console.log("Generating employees...");
    const employees = [];
    const managerPool = [];

    // First pass: create employees and identify managers
    for (let i = 1; i <= TOTAL_EMPLOYEES; i++) {
      const empIdNum = 1000 + i;
      const employeeId = `EMP-${empIdNum}`;
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      const department = getRandomItem(DEPARTMENTS);
      const designation = getRandomItem(DESIGNATIONS_BY_DEPT[department]);
      const location = getRandomItem(LOCATIONS);
      const joiningDate = getRandomDateInPastYears(5);
      
      // Realistic employment type distribution
      const empTypeRoll = Math.random();
      const employmentType = empTypeRoll < 0.75 ? "Full-time" :
                             empTypeRoll < 0.85 ? "Contract" :
                             empTypeRoll < 0.93 ? "Part-time" : "Intern";

      // Realistic status distribution
      const statusRoll = Math.random();
      const status = statusRoll < 0.85 ? "Active" :
                     statusRoll < 0.93 ? "On Leave" : "Inactive";

      const skills = getRandomSubset(SKILLS_BY_DEPT[department], 2, 5);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${empIdNum}@peoplepulse.demo`;
      const phone = `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`;
      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + "+" + lastName)}&background=random`;

      // Track potential managers (e.g., designations with Manager/Lead or first 30 employees)
      if (designation.includes("Manager") || designation.includes("Lead") || i <= 30) {
        managerPool.push(employeeId);
      }

      employees.push({
        employeeId,
        firstName,
        lastName,
        email,
        phone,
        avatar,
        department,
        designation,
        location,
        joiningDate,
        employmentType,
        status,
        skills,
        manager: undefined // will assign in second pass
      });
    }

    // Second pass: assign managers from manager pool ensuring no self-management
    for (let emp of employees) {
      // Top leaders (first 5) or ~10% don't have a manager
      if (managerPool.includes(emp.employeeId) && Math.random() < 0.4) {
        emp.manager = undefined;
      } else {
        const validManagers = managerPool.filter((id) => id !== emp.employeeId);
        if (validManagers.length > 0) {
          emp.manager = getRandomItem(validManagers);
        }
      }
    }

    console.log(`Generated: ${employees.length}`);

    console.log("Removing previous seeded employees...");
    await Employee.deleteMany({});

    console.log("Inserting employees...");
    await Employee.insertMany(employees);

    console.log(`Successfully inserted: ${employees.length}`);
    console.log("Database seed completed.");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding employees:", error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedEmployees();

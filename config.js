const { fetchWatchedPage } = require("./sources");

// config.js: your job "wishlist"
module.exports = {
  // ---- Career boards (no key needed) ----
  // The ID from the company's job URL
  
  //greenhouse
  greenhouseCompanies: ["hackerrank", "devrev", "enterpret", "karya", "stripe", "mdbgeneralreferrals", "instawork", "groww", "razorpaysoftwareprivatelimited",
    "nasdaq", "zscalar", "schrdinger"
  ],
  
  // lever
  leverCompanies: ["epifi", "fampay", "stable-money1", "Sprinto", "paytm", "acronaviation"],
  
  //ashby
  ashbyCompanies: [],
  
  // Workday companies: copy these three parts from the careers page URL
  workdayCompanies: [
    { name: "NVIDIA", url: "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite" },
    { name: "Salesforce", url: "https://salesforce.wd12.myworkdayjobs.com/External_Career_Site" },
    { name: "Walmart", url: "https://walmart.wd504.myworkdayjobs.com/WalmartExternal" },
    // add more the same way
  ],
  
  // individual career pages
  // Any careers page: alerts when keyword mentions increase
  watchedPages: [
    // { name: "Company X", url: "https://companyx.com/careers", keywords: ["intern", "internship"] },
  ],

  // ---- Adzuna (used only if your keys are in .env) ----
  searches: ["data engineer intern", "machine learning intern", "software engineer intern"],
  location: "India",
  maxDaysOld: 3,

  // ---- Filters ----
  // 1. Must be an internship (whole words only, so "internal" won't match)
  mustHaveAny: ["intern", "internship", "trainee"],

  // 2. Must be a tech role: title needs at least ONE of these
  mustHaveField: [
    "software", "engineer", "engineering", "developer", "backend", "frontend",
    "full stack", "data", "machine learning", "ml", "ai", "research",
    "security", "sde", "analyst",
  ],

  // 3. Skip if title has ANY of these
  exclude: [
    "senior", "lead", "manager", "head", "unpaid",
    "sales", "finance", "talent", "people", "business", "marketing", "hr", "audit",
    "high school", "phd", "master's", "masters",
  ],

  // 4. Location must mention one of these ("remote" alone removed: it let "Remote - US" through)
  locationKeywords: [
    "india", "bangalore", "bengaluru", "delhi", "gurgaon", "gurugram",
    "noida", "hyderabad", "pune", "mumbai", "chennai",
  ],
};
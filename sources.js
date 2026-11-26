// sources.js: every place we fetch jobs from lives here

const config = require("./config");
const fs = require("fs");

// ---------- Watched career pages (any website) ----------
// Counts keyword mentions (e.g. "intern") on the page and alerts when the count goes UP.
const COUNTS_FILE = "page-counts.json";

async function fetchWatchedPage(page) {
  const response = await fetch(page.url, {
    headers: { "User-Agent": "Mozilla/5.0 (Shortlisted job alert; personal use)" },
  });

  if (!response.ok) {
    console.warn(`Page "${page.name}" failed (${response.status})`);
    return [];
  }

  // Turn the HTML into plain lowercase text: drop scripts, styles and tags
  const html = await response.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .toLowerCase();

  // Count whole-word mentions of each keyword and add them up
  const keywords = page.keywords || ["intern", "internship", "sde 1", "software engineer intern"];
  const count = keywords.reduce((total, word) => {
    const safe = word.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const found = text.match(new RegExp(`\\b${safe}\\b`, "g"));
    return total + (found ? found.length : 0);
  }, 0);

  // Compare with last time, then save today's count
  const counts = fs.existsSync(COUNTS_FILE)
    ? JSON.parse(fs.readFileSync(COUNTS_FILE, "utf-8"))
    : {};
  const before = counts[page.url];
  counts[page.url] = count;
  fs.writeFileSync(COUNTS_FILE, JSON.stringify(counts, null, 2));

  if (count === 0) {
    console.warn(` "${page.name}": 0 mentions. The page probably loads jobs with JavaScript.`);
  }

  // First visit just records the count; after that, only alert when it goes UP
  if (before === undefined || count <= before) return [];

  return [{
    id: `page-${page.url}-${count}`,
    title: `Careers page: "${keywords.join(" / ")}" mentions went ${before} → ${count}`,
    company: page.name,
    location: "Check the page",
    url: page.url,
    alwaysShow: true,  // skip the normal filters; this is an alert, not a job title
  }];
}

// ---------- Greenhouse ----------
async function fetchGreenhouse(company) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`;
  const response = await fetch(url);

  // A wrong company ID gives a 404, so we warn and move on instead of crashing
  if (!response.ok) {
    console.warn(` Greenhouse "${company}" not found (${response.status})`);
    return [];
  }

  const data = await response.json();
  return data.jobs.map((job) => ({
    id: `gh-${company}-${job.id}`,  // prefix so ids never clash between sources
    title: job.title,
    company: company,                // Greenhouse doesn't send a name, so we use the ID
    location: job.location?.name || "Not specified",
    url: job.absolute_url,
  }));
}

// ---------- Lever ----------
async function fetchLever(company) {
  const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
  const response = await fetch(url);

  if (!response.ok) {
    console.warn(` Lever "${company}" not found (${response.status})`);
    return [];
  }

  const jobs = await response.json();  // Lever returns a plain array
  return jobs.map((job) => ({
    id: `lever-${company}-${job.id}`,
    title: job.text,                    // Lever calls the title "text"
    company: company,
    location: job.categories?.location || "Not specified",
    url: job.hostedUrl,
  }));
}

// ---------- Ashby (used by many startups, including YC companies) ----------
async function fetchAshby(company) {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${company}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.warn(` Ashby "${company}" not found (${response.status})`);
    return [];
  }

  const data = await response.json();
  return data.jobs.map((job) => ({
    id: `ashby-${company}-${job.id}`,
    title: job.title,
    company: company,
    location: job.location || "Not specified",
    url: job.jobUrl,
    type: job.employmentType,  // Ashby tells us directly, e.g. "Intern" or "FullTime"
  }));
}

// ---------- Workday helper: split a careers URL into its 3 parts ----------
// "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite"
//   → { host: "nvidia.wd5.myworkdayjobs.com", tenant: "nvidia", site: "NVIDIAExternalCareerSite" }
function parseWorkdayUrl(careersUrl) {
  const parsed = new URL(careersUrl);
  const host = parsed.hostname;
  const tenant = host.split(".")[0];

  // Skip a language code like "en-US" if the URL has one
  const parts = parsed.pathname.split("/").filter(Boolean);
  const site = parts[0].match(/^[a-z]{2}-[A-Z]{2}$/) ? parts[1] : parts[0];

  return { host, tenant, site };
}

// ---------- Workday ----------
// Each company in config looks like: { name: "NVIDIA", url: "https://..." }
async function fetchWorkday(company) {
  const { host, tenant, site } = parseWorkdayUrl(company.url);
  const apiUrl = `https://${host}/wday/cxs/${tenant}/${site}/jobs`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Shortlisted job alert; personal use)",
    },
    body: JSON.stringify({
      appliedFacets: {},
      searchText: "intern",
      limit: 20,
      offset: 0,
    }),
  });

  if (!response.ok) {
    console.warn(` Workday "${company.name}" failed (${response.status})`);
    return [];
  }

  const data = await response.json();
  return (data.jobPostings || []).map((job) => ({
    id: `workday-${tenant}-${job.externalPath}`,
    title: job.title,
    company: company.name,
    location: job.locationsText || "Not specified",
    url: `https://${host}/en-US/${site}${job.externalPath}`,
  }));
}


module.exports = { fetchGreenhouse, fetchLever, fetchAshby, fetchWorkday, fetchWatchedPage };
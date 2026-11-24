// index.js: fetch internship postings from Adzuna and filter them

require("dotenv").config({ quiet: true });          // loads the keys from .env into process.env
const config = require("./config");  // loads your wishlist
const { jobKey, loadSeen, saveSeen } = require("./memory");

// ---- Imports: bring in the functions from our other files ----
// Each name here must ALSO be listed in module.exports inside sources.js
const {
  fetchGreenhouse,
  fetchLever,
  fetchAshby,
  fetchWorkday,
  fetchWatchedPage,
} = require("./sources");

const { sendJobsEmail } = require("./mailer");  // our email helper


// ---- 2. Decide whether a job passes your filters ----
// Checks for a WHOLE word or phrase, so "intern" matches "Data Intern" but not "Internal Audit".
// \b means "word boundary", the edge between a word and a space/comma/bracket
function hasWord(text, word) {
  const safe = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");  // escape special characters
  return new RegExp(`\\b${safe}\\b`, "i").test(text);        // "i" = ignore upper/lowercase
}

function isGoodMatch(job) {
  if (job.alwaysShow) return true;  // page alerts skip the job-title filters
  const isInternship = config.mustHaveAny.some((w) => hasWord(job.title, w));
  const isTechRole   = config.mustHaveField.some((w) => hasWord(job.title, w));
  const isExcluded   = config.exclude.some((w) => hasWord(job.title, w));
  const inRightPlace = config.locationKeywords.some((w) => hasWord(job.location, w));

  return isInternship && isTechRole && !isExcluded && inRightPlace;
}

// ---- 3. Run everything ----
async function main() {
  // One "fetch task" per company (or search term), from every source.
  // The "|| []" means: if that list is missing from config.js, treat it as empty
  const tasks = [
    ...(config.greenhouseCompanies || []).map(fetchGreenhouse),
    ...(config.leverCompanies || []).map(fetchLever),
    ...(config.ashbyCompanies || []).map(fetchAshby),
    ...(config.workdayCompanies || []).map(fetchWorkday),
    ...(config.watchedPages || []).map(fetchWatchedPage),
  ];

  // Run all of them at the same time and wait for every one to finish
  const results = await Promise.all(tasks);
  const allJobs = results.flat();  // [[...], [...]] → one list
  console.log(`📥 Fetched ${allJobs.length} jobs in total`);

  // The same job can show up in two searches, so remove duplicates by id
  const uniqueJobs = [...new Map(allJobs.map((job) => [job.id, job])).values()];

  const matches = uniqueJobs.filter(isGoodMatch);

  // ---- Phase 3: keep only jobs we haven't emailed before ----
  const seen = loadSeen();
  const newJobs = matches.filter((job) => !seen[jobKey(job)]);

  console.log(`✅ ${matches.length} match your filters, ${newJobs.length} are NEW:\n`);
  newJobs.forEach((job, i) => {
    console.log(`${i + 1}. ${job.title} @ ${job.company} (${job.location})`);
    console.log(`   ${job.url}\n`);
  });

  // Email first, and only update the notebook if that worked
  await sendJobsEmail(newJobs);
  saveSeen(seen, matches);
}

main().catch((err) => {
  console.error("❌ Something went wrong:", err);
});
// memory.js: the bot's "notebook" of jobs it has already emailed

const fs = require("fs");  // built into Node: lets us read and write files

const FILE = "seen-jobs.json";
const KEEP_DAYS = 60;      // forget jobs older than this

// Build a key that's the same no matter where the job came from.
// "  Software Engineer, Intern " @ "Stripe" → "stripe|software engineer, intern"
function jobKey(job) {
  const clean = (text) => text.toLowerCase().replace(/\s+/g, " ").trim();
  return `${clean(job.company)}|${clean(job.title)}`;
}

// Read the notebook (or start an empty one on the very first run)
function loadSeen() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

// Add today's jobs, drop very old ones, and save
function saveSeen(seen, jobs) {
  const today = new Date().toISOString().slice(0, 10);  // e.g. "2026-11-23"

  // Record each job with the date we first saw it (keep the older date if it already exists)
  for (const job of jobs) {
    const key = jobKey(job);
    if (!seen[key]) seen[key] = today;
  }

  // Remove entries older than KEEP_DAYS
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - KEEP_DAYS);
  for (const [key, date] of Object.entries(seen)) {
    if (new Date(date) < cutoff) delete seen[key];
  }

  // null, 2 = pretty-print with indentation, so the file is easy to read
  fs.writeFileSync(FILE, JSON.stringify(seen, null, 2));
}

module.exports = { jobKey, loadSeen, saveSeen };
// mailer.js: turns a list of jobs into a grouped email and sends it via Gmail

require("dotenv").config({ quiet: true });
const nodemailer = require("nodemailer");

// The "transporter" delivers the mail, logging in to Gmail with the app password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// One HTML "card" per job
function jobToHtml(job) {
  return `
    <div style="border:1px solid #ddd; border-radius:8px; padding:12px; margin-bottom:12px;">
      <h3 style="margin:0 0 4px 0;">${job.title}</h3>
      <p style="margin:0; color:#555;">${job.company} · ${job.location}</p>
      <a href="${job.url}" style="display:inline-block; margin-top:8px;">View & apply →</a>
    </div>
  `;
}

// A heading plus its cards, or nothing at all if the group is empty
function section(title, jobs, note = "") {
  if (jobs.length === 0) return "";
  return `
    <h3 style="margin-top:24px;">${title} (${jobs.length})</h3>
    ${note ? `<p style="color:#b45309; font-size:13px;">${note}</p>` : ""}
    ${jobs.map(jobToHtml).join("")}
  `;
}

async function sendJobsEmail(jobs) {
  // No point emailing an empty list
  if (jobs.length === 0) {
    console.log("No new jobs today, so no email sent.");
    return;
  }

  // Split into groups so the email is easy to scan
  const pageAlerts = jobs.filter((j) => j.alwaysShow);                    // watched careers pages
  const india      = jobs.filter((j) => !j.alwaysShow && !j.international);
  const abroad     = jobs.filter((j) => !j.alwaysShow && j.international);

  const count = `${jobs.length} new update${jobs.length > 1 ? "s" : ""}`;
  const html = `
    <h2>✅ Shortlisted: ${count} for you today</h2>
    ${section("🔔 Career pages that changed", pageAlerts)}
    ${section("🇮🇳 Roles in India", india)}
    ${section("🌍 Abroad", abroad, "Check the posting for visa sponsorship before applying.")}
    <p style="color:#888; font-size:12px;">Sent by your Shortlisted bot 🎓</p>
  `;

  await transporter.sendMail({
    from: `"Shortlisted Bot" <${process.env.GMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `✅ Shortlisted: ${count} for you today`,
    html: html,
  });

  console.log(`📧 Email sent with ${jobs.length} updates!`);
}

module.exports = { sendJobsEmail };
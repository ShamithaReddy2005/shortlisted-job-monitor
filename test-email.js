// test-email.js: checks the email works, without needing Adzuna

const { sendJobsEmail } = require("./mailer");

// Fake jobs shaped exactly like the ones index.js will produce
const fakeJobs = [
  {
    title: "Data Engineer Intern",
    company: "Test Company A",
    location: "Bangalore",
    url: "https://example.com/job1",
  },
  {
    title: "Machine Learning Intern",
    company: "Test Company B",
    location: "Remote",
    url: "https://example.com/job2",
  },
];

sendJobsEmail(fakeJobs).catch((err) => {
  console.error("❌ Email failed:", err.message);
});
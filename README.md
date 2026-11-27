# Shortlisted 

A small Node.js bot that checks company job boards every morning and emails me new internship openings, so I don't have to check each careers page myself.

## What it does right now

- Fetches postings from **Greenhouse**, **Lever** and **Workday** job-board APIs for a list of companies I picked (Ashby is supported too)
- Filters them by title and location: internships, tech roles, based in India
- Remembers which jobs it has already sent (for 10 days), so the same opening isn't emailed twice
- Sends one grouped HTML email with the new matches
- Runs every day at 8 AM IST using **GitHub Actions**

## How it works

```
GitHub Actions (daily) → fetch jobs from each board → filter → skip already-seen → email → save seen-jobs.json
```

| File | What it does |
|------|--------------|
| `config.js` | Companies to track and the filter keywords |
| `sources.js` | One fetch function per job board |
| `index.js` | Runs everything and applies the filters |
| `memory.js` | Keeps track of jobs that were already emailed |
| `mailer.js` | Builds and sends the email |
| `.github/workflows/daily.yml` | The daily schedule |

## Running it locally

```bash
npm install
```

Create a `.env` file:

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
EMAIL_TO=where-to-send@gmail.com
```

Then:

```bash
node test-email.js   # check that email works
node index.js        # run the bot once
```


## Things I want to add

- More companies and sources
- Better handling for careers pages that load jobs with JavaScript
- A simple frontend to manage companies and filters without editing code

## Built with

Node.js · Nodemailer · GitHub Actions

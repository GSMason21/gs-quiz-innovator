# GettingSmart Quiz Template

A reusable quiz engine that scores responses, applies Mailchimp tags, and triggers automation journeys. Drop into Vercel. Change one file to build a new quiz.

---

## Files

```
gs-quiz-template/
├── index.html        — Quiz frontend (don't edit for new quizzes)
├── quiz-config.js    — THE ONLY FILE YOU EDIT per quiz
├── api/
│   └── submit.js     — Vercel serverless function (Mailchimp API)
├── vercel.json       — Routing config
└── README.md
```

---

## Deploy to Vercel

### 1. Push to a GitHub repo
```bash
cd gs-quiz-template
git init && git add . && git commit -m "init"
gh repo create gs-quiz-innovator --public --push --source=.
```

### 2. Import in Vercel
- Go to vercel.com → New Project → import the repo
- Set the following **Environment Variables** in Vercel project settings:

| Key | Value |
|-----|-------|
| `MAILCHIMP_API_KEY` | Your key from Mailchimp → Account → API keys |
| `MAILCHIMP_SERVER_PREFIX` | The suffix on your API key, e.g. `us21` |
| `MAILCHIMP_LIST_ID` | Your audience ID (GS: `17bb008ec3`) |

### 3. Deploy
Vercel auto-deploys on every push. That's it.

---

## Create a new quiz

1. Duplicate the folder: `cp -r gs-quiz-template gs-quiz-NEW-NAME`
2. Edit **only** `quiz-config.js`:
   - Update `title`, `subtitle`
   - Define your `questions` (single / multi / likert)
   - Define your `profiles` with matching `mcTag` values
   - Set `scoringMethod` to `"profile"` or `"weighted"`
3. In Mailchimp: create one **Tag** per profile that matches the `mcTag` value exactly
4. In Mailchimp: create a **Tag-based Automation** journey per tag
5. Deploy to a new Vercel project (or same repo, different branch)

---

## Scoring methods

### `"profile"` (default)
Each answer option has a `profile: "key"` — the key with the most selections wins.
Good for: personality quizzes, readiness assessments.

### `"weighted"`
Each answer option has a `points: N` — all points are summed.
Each profile has a `minScore: N` — highest threshold that's ≤ total wins.
Good for: maturity models, scoring rubrics.

---

## Mailchimp setup

### What the API does on each submission:
1. **Upsert** contact (creates or updates) with merge fields: FNAME, LNAME, ORG, TITLE, QUIZ_RESULT
2. **Apply tags**: the profile tag (e.g. `quiz-innovator-change-navigator`) + `quiz-completed`
3. **Add a note** with the raw answers (CRM context, non-fatal if it fails)

### Automation setup in Mailchimp:
- Journey trigger: **Tag is applied** → select the profile tag
- First email: your profile-specific content
- QUIZ_RESULT merge field is available in email templates as `*|QUIZ_RESULT|*`

### Merge fields to add in your Mailchimp audience:
| Tag | Type | Required |
|-----|------|----------|
| `ORG` | Text | No |
| `TITLE` | Text | No |
| `QUIZ_RESULT` | Text | No |
(FNAME, LNAME, EMAIL exist by default)

---

## Notes
- API keys never touch the browser — all Mailchimp calls happen server-side in `/api/submit.js`
- Contacts who retake the quiz get their QUIZ_RESULT merge field overwritten; old tags persist (remove manually or add cleanup logic if needed)
- The `quiz-completed` tag lets you segment "has ever taken a quiz" across all quiz variants

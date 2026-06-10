/**
 * api/submit.js — Vercel serverless function
 *
 * POST /api/submit
 * Body: { email, firstName, lastName, org, title, profileKey, mcTag, answers }
 *
 * Actions:
 *   1. Upsert contact into Mailchimp audience (add or update)
 *   2. Write merge fields (name, org, title)
 *   3. Apply result tag → triggers automation journey in Mailchimp
 *
 * Env vars required (set in Vercel project settings):
 *   MAILCHIMP_API_KEY        e.g. abc123-us21
 *   MAILCHIMP_SERVER_PREFIX  e.g. us21
 *   MAILCHIMP_LIST_ID        e.g. 17bb008ec3
 */

const crypto = require("crypto");

function md5(str) {
  return crypto.createHash("md5").update(str.toLowerCase()).digest("hex");
}

async function mailchimpRequest(method, path, body, apiKey, server) {
  const url = `https://${server}.api.mailchimp.com/3.0${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type":  "application/json",
      Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok && res.status !== 400) {
    // 400 can be "already subscribed" which is fine for upsert
    throw new Error(`Mailchimp ${method} ${path} → ${res.status}: ${data.detail || data.title}`);
  }
  return { status: res.status, data };
}

export default async function handler(req, res) {
  // CORS — allow the quiz frontend origin (tighten in production)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, firstName, lastName, org, title, profileKey, mcTag, answers } = req.body;

  if (!email || !mcTag) {
    return res.status(400).json({ error: "email and mcTag are required" });
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const SERVER  = process.env.MAILCHIMP_SERVER_PREFIX;
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;

  if (!API_KEY || !SERVER || !LIST_ID) {
    console.error("Missing Mailchimp env vars");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const subscriberHash = md5(email);

  try {
    // ── Step 1: Upsert member (PUT is idempotent — creates or updates) ──────
    await mailchimpRequest(
      "PUT",
      `/lists/${LIST_ID}/members/${subscriberHash}`,
      {
        email_address: email,
        status_if_new: "subscribed",   // only sets status on new contacts
        merge_fields: {
          FNAME:  firstName || "",
          LNAME:  lastName  || "",
          ORG:    org       || "",
          TITLE:  title     || "",
          // Store quiz result as a merge field for segmentation / personalisation
          QUIZ_RESULT: profileKey || "",
        },
      },
      API_KEY, SERVER
    );

    // ── Step 2: Apply result tag (triggers automation journey) ───────────────
    await mailchimpRequest(
      "POST",
      `/lists/${LIST_ID}/members/${subscriberHash}/tags`,
      {
        tags: [
          { name: mcTag, status: "active" },
          // Always apply a generic "took quiz" tag for list hygiene
          { name: "quiz-completed", status: "active" },
        ],
      },
      API_KEY, SERVER
    );

    // ── Step 3 (optional): log answers as a note for CRM context ────────────
    if (answers && Object.keys(answers).length > 0) {
      const noteText = Object.entries(answers)
        .map(([qId, val]) => `${qId}: ${Array.isArray(val) ? val.join(", ") : val}`)
        .join("\n");

      await mailchimpRequest(
        "POST",
        `/lists/${LIST_ID}/members/${subscriberHash}/notes`,
        { note: `Quiz answers:\n${noteText}\nResult: ${profileKey}` },
        API_KEY, SERVER
      ).catch(err => console.warn("Note creation failed (non-fatal):", err.message));
    }

    return res.status(200).json({ ok: true, profile: profileKey });

  } catch (err) {
    console.error("Mailchimp error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

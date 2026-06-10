/**
 * QUIZ CONFIG — edit this file to create a new quiz.
 * Everything else (quiz engine, Mailchimp API, UI) stays the same.
 */

const QUIZ_CONFIG = {

  // ─── Branding ─────────────────────────────────────────────────────────────
  title: "What Kind of Innovator Are You?",
  subtitle: "Answer a few questions to discover your innovation profile and receive a personalized guide.",
  logoUrl: "https://www.gettingsmart.com/wp-content/uploads/2024/09/cropped-gs-favicon-270x270.png",
  primaryColor: "#1c7293",
  accentColor:  "#4cbecf",
  warmColor:    "#F1DDCF",

  // ─── Scoring method ────────────────────────────────────────────────────────
  // "weighted"  → each answer has a `points` value; highest total wins
  // "profile"   → each answer maps to a profile key; most frequent wins
  scoringMethod: "profile",

  // ─── Questions ────────────────────────────────────────────────────────────
  // type: "single" | "multi" | "likert"
  // For "profile" scoring: each option has a `profile` key
  // For "weighted" scoring: each option has a `points` number
  questions: [
    {
      id: "q1",
      type: "multi",
      text: "We have the following in our district or organization:",
      subtext: "Select all that apply.",
      required: false,
      options: [
        { label: "Mastery-Based Grading",           profile: "transformer" },
        { label: "A Portrait or Profile of a Graduate", profile: "transformer" },
        { label: "Community-Connected Learning",    profile: "transformer" },
        { label: "Project-Based Learning",          profile: "navigator"   },
      ],
    },
    {
      id: "q2",
      type: "single",
      text: "Looking at how learning happens in your district, which statement feels most true right now?",
      required: true,
      options: [
        {
          label: "Our focus is mostly on content mastery, standardized testing, and teacher-led instruction. The structure is well-established and familiar.",
          profile: "traditionalist",
        },
        {
          label: "We have 'bright spots' of innovation—like individual pilots, new programs, or specific classrooms trying new things—but the whole system hasn't shifted yet.",
          profile: "navigator",
        },
        {
          label: "We have moved to learner-driven experiences. Students own their learning, and it often happens outside the classroom in real-world settings.",
          profile: "transformer",
        },
      ],
    },
    {
      id: "q3",
      type: "single",
      text: "Looking at how your systems (budget, hiring, vision) support that work, which feels more accurate?",
      required: true,
      options: [
        {
          label: "It feels like we have 'accumulation without alignment.' We rely on hero teachers to make things work, and we often deal with initiative fatigue from too many disconnected projects.",
          profile: "traditionalist",
        },
        {
          label: "Our systems reinforce each other. Our budget, hiring, and vision all point in the same direction, and we have a shared language for where we are going.",
          profile: "transformer",
        },
      ],
    },
  ],

  // ─── Contact fields ────────────────────────────────────────────────────────
  // These are collected at the end before submit.
  // `mcMergeField` maps to your Mailchimp audience merge fields.
  contactFields: [
    { id: "firstName", label: "First Name", type: "text",  required: true,  mcMergeField: "FNAME" },
    { id: "lastName",  label: "Last Name",  type: "text",  required: true,  mcMergeField: "LNAME" },
    { id: "email",     label: "Email",      type: "email", required: true,  mcMergeField: "EMAIL" },
    { id: "org",       label: "Organization", type: "text", required: false, mcMergeField: "ORG"   },
    { id: "title",     label: "Job Title",  type: "text",  required: true,  mcMergeField: "TITLE" },
  ],

  // ─── Result profiles ──────────────────────────────────────────────────────
  // `tag` must exactly match a Mailchimp tag that triggers an automation journey.
  // `mcTag` is applied to the contact in Mailchimp on submit.
  profiles: {
    traditionalist: {
      key:        "traditionalist",
      label:      "The Foundation Builder",
      tagline:    "Your strength is stability. The next step is movement.",
      description: "You operate within well-established systems and structures. Your community values consistency and trust. The opportunity ahead is using that solid foundation to pilot purposeful change without losing what makes your system work.",
      mcTag:      "quiz-innovator-foundation-builder",
    },
    navigator: {
      key:        "navigator",
      label:      "The Change Navigator",
      tagline:    "You can see the destination. Now comes the systems work.",
      description: "You have bright spots and early momentum. The challenge is moving from pockets of innovation to whole-system coherence—aligning budget, hiring, and vision so the work scales beyond your best classrooms.",
      mcTag:      "quiz-innovator-change-navigator",
    },
    transformer: {
      key:        "transformer",
      label:      "The Systems Transformer",
      tagline:    "You're building the school of the future. Keep wayfinding.",
      description: "Your district has made the shift. Learners drive their own experiences, and your systems reinforce that vision. Your work now is sustaining that coherence, documenting what's working, and inspiring others to follow.",
      mcTag:      "quiz-innovator-systems-transformer",
    },
  },

  // ─── Fallback profile ─────────────────────────────────────────────────────
  // Used if scoring is tied or no answers given for scored questions.
  fallbackProfile: "navigator",

  // ─── Result page CTA ──────────────────────────────────────────────────────
  resultCta: {
    text: "Explore the Learning Innovation Framework",
    url:  "https://www.gettingsmart.com/learning-innovation-framework/",
  },

  // ─── Email confirmation shown on-screen after submit ──────────────────────
  confirmationMessage: "Your innovator profile is on its way to your inbox. Check your email for your personalized guide.",
};

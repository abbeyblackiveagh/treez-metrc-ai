// src/api.js
// All Claude calls go through /api/claude — your API key never touches the browser

const STATES = [
  { code: "AK", name: "Alaska", slug: "alaska" },
  { code: "AZ", name: "Arizona", slug: "arizona" },
  { code: "CA", name: "California", slug: "california" },
  { code: "CO", name: "Colorado", slug: "colorado" },
  { code: "CT", name: "Connecticut", slug: "connecticut" },
  { code: "IL", name: "Illinois", slug: "illinois" },
  { code: "KY", name: "Kentucky", slug: "kentucky" },
  { code: "LA", name: "Louisiana", slug: "louisiana" },
  { code: "MA", name: "Massachusetts", slug: "massachusetts" },
  { code: "MD", name: "Maryland", slug: "maryland" },
  { code: "ME", name: "Maine", slug: "maine" },
  { code: "MI", name: "Michigan", slug: "michigan" },
  { code: "MN", name: "Minnesota", slug: "minnesota" },
  { code: "MO", name: "Missouri", slug: "missouri" },
  { code: "MT", name: "Montana", slug: "montana" },
  { code: "NJ", name: "New Jersey", slug: "new-jersey" },
  { code: "NM", name: "New Mexico", slug: "new-mexico" },
  { code: "NV", name: "Nevada", slug: "nevada" },
  { code: "OH", name: "Ohio", slug: "ohio" },
  { code: "OK", name: "Oklahoma", slug: "oklahoma" },
  { code: "OR", name: "Oregon", slug: "oregon" },
  { code: "SD", name: "South Dakota", slug: "south-dakota" },
  { code: "VA", name: "Virginia", slug: "virginia" },
  { code: "WV", name: "West Virginia", slug: "west-virginia" },
];

export { STATES };

async function callClaude(body) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

export async function fetchBulletinsForState(slug, stateName) {
  const data = await callClaude({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{
      role: "user",
      content: `Search metrc.com for the official bulletin list for ${stateName} (state slug: ${slug}). Look at pages like https://www.metrc.com/partner/${slug}/ or https://www.metrc.com/information-and-materials/bulletin-archive/ and extract all bulletins for this state.

Return ONLY a valid JSON array. Each object must have:
- id: bulletin number string (e.g. "CA_IB_0045")
- title: bulletin title string
- date: date string in YYYY-MM-DD format, or null
- url: full PDF URL string if available, or null
- summary: one sentence description

No markdown, no backticks, no explanation. Just the JSON array.`
    }]
  });

  const text = data.content.map(b => b.type === "text" ? b.text : "").join("");
  const clean = text.replace(/```json|```/g, "").trim();
  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) return [];
  return JSON.parse(match[0]);
}

export async function summarizeBulletin(bulletin) {
  const data = await callClaude({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{
      role: "user",
      content: `Fetch and summarize this Metrc bulletin: ${bulletin.url ? bulletin.url : `Bulletin ${bulletin.id}: ${bulletin.title}`}

Return ONLY a valid JSON object with:
- summary: 2-3 sentence plain-English summary of what changed or was announced
- effectiveDate: YYYY-MM-DD string or null
- keyPoints: array of up to 4 short bullet strings
- category: exactly one of "system-update", "compliance", "new-feature", "policy-change", "training"

No markdown, no backticks, no explanation. Just the JSON object.`
    }]
  });

  const text = data.content.map(b => b.type === "text" ? b.text : "").join("");
  const clean = text.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) return null;
  return JSON.parse(match[0]);
}

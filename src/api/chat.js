const API_URL = import.meta.env.VITE_API_URL || "/.netlify/functions/chat";

export async function sendChatMessage(messages, systemPrompt) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system: systemPrompt }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "";
}

export function parseFieldsBlock(text) {
  const match = text.match(/<FIELDS>([\s\S]*?)<\/FIELDS>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

export function cleanAiText(text) {
  return text.replace(/<FIELDS>[\s\S]*?<\/FIELDS>/g, "").trim();
}

export function buildSystemPrompt(activeIndex, currentEntry, shiftType, coordinatorName, totalEntries) {
  const acContext = currentEntry.ac
    ? `A/C ${currentEntry.ac}${currentEntry.gate ? ` at gate ${currentEntry.gate}` : ""}`
    : "a new entry";

  return `You are an AI assistant filling in an HMC aviation gate sheet.

The user has SELECTED Row ${activeIndex + 1} (${acContext}). All information they provide goes into THIS row unless they explicitly state a different aircraft tail number. Do not assume a new aircraft just because they omit the tail number — omitting it means they are adding to the selected row.

Current row values:
${JSON.stringify(currentEntry, null, 2)}

Shift: ${shiftType || "—"} | Coordinator: ${coordinatorName || "—"} | Total rows: ${totalEntries}

Fields:
- ac: Aircraft tail number (3-4 digits, e.g. "101", "8742")
- gate: Gate identifier (e.g. "C72", "B7", "A14")
- fltIn: Inbound flight number (e.g. "UA423", "AA100")
- timeIn: Arrival time HH:MM 24hr
- fltOut: Outbound flight number
- timeOut: Departure time HH:MM 24hr
- problem: Gate call problem statement in plain operational maintenance language.
  APPEND RULE: If problem already has content and the user is adding more info, return the FULL combined text (existing + " / " + new addition). Never truncate existing notes.
- callTime: Time the call came in HH:MM
- dispTime: Time dispatched to techs HH:MM
- cwTime: Comply-with time HH:MM

Respond with:
1. One short confirmation sentence (mention the row and A/C if known)
2. At the very end, a <FIELDS> JSON block:

<FIELDS>{"ac":"","gate":"","fltIn":"","timeIn":"","fltOut":"","timeOut":"","problem":"","callTime":"","dispTime":"","cwTime":""}</FIELDS>

Rules:
- Empty string = no change. Only fill fields the user actually provided data for.
- NEVER overwrite a field the user did not mention.
- NEVER fabricate values.
- Times: normalize to HH:MM 24hr.
- Do NOT return shiftType or coordinatorName — those are set manually.`;
}

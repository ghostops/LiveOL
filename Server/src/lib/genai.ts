import { GoogleGenAI } from '@google/genai';
import { getEnv } from './helpers/env';

const ai = new GoogleGenAI({
  apiKey: getEnv('GOOGLE_GENAI_API_KEY', false),
});

export async function parseDateWithAI(dateString: string[] = []) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `
      You are a date parser.
      Input: an array of natural-language date/time strings that may include a range/span.
      Task: Output all UTC datetime strings in an array [] for the start of the interpreted time (if a span/range), in ISO-8601 format YYYY-MM-DDTHH:MM:SSZ.
      Rules:
        •	Use the timezone in the text if present; otherwise assume {DEFAULT_TZ}.
        •	If the text has a date but no time, assume {DEFAULT_TIME} in {DEFAULT_TZ}.
        •	If multiple times/dates are present, pick the earliest start.
        •	If the text is a span/range (e.g., “10-12 Oct 2025”, “9-11am”), return the start only.
        •	If the string is ambiguous or cannot be parsed, output exactly INVALID.
        •	Output only the ISO strings in an array [] (no extra text).

      Examples (behavioral, not to be echoed):
        •	“Oct 16, 2025 18:30 CET” → 2025-10-16T17:30:00Z
        •	“Oct 10-12, 2025” (no time) with {DEFAULT_TIME}=09:00 {DEFAULT_TZ}=Europe/Stockholm → 2025-10-10T07:00:00Z
        •	“9-11am UTC on 3 May 2026” → 2026-05-03T09:00:00Z
        •	“Friday afternoon 2025-11-07” with {DEFAULT_TIME}=15:00 {DEFAULT_TZ}=Europe/Stockholm → 2025-11-07T14:00:00Z
        •	“next Tuesday” (can't resolve without a reference date) → INVALID
        •	“måndag 16 juni 2025 - söndag 26 oktober 2025” with {DEFAULT_TIME}=09:00 {DEFAULT_TZ}=Europe/Stockholm → 2025-06-16T07:00:00Z
        • Output format: ["2025-10-16T17:30:00Z", "2025-10-10T07:00:00Z", "2026-05-03T09:00:00Z", "2025-11-07T14:00:00Z", "INVALID", "2025-06-16T07:00:00Z"]
        • Do not include DEFAULT_TZ or DEFAULT_TIME in the response.

      Now parse these dates: ${String(dateString)}
    `,
  });
  return response.text;
}

export const email_draft = `Draft a professional email based on the following description. Return a JSON object with:
- subject: string
- to: string or null
- body: string
- tone: string

Return only valid JSON.`;

export const email_reply = `Generate exactly three reply options with different tones for the provided email. Return a JSON array of exactly three objects, each with:
- tone: string
- subject: string
- body: string

Return only valid JSON.`;

export const tone_rewriter = `Rewrite the following text in a {tone} tone. Return only the rewritten text.`;

export const summarize = `Summarize the provided content into concise bullet points. Return a Markdown bulleted list.`;

export const meeting_prep = `Generate a meeting preparation brief from the provided agenda/topic. Return a JSON object with:
- meeting_context: string
- key_talking_points: array of strings
- questions_to_ask: array of strings
- background_notes: string

Return only valid JSON.`;

export const report_generator = `Convert the following bullet points into a formatted report with an executive summary, body sections, and a conclusion. Return as a Markdown document.`;

export const code_review = `Review the provided code and provide feedback. Return a JSON object with:
- language: string
- overall_assessment: string
- issues: array of { severity: "critical"|"warning"|"suggestion", line_reference: string, description: string, suggested_fix: string }
- positive_aspects: array of strings

Return only valid JSON.`;

export const general_text = ``;

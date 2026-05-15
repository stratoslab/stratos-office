export const transcription = `Transcribe the provided audio into a formatted transcript. Use Markdown formatting with speaker-turn paragraphs and timestamps where detectable.`;

export const meeting_minutes = `Generate structured meeting minutes from the provided transcript. Return a JSON object with:
- meeting_title: string
- date: string or null
- attendees: array of strings or null
- agenda_items: array of strings
- discussion_summary: string
- decisions: array of strings
- action_items: array of { owner: string, task: string, due_date: string }

Return only valid JSON.`;

export const voice_to_email = `Convert the provided transcript into a polished email draft. Return a JSON object with:
- subject: string
- to: string or null
- body: string
- tone: string

Return only valid JSON.`;

export const multilingual_transcription = `Transcribe the provided audio and provide both the original-language transcript and an English translation. Return a JSON object with:
- detected_language: string
- original_transcript: string
- english_translation: string

Return only valid JSON.`;

export const interview_transcriber = `Transcribe the provided interview audio into a formatted Q&A transcript. Use alternating **Q:** and **A:** blocks.`;

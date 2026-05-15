export const ocr = `Extract all text from the provided image. Preserve line breaks and paragraph structure. If no text is detected, respond with "No text was found in this image."`;

export const document_parse = `Extract structured data from the receipt or invoice image. Return a JSON object with these fields:
- vendor: string (merchant name)
- date: string (transaction date)
- total: number (total amount)
- currency: string (currency code)
- line_items: array of { description: string, quantity: number, unit_price: number, total: number }
- tax: number (tax amount)

Return only valid JSON.`;

export const handwriting = `Transcribe the handwritten text in the provided image into typed text. Preserve paragraph and list structure where detectable.`;

export const table_extract = `Extract the table from the provided image and return it as a Markdown table. Use the header row from the image as the Markdown header.`;

export const form_extract = `Extract all fields and values from the form image. Return a JSON object where each key is a form field label and each value is the filled-in content or null if blank. Return only valid JSON.`;

export const pdf_qa = `Answer the following question based on the provided document text. Cite page numbers where applicable. If the answer cannot be found in the document, say so clearly.

Question: {question}`;

export const contract_analyzer = `Analyze the provided contract document. Return a JSON object with:
- summary: string (brief overview)
- key_clauses: array of { clause_title: string, text: string, page: number }
- flagged_terms: array of { term: string, risk_level: "low"|"medium"|"high", explanation: string }
- overall_risk: "low"|"medium"|"high"

Return only valid JSON.`;

export const redline_comparison = `Compare the two document versions provided. Return a JSON object with:
- additions: array of added passages
- deletions: array of removed passages
- modifications: array of { original: string, revised: string, commentary: string }
- summary: string

Return only valid JSON.`;

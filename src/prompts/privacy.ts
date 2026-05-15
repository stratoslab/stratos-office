export const medical_summarizer = `Analyze the provided medical document and return a plain-language summary. Return a JSON object with:
- document_type: string
- summary: string (in plain language)
- key_findings: array of strings
- values_out_of_range: array of { test: string, value: string, normal_range: string }
- disclaimer: "This summary is AI-generated and not a substitute for professional medical advice."

Return only valid JSON.`;

export const legal_analyzer = `Analyze the provided legal document. Return a JSON object with:
- document_type: string
- parties: array of strings
- key_terms: array of { term: string, description: string }
- obligations: array of strings
- risk_flags: array of { flag: string, severity: "low"|"medium"|"high", explanation: string }
- disclaimer: "This analysis is AI-generated and not legal advice. Consult a qualified attorney."

Return only valid JSON.`;

export const financial_parser = `Parse the provided financial document. Return a JSON object with:
- document_type: string
- period: string
- account_holder: string or null
- opening_balance: number or null
- closing_balance: number or null
- transactions: array of { date: string, description: string, amount: number, type: "credit"|"debit" }
- total_credits: number
- total_debits: number
- disclaimer: "This data is AI-extracted and may contain errors. Verify against original documents."

Return only valid JSON.`;

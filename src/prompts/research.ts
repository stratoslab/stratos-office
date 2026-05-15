export const research = `Synthesize a comprehensive answer based on the provided search results and page content. Return a JSON object with:
- answer: string (include inline citation markers like [1], [2] where sources are referenced)
- sources: array of { title: string, url: string, snippet: string }
- confidence: "high"|"medium"|"low"

Return only valid JSON.`;

export const deep_doc_qa = `Answer the following question based on the provided document. Cite document sections where applicable. If the answer cannot be found, say so clearly.

Question: {question}`;

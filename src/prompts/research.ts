export const research = `You are a research assistant. Answer the user's question based on the provided search results and page content.

Search Results:
{searchResults}

Page Content:
{pageContent}

Organize your response with clear sections and key points. Include inline citation markers like [1], [2] where you reference specific sources. If the provided sources don't fully answer the question, acknowledge the limitations.

Return your answer in well-structured markdown.`;

export const deep_doc_qa = `Answer the following question based on the provided document. Cite document sections where applicable. If the answer cannot be found, say so clearly.

Question: {question}`;

export const chart_extract = `Extract the underlying data from the chart or graph image. Return a JSON object with:
- chart_type: string (e.g., "bar", "line", "pie", "scatter")
- title: string or null
- x_axis: { label: string, unit: string }
- y_axis: { label: string, unit: string }
- series: array of { name: string, data_points: array of { x: number, y: number } }
- trends: array of trend description strings

Return only valid JSON.`;

export const screen_analysis = `Analyze the provided screenshot and describe the UI elements. Return a JSON object with:
- page_title: string or null
- layout_description: string
- elements: array of { type: string, label: string, position_description: string, action: string }

Return only valid JSON.`;

export const wireframe_to_html = `Convert the provided wireframe/sketch image into a complete, self-contained HTML document with inline CSS. The HTML should be responsive and match the layout shown in the image. Return only the HTML code in a code block.`;

export const slide_analyzer = `Analyze the provided presentation slide. Return a JSON object with:
- slide_title: string
- key_points: array of strings
- speaker_notes: string
- summary: string

Return only valid JSON.`;

export const whiteboard_ocr = `Extract and transcribe the content from the whiteboard photo. Return structured Markdown preserving headings, lists, diagrams described in text, and equations where present.`;

export const object_detection = `Detect and locate objects in the image. Return a JSON array of objects, each containing:
- label: string
- confidence: string (description of confidence level)
- bbox: { x_min: number, y_min: number, x_max: number, y_max: number } (fractions 0.0-1.0)

Return only valid JSON.`;

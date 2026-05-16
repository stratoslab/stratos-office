# Requirements: Pipeline UX

## Introduction

Each of the 8 pipeline templates needs a dedicated UX that guides users through the specific workflow, shows domain-relevant inputs, and presents outputs in a context-appropriate format. The current generic PipelineWorkspace treats all pipelines identically, which fails to leverage the domain-specific nature of each workflow.

## Glossary

- **Pipeline Template**: A predefined chain of tasks with specific input/output mappings
- **Step Output**: The result of a single task execution within a pipeline
- **Combined Output**: The merged result of all pipeline steps
- **Domain UX**: User interface elements specific to a pipeline's use case

## Requirements

### Requirement 1: Due Diligence Engine UX

**User Story:** As an investor, I want to upload financial statements and contracts, see structured financial data extraction, contract risk analysis, legal risk flags, and a final investment memo, so that I can make informed investment decisions.

#### Acceptance Criteria

1. WHEN the user opens Due Diligence THEN the system SHALL display two upload zones: "Financial Statements (PDF/Image)" and "Contracts (PDF/Image)"
2. WHEN files are uploaded THEN the system SHALL show a preview of each file with file name and size
3. WHEN the pipeline runs THEN the system SHALL display each step with domain-relevant labels: "Extract Financial Data", "Analyze Contracts", "Assess Legal Risk", "Generate Investment Memo"
4. WHEN financial_parser completes THEN the system SHALL display extracted data in a structured table format (vendor, date, total, currency, line items, tax)
5. WHEN contract_analyzer completes THEN the system SHALL display risk levels (low/medium/high) with color coding
6. WHEN legal_analyzer completes THEN the system SHALL display risk flags with severity indicators
7. WHEN the pipeline completes THEN the system SHALL display the investment memo as the primary output with a "Download as PDF" button

#### Correctness Properties

- **Property 1:** Financial data SHALL be displayed in tabular format when parsed output is valid JSON
- **Property 2:** Risk levels SHALL be color-coded: green (low), yellow (medium), red (high)
- **Property 3:** The final memo SHALL include all previous step outputs as referenced sections

---

### Requirement 2: Meeting Intelligence UX

**User Story:** As a meeting participant, I want to upload a meeting recording and get a transcript, structured minutes with action items, follow-up emails, and next meeting prep, so that I can stay organized without manual note-taking.

#### Acceptance Criteria

1. WHEN the user opens Meeting Intelligence THEN the system SHALL display an audio/video upload zone with a "Record Live" option
2. WHEN a recording is uploaded THEN the system SHALL show file name, duration (if available), and file size
3. WHEN transcription completes THEN the system SHALL display the transcript in a scrollable panel with speaker labels (if detected)
4. WHEN meeting_minutes completes THEN the system SHALL display structured minutes with: meeting title, date, attendees, agenda items, decisions, and action items
5. WHEN email_draft completes THEN the system SHALL display the drafted email with subject, to, body, and tone
6. WHEN meeting_prep completes THEN the system SHALL display the prep brief with context, talking points, questions, and background notes
7. WHEN the pipeline completes THEN the system SHALL offer "Copy All" and "Export as PDF" buttons

#### Correctness Properties

- **Property 1:** Action items SHALL be displayed as a checklist with owner and due date fields
- **Property 2:** The transcript SHALL be scrollable independently of other step outputs
- **Property 3:** Email drafts SHALL include a "Copy to Clipboard" button for the body text

---

### Requirement 3: Product Discovery UX

**User Story:** As a product manager, I want to upload whiteboard photos and competitor screenshots, see extracted notes, generated HTML wireframes, screen analysis, and a final PRD, so that I can quickly move from ideation to documentation.

#### Acceptance Criteria

1. WHEN the user opens Product Discovery THEN the system SHALL display two upload zones: "Whiteboard Photos" and "Competitor Screenshots"
2. WHEN images are uploaded THEN the system SHALL display image previews in a grid
3. WHEN whiteboard_ocr completes THEN the system SHALL display extracted notes in markdown format
4. WHEN wireframe_to_html completes THEN the system SHALL display the generated HTML in a preview frame with a "Copy HTML" button
5. WHEN screen_analysis completes THEN the system SHALL display detected UI elements in a structured list
6. WHEN the pipeline completes THEN the system SHALL display the PRD as the primary output

#### Correctness Properties

- **Property 1:** Image previews SHALL be displayed at a maximum of 200px width to fit the panel
- **Property 2:** The HTML preview SHALL be rendered in an iframe to isolate styles
- **Property 3:** The PRD SHALL reference extracted whiteboard notes and screen analysis results

---

### Requirement 4: Compliance Auditor UX

**User Story:** As a compliance officer, I want to upload contracts and medical records, see contract analysis, legal risk flags, medical summaries, and a final compliance report, so that I can ensure regulatory compliance.

#### Acceptance Criteria

1. WHEN the user opens Compliance Auditor THEN the system SHALL display two upload zones: "Contracts (PDF/Image)" and "Medical Records (PDF/Image)"
2. WHEN files are uploaded THEN the system SHALL show a privacy notice banner: "All data is processed locally. No data leaves your device."
3. WHEN contract_analyzer completes THEN the system SHALL display key clauses and flagged terms
4. WHEN legal_analyzer completes THEN the system SHALL display risk flags with severity and explanations
5. WHEN medical_summarizer completes THEN the system SHALL display a medical disclaimer: "AI-generated summary, not professional medical advice"
6. WHEN the pipeline completes THEN the system SHALL display the compliance report with regulation citations

#### Correctness Properties

- **Property 1:** The privacy notice SHALL be displayed before any file upload
- **Property 2:** Medical summaries SHALL always include the disclaimer banner
- **Property 3:** Risk flags SHALL be sorted by severity (high first)

---

### Requirement 5: Research Synthesis UX

**User Story:** As a researcher, I want to enter a research question, optionally upload research papers, see web search results, paper analysis, chart data extraction, and a final cited report, so that I can synthesize research efficiently.

#### Acceptance Criteria

1. WHEN the user opens Research Synthesis THEN the system SHALL display a text input for the research question and an optional PDF upload zone
2. WHEN the research question is entered THEN the system SHALL show a "Run Research" button
3. WHEN research completes THEN the system SHALL display search results with titles, URLs, and snippets
4. WHEN deep_doc_qa completes THEN the system SHALL display the paper analysis with citations
5. WHEN chart_extract completes THEN the system SHALL display extracted chart data in a table
6. WHEN the pipeline completes THEN the system SHALL display the cited report with inline citation markers [1], [2], etc.

#### Correctness Properties

- **Property 1:** Citation markers in the final report SHALL correspond to the search results displayed in step 1
- **Property 2:** Chart data SHALL be displayed in a table with column headers matching the chart axes
- **Property 3:** The research question SHALL be preserved and displayed at the top of the final report

---

### Requirement 6: Negotiation Prep UX

**User Story:** As a negotiator, I want to upload a contract and negotiation call recordings, see contract analysis, call transcripts, counter-proposals in multiple tones, and follow-up emails, so that I can prepare effectively for negotiations.

#### Acceptance Criteria

1. WHEN the user opens Negotiation Prep THEN the system SHALL display two upload zones: "Contract (PDF/Image)" and "Negotiation Call Recordings (Audio/Video)"
2. WHEN contract_analyzer completes THEN the system SHALL display key clauses and risk assessment
3. WHEN transcription completes THEN the system SHALL display the call transcript
4. WHEN tone_rewriter completes THEN the system SHALL display counter-proposals in at least 3 tones (firm, collaborative, walk-away)
5. WHEN email_draft completes THEN the system SHALL display the follow-up email draft
6. WHEN the pipeline completes THEN the system SHALL offer "Copy All Proposals" and "Export as PDF" buttons

#### Correctness Properties

- **Property 1:** Counter-proposals SHALL be displayed in separate panels, one per tone
- **Property 2:** Each tone panel SHALL have a distinct visual indicator (color or icon)
- **Property 3:** The final output SHALL include the contract analysis summary as context

---

### Requirement 7: Incident Response UX

**User Story:** As an engineer, I want to upload error screenshots and paste relevant code, see screen analysis, code review, a post-mortem report, and stakeholder communication drafts, so that I can respond to incidents quickly.

#### Acceptance Criteria

1. WHEN the user opens Incident Response THEN the system SHALL display an image upload zone for screenshots and a text area for code
2. WHEN screenshots are uploaded THEN the system SHALL display image previews
3. WHEN screen_analysis completes THEN the system SHALL display detected UI elements and error indicators
4. WHEN code_review completes THEN the system SHALL display issues with severity ratings (critical, warning, suggestion)
5. WHEN report_generator completes THEN the system SHALL display the post-mortem report
6. WHEN email_draft completes THEN the system SHALL display the stakeholder communication draft
7. WHEN the pipeline completes THEN the system SHALL offer "Copy Post-Mortem" and "Copy Email" buttons

#### Correctness Properties

- **Property 1:** Code review issues SHALL be sorted by severity (critical first)
- **Property 2:** The post-mortem SHALL reference both the screen analysis and code review findings
- **Property 3:** The stakeholder email SHALL be written in a professional, non-technical tone

---

### Requirement 8: Customer Intelligence UX

**User Story:** As a customer success manager, I want to upload support call recordings, see transcripts, summarized pain points, tone-adapted responses, and customer reply drafts, so that I can improve customer relationships.

#### Acceptance Criteria

1. WHEN the user opens Customer Intelligence THEN the system SHALL display an audio upload zone for call recordings
2. WHEN transcription completes THEN the system SHALL display the call transcript
3. WHEN summarize completes THEN the system SHALL display pain points as a bulleted list
4. WHEN tone_rewriter completes THEN the system SHALL display the adapted response
5. WHEN email_reply completes THEN the system SHALL display the customer reply draft
6. WHEN the pipeline completes THEN the system SHALL offer "Copy Reply" and "Export as PDF" buttons

#### Correctness Properties

- **Property 1:** Pain points SHALL be extracted as discrete bullet points
- **Property 2:** The customer reply SHALL reference the summarized pain points
- **Property 3:** The tone of the reply SHALL match the tone specified in the tone_rewriter step

---

### Requirement 9: Consistent Pipeline UX Patterns

**User Story:** As a user of any pipeline, I want a consistent experience across all pipelines so that I can learn the interface once and apply it everywhere.

#### Acceptance Criteria

1. ALL pipelines SHALL display a step indicator showing progress through the pipeline
2. ALL pipelines SHALL show streaming output for the currently running step
3. ALL pipelines SHALL allow cancellation during execution
4. ALL pipelines SHALL offer retry/skip/abort on step failure
5. ALL pipelines SHALL display completed step outputs in expandable sections
6. ALL pipelines SHALL offer a "Combined Output" view that merges all step results
7. ALL pipelines SHALL have a "New Run" button after completion to start fresh

#### Correctness Properties

- **Property 1:** The step indicator SHALL use consistent colors: gray (pending), blue (running), green (complete), red (error), dashed gray (skipped)
- **Property 2:** Streaming output SHALL update at least 10 times per second
- **Property 3:** Cancellation SHALL preserve all completed step outputs

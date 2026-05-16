# Design: Pipeline UX

## Overview

Create dedicated UX components for each of the 8 pipeline templates, replacing the generic PipelineWorkspace with specialized interfaces that guide users through domain-specific workflows. Each pipeline gets its own workspace component with tailored input zones, step-specific output displays, and domain-appropriate formatting.

## Architecture

```
DashboardPage
  ├── PipelineSelector (existing)
  └── PipelineWorkspace (existing - becomes router)
        ├── DueDiligenceWorkspace (new)
        ├── MeetingIntelligenceWorkspace (new)
        ├── ProductDiscoveryWorkspace (new)
        ├── ComplianceAuditorWorkspace (new)
        ├── ResearchSynthesisWorkspace (new)
        ├── NegotiationPrepWorkspace (new)
        ├── IncidentResponseWorkspace (new)
        └── CustomerIntelligenceWorkspace (new)
```

Each workspace component:
- Uses the existing PipelineContext for execution
- Renders domain-specific input zones
- Shows step-specific output formatting
- Maintains consistent pipeline patterns (step indicator, streaming, error handling)

## Components

### Component 1: DueDiligenceWorkspace

**Responsibility:** Handle financial statements and contracts input, display structured financial data, contract risks, legal flags, and investment memo.

**Interface:**
- Props: `template: PipelineTemplate`
- Uses: `usePipeline()` for execution state

**Key UI Elements:**
- Two upload zones: Financial Statements, Contracts
- Financial data table (when parsed output is JSON)
- Risk level badges (color-coded: green/yellow/red)
- Investment memo as final output

**Dependencies:** PipelineContext, FileUploadZone, PipelineStepIndicator, PipelineOutputPanel

---

### Component 2: MeetingIntelligenceWorkspace

**Responsibility:** Handle audio/video recording input, display transcript, structured minutes, email drafts, and meeting prep.

**Key UI Elements:**
- Audio upload zone with "Record Live" option (uses existing AudioRecorderWidget)
- Scrollable transcript panel
- Structured minutes with action items checklist
- Email draft display with copy button
- Meeting prep brief display

**Dependencies:** PipelineContext, AudioRecorderWidget, FileUploadZone

---

### Component 3: ProductDiscoveryWorkspace

**Responsibility:** Handle whiteboard photos and screenshots, display extracted notes, HTML wireframes, screen analysis, and PRD.

**Key UI Elements:**
- Two image upload zones: Whiteboard Photos, Competitor Screenshots
- Image preview grid (max 200px width)
- HTML preview frame (iframe)
- Screen analysis as structured list
- PRD as final output

**Dependencies:** PipelineContext, FileUploadZone, HtmlPreviewFrame

---

### Component 4: ComplianceAuditorWorkspace

**Responsibility:** Handle contracts and medical records, display contract analysis, legal risks, medical summaries, and compliance report.

**Key UI Elements:**
- Privacy notice banner (always visible)
- Two upload zones: Contracts, Medical Records
- Risk flags sorted by severity
- Medical disclaimer banner
- Compliance report with regulation citations

**Dependencies:** PipelineContext, FileUploadZone, DisclaimerBanner

---

### Component 5: ResearchSynthesisWorkspace

**Responsibility:** Handle research question and optional papers, display search results, paper analysis, chart data, and cited report.

**Key UI Elements:**
- Text input for research question
- Optional PDF upload zone
- Search results display (titles, URLs, snippets)
- Chart data table
- Cited report with inline markers

**Dependencies:** PipelineContext, FileUploadZone

---

### Component 6: NegotiationPrepWorkspace

**Responsibility:** Handle contract and call recordings, display contract analysis, transcripts, counter-proposals in multiple tones, and follow-up emails.

**Key UI Elements:**
- Two upload zones: Contract, Call Recordings
- Contract analysis display
- Transcript panel
- Counter-proposals in 3 tone panels (firm, collaborative, walk-away)
- Follow-up email draft

**Dependencies:** PipelineContext, FileUploadZone, AudioRecorderWidget

---

### Component 7: IncidentResponseWorkspace

**Responsibility:** Handle error screenshots and code, display screen analysis, code review, post-mortem, and stakeholder comms.

**Key UI Elements:**
- Image upload zone for screenshots
- Text area for code input
- Screen analysis display
- Code review issues sorted by severity
- Post-mortem report
- Stakeholder email draft

**Dependencies:** PipelineContext, FileUploadZone

---

### Component 8: CustomerIntelligenceWorkspace

**Responsibility:** Handle support call recordings, display transcripts, pain points, tone-adapted responses, and customer replies.

**Key UI Elements:**
- Audio upload zone for call recordings
- Transcript panel
- Pain points as bulleted list
- Tone-adapted response display
- Customer reply draft with copy button

**Dependencies:** PipelineContext, AudioRecorderWidget, FileUploadZone

---

## Data Flow

Each workspace follows the same data flow pattern:

1. **Input Phase:** User uploads files/enters text specific to the pipeline domain
2. **Execution Phase:** PipelineContext runs steps sequentially
3. **Output Phase:** Each step's output is displayed in domain-specific format
4. **Completion Phase:** Combined output is available with export options

```
User Input → PipelineContext.setPipelineInput()
           → PipelineContext.runPipeline()
           → PipelineContext.run (state updates)
           → Workspace renders step outputs
           → User exports/copies results
```

## Key Algorithms

### Output Formatting by Step Type

```typescript
function formatStepOutput(step: PipelineStepRun, config: TaskConfig): ReactNode {
  switch (step.taskType) {
    case 'financial_parser':
      return <FinancialDataTable data={step.parsedOutput} />;
    case 'contract_analyzer':
      return <ContractAnalysisDisplay data={step.parsedOutput} />;
    case 'legal_analyzer':
      return <LegalRiskFlags data={step.parsedOutput} />;
    case 'transcription':
      return <TranscriptPanel text={step.output} />;
    case 'meeting_minutes':
      return <MeetingMinutesDisplay data={step.parsedOutput} />;
    case 'email_draft':
      return <EmailDraftDisplay data={step.parsedOutput} />;
    case 'report_generator':
      return <ReportDisplay content={step.output} />;
    default:
      return <MarkdownRenderer content={step.output} />;
  }
}
```

### Risk Level Color Coding

```typescript
const riskColors = {
  low: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
  medium: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', border: 'rgba(234, 179, 8, 0.3)' },
  high: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
};
```

## Error Handling

All workspaces inherit error handling from PipelineContext:
- Step failure shows Retry/Skip/Abort buttons
- Error messages displayed in red banner
- Completed steps preserved on failure
- Cancellation preserves all completed outputs

## Testing Strategy

1. **Unit Tests:** Each workspace component renders correctly with mock pipeline state
2. **Integration Tests:** Pipeline execution flows through all steps with correct output formatting
3. **Property-Based Tests:** Output formatting functions handle edge cases (empty data, malformed JSON, etc.)

## Requirements Traceability

| Requirement | Satisfied By |
|-------------|-------------|
| Req 1: Due Diligence UX | DueDiligenceWorkspace component |
| Req 2: Meeting Intelligence UX | MeetingIntelligenceWorkspace component |
| Req 3: Product Discovery UX | ProductDiscoveryWorkspace component |
| Req 4: Compliance Auditor UX | ComplianceAuditorWorkspace component |
| Req 5: Research Synthesis UX | ResearchSynthesisWorkspace component |
| Req 6: Negotiation Prep UX | NegotiationPrepWorkspace component |
| Req 7: Incident Response UX | IncidentResponseWorkspace component |
| Req 8: Customer Intelligence UX | CustomerIntelligenceWorkspace component |
| Req 9: Consistent Patterns | Shared PipelineStepIndicator, PipelineOutputPanel, error handling |

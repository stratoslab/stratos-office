# Tasks: Pipeline UX

## Overview

Implement dedicated UX components for all 8 pipeline templates, replacing the generic PipelineWorkspace with specialized interfaces. Each workspace has domain-specific input zones, step output formatting, and consistent pipeline patterns.

## Task Dependency Graph

```
Task 1 (types) → Task 2 (shared helpers)
                              ↓
Task 3 (due-diligence)    Task 5 (product-discovery)    Task 7 (research-synthesis)    Task 9 (incident-response)
Task 4 (meeting-intel)    Task 6 (compliance)           Task 8 (negotiation)           Task 10 (customer-intel)
                              ↓
                    Task 11 (dashboard routing)
                              ↓
                    Task 12 (tests)
```

## Tasks

- [ ] **Task 1: Add Pipeline Output Display Types**
  - **What:** Add types for formatted step outputs to `src/types/index.ts`
  - **Files:** `src/types/index.ts`
  - **Done when:** Types compile without errors, exported and importable
  - **Depends on:** none

- [ ] **Task 2: Create Shared Pipeline Output Helpers**
  - **What:** Create `src/components/pipelines/PipelineOutputHelpers.tsx` with reusable output formatting components (FinancialDataTable, RiskLevelBadge, TranscriptPanel, etc.)
  - **Files:** `src/components/pipelines/PipelineOutputHelpers.tsx`
  - **Done when:** All helper components render correctly with mock data, TypeScript compiles
  - **Depends on:** Task 1

- [ ] **Task 3: Implement DueDiligenceWorkspace**
  - **What:** Create `src/components/pipelines/DueDiligenceWorkspace.tsx` with two upload zones (financial statements, contracts), financial data table, risk badges, investment memo display
  - **Files:** `src/components/pipelines/DueDiligenceWorkspace.tsx`
  - **Done when:** Pipeline runs end-to-end, financial data displays as table, risks color-coded, memo shown as final output
  - **Depends on:** Task 2

- [ ] **Task 4: Implement MeetingIntelligenceWorkspace**
  - **What:** Create `src/components/pipelines/MeetingIntelligenceWorkspace.tsx` with audio upload, transcript panel, structured minutes with action items, email draft, meeting prep
  - **Files:** `src/components/pipelines/MeetingIntelligenceWorkspace.tsx`
  - **Done when:** Audio upload works, transcript scrolls independently, minutes show action items checklist, email has copy button
  - **Depends on:** Task 2

- [ ] **Task 5: Implement ProductDiscoveryWorkspace**
  - **What:** Create `src/components/pipelines/ProductDiscoveryWorkspace.tsx` with two image upload zones, image preview grid, HTML preview frame, screen analysis list, PRD display
  - **Files:** `src/components/pipelines/ProductDiscoveryWorkspace.tsx`
  - **Done when:** Images preview at max 200px, HTML renders in iframe, PRD displays as final output
  - **Depends on:** Task 2

- [ ] **Task 6: Implement ComplianceAuditorWorkspace**
  - **What:** Create `src/components/pipelines/ComplianceAuditorWorkspace.tsx` with privacy notice banner, two upload zones, risk flags sorted by severity, medical disclaimer, compliance report
  - **Files:** `src/components/pipelines/ComplianceAuditorWorkspace.tsx`
  - **Done when:** Privacy notice shows before upload, risks sorted high-first, medical disclaimer always visible
  - **Depends on:** Task 2

- [ ] **Task 7: Implement ResearchSynthesisWorkspace**
  - **What:** Create `src/components/pipelines/ResearchSynthesisWorkspace.tsx` with research question input, optional PDF upload, search results display, chart data table, cited report with inline markers
  - **Files:** `src/components/pipelines/ResearchSynthesisWorkspace.tsx`
  - **Done when:** Question input works, search results show titles/URLs/snippets, chart data in table, citations match search results
  - **Depends on:** Task 2

- [ ] **Task 8: Implement NegotiationPrepWorkspace**
  - **What:** Create `src/components/pipelines/NegotiationPrepWorkspace.tsx` with contract upload, audio upload, contract analysis, transcript, 3 tone panels for counter-proposals, email draft
  - **Files:** `src/components/pipelines/NegotiationPrepWorkspace.tsx`
  - **Done when:** 3 tone panels display with distinct colors, proposals copyable, analysis included as context
  - **Depends on:** Task 2

- [ ] **Task 9: Implement IncidentResponseWorkspace**
  - **What:** Create `src/components/pipelines/IncidentResponseWorkspace.tsx` with screenshot upload, code text area, screen analysis, code review issues sorted by severity, post-mortem, stakeholder email
  - **Files:** `src/components/pipelines/IncidentResponseWorkspace.tsx`
  - **Done when:** Screenshots preview, issues sorted critical-first, post-mortem references analysis findings, email is professional tone
  - **Depends on:** Task 2

- [ ] **Task 10: Implement CustomerIntelligenceWorkspace**
  - **What:** Create `src/components/pipelines/CustomerIntelligenceWorkspace.tsx` with audio upload, transcript, pain points as bullets, tone-adapted response, customer reply draft with copy button
  - **Files:** `src/components/pipelines/CustomerIntelligenceWorkspace.tsx`
  - **Done when:** Transcript displays, pain points as bullets, reply references pain points, copy button works
  - **Depends on:** Task 2

- [ ] **Task 11: Update Dashboard Routing**
  - **What:** Update `src/components/pages/DashboardPage.tsx` to route to the correct workspace component based on pipeline template ID
  - **Files:** `src/components/pages/DashboardPage.tsx`
  - **Done when:** Selecting any pipeline opens its dedicated workspace, existing task routing unchanged
  - **Depends on:** Tasks 3-10

- [ ] **Task 12: Write Integration Tests**
  - **What:** Create tests for all 8 workspace components verifying correct rendering with mock pipeline state
  - **Files:** `src/components/pipelines/__tests__/*.test.tsx`
  - **Done when:** All tests pass, coverage ≥ 80% for new files
  - **Depends on:** Tasks 3-10

## Property-Based Tests

For each correctness property in requirements.md:

- [ ] **Task 13: Property Tests - Financial Data Display**
  - **What:** Test that FinancialDataTable renders correctly with valid/invalid/malformed JSON
  - **Files:** `src/components/pipelines/__tests__/DueDiligenceWorkspace.test.tsx`
  - **Done when:** 100+ test cases pass, covers edge cases
  - **Depends on:** Task 3

- [ ] **Task 14: Property Tests - Risk Color Coding**
  - **What:** Test that RiskLevelBadge displays correct colors for low/medium/high
  - **Files:** `src/components/pipelines/__tests__/PipelineOutputHelpers.test.tsx`
  - **Done when:** All color combinations verified, 100+ cases
  - **Depends on:** Task 2

- [ ] **Task 15: Property Tests - Action Items Checklist**
  - **What:** Test that MeetingMinutesDisplay renders action items with owner/due date
  - **Files:** `src/components/pipelines/__tests__/MeetingIntelligenceWorkspace.test.tsx`
  - **Done when:** 100+ cases pass, covers empty/missing fields
  - **Depends on:** Task 4

- [ ] **Task 16: Property Tests - Citation Markers**
  - **What:** Test that citation markers in final report correspond to search results
  - **Files:** `src/components/pipelines/__tests__/ResearchSynthesisWorkspace.test.tsx`
  - **Done when:** 100+ cases pass, verifies marker-to-result mapping
  - **Depends on:** Task 7

- [ ] **Task 17: Property Tests - Severity Sorting**
  - **What:** Test that risk flags and code review issues are sorted by severity
  - **Files:** `src/components/pipelines/__tests__/ComplianceAuditorWorkspace.test.tsx`, `src/components/pipelines/__tests__/IncidentResponseWorkspace.test.tsx`
  - **Done when:** 100+ cases pass, verifies sort order
  - **Depends on:** Tasks 6, 9

import type { SkillDefinition } from "../types";

export const PRODUCT_AND_ARCH_SKILLS: SkillDefinition[] = [
  // 10.1 BA (Business Analyst)
  {
    name: "grill-me",
    role: "ba",
    repo: "snowfluke/engineering-skills",
    description:
      "Interview stakeholder critically 1 question at a time with recommended answers until all business decision branches are locked into a decision log.",
  },
  {
    name: "product-discovery",
    role: "ba",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Structure Problem Definition, User Personas, JTBD, User Journey, functional requirements, and MVP feature prioritization.",
  },
  {
    name: "grooming",
    role: "ba",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Dissect draft User Stories & ACs from an engineering perspective to uncover edge cases and unanswered business rules before sprint start.",
  },
  {
    name: "us-ac-formatter",
    role: "ba",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Convert raw User Story tables into structured Gherkin (Given / When / Then) specifications grouped per target sprint.",
  },
  {
    name: "domain-glossary-modeler",
    role: "ba",
    repo: "custom",
    description:
      "Build Ubiquitous Language (docs/GLOSSARY.md) and business State Machine tables (states, triggering actors, guard conditions, terminal states).",
  },
  {
    name: "competitor-benchmark",
    role: "ba",
    repo: "custom",
    description:
      "Research competitor features, compare user flows, and produce a feature gap matrix to sharpen MVP scope.",
  },

  // 10.2 PM (Product Manager / Project Manager)
  {
    name: "to-prd",
    role: "pm",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Convert new discussions or mid-flight change requests into incremental PRDs and User Stories without breaking existing AC numbering.",
  },
  {
    name: "to-issues",
    role: "pm",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Break down PRDs/User Stories into Backend, Frontend, and Wiring cards and create GitHub Issues with assignees, labels, milestones, and estimates.",
  },
  {
    name: "triage",
    role: "pm",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Classify SIT/UAT findings, bug reports, or ad-hoc requests into Bug Issue, Change Request (to-prd), Duplicate, Backlog, or Answered Non-defect.",
  },
  {
    name: "release-notes",
    role: "pm",
    repo: "snowfluke/engineering-skills",
    description:
      "Generate verified GitHub Release Notes and CHANGELOG entries from commit history and published artifacts.",
  },
  {
    name: "handoff",
    role: "pm",
    repo: "snowfluke/engineering-skills",
    description:
      "Compress current session context and work progress into a structured handoff document for the next session or engineer.",
  },
  {
    name: "sprint-retrospective",
    role: "pm",
    repo: "custom",
    description:
      "Analyze completed vs carry-over sprint cards, calculate velocity, identify review bottlenecks, and generate sprint retrospective reports.",
  },

  // 10.3 UI/UX (Product Designer & Frontend Art Direction)
  {
    name: "design-taste-frontend",
    role: "uiux",
    repo: "leonxlnx/taste-skill",
    description:
      "Provide curated art direction based on 247 gallery sites, layout composition, typography, and browser visual inspection loops.",
  },
  {
    name: "web-design-guidelines",
    role: "uiux",
    repo: "vercel-labs/agent-skills",
    description:
      "Modern UI/UX gold standards: spacing rules, typography, form interactions, keyboard navigation, focus states, animation performance, and UI copy.",
  },
  {
    name: "uizze-ui",
    role: "uiux",
    repo: "uizze/uizze",
    description:
      "Provide real-world application references, design systems, licensed font pairings, icons, and micro-interaction patterns.",
  },
  {
    name: "anthropic-art",
    role: "uiux",
    repo: "snowfluke/engineering-skills",
    description:
      "Generate warm editorial hand-drawn SVG illustrations for hero sections, social cards, and empty states.",
  },
  {
    name: "design-token-architect",
    role: "uiux",
    repo: "custom",
    description:
      "Design CSS-first Tailwind v4 token systems in apps/web/src/styles/app.css (@theme: semantic colors, fluid typography, radii, shadows, dark/light mode).",
  },

  // 10.4 TECH LEAD (Systems Architect & Engineering Lead)
  {
    name: "technical-spec",
    role: "tech-lead",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Generate docs/technical-specs/ (system architecture, monorepo layout, tech stack, module definitions, ERD data model, security, NFRs, auth strategy).",
  },
  {
    name: "api-spec",
    role: "tech-lead",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Derive API operation contracts (docs/api-specs/), DTO input/output schemas, standard error codes, and authorization rules from technical specs.",
  },
  {
    name: "task-breakdown",
    role: "tech-lead",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Break down User Stories into sprint work cards (docs/task-breakdown/) separating Backend, Frontend, and explicit FE <-> BE Wiring cards.",
  },
  {
    name: "tech-lead-setups",
    role: "tech-lead",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Execute Sprint 0: scaffold monorepo skeleton, linter/formatter config, git hooks, E2E test harness, and stub endpoints for parallel FE & BE work.",
  },
  {
    name: "coding-standard",
    role: "tech-lead",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Author docs/coding-standard/ and docs/code-review-checklist/ used as the PR verification baseline.",
  },
  {
    name: "security-standard",
    role: "tech-lead",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Map OWASP API Top 10, OWASP Web Top 10, and ASVS risks to concrete security controls and source code evidence files.",
  },
  {
    name: "lead-review",
    role: "tech-lead",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Perform isolated git worktree PR code review, run test/lint/typecheck gates, prove bug findings, and post standardized review comments.",
  },
  {
    name: "init-claude",
    role: "tech-lead",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Generate agent operating manuals (CLAUDE.md / AGENTS.md) summarizing architectural laws, file size caps, and mandatory verification commands.",
  },
  {
    name: "project-docs",
    role: "tech-lead",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Write contributor orientation docs (README.md, GLOSSARY.md, development-guide/, onboarding/) reflecting actual repository state.",
  },
  {
    name: "adopt-flow",
    role: "tech-lead",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Audit an existing project and incrementally generate missing specifications and standards without rewriting legacy user stories.",
  },
  {
    name: "adr-writer",
    role: "tech-lead",
    repo: "custom",
    description:
      "Record Architecture Decision Records (docs/adr/NNN-title.md) with context, considered alternatives, and trade-offs.",
  },
  {
    name: "refactor-modular",
    role: "tech-lead",
    repo: "custom",
    description:
      "Split files approaching the 300-line cap or cognitive complexity > 15 into clean sub-modules without breaking public type contracts.",
  },
];

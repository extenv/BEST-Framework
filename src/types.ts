export type SkillRole =
  | "ba"
  | "pm"
  | "uiux"
  | "tech-lead"
  | "be"
  | "fe"
  | "qa"
  | "infra"
  | "general";

export interface SkillDefinition {
  name: string;
  role: SkillRole;
  repo: string | "custom";
  description: string;
}

export interface ScaffoldConfig {
  projectSlug: string;
  scope: string; // without leading '@', e.g. 'acme' -> '@acme'
  targetDir: string;
  roles: SkillRole[];
  includeTodos?: boolean;
  installSkills: boolean;
  fetchExternalSkills: boolean;
  installDeps: boolean;
  overwrite: boolean;
}

export interface TemplateFile {
  path: string;
  content: string;
  executable?: boolean;
}

export const ALL_ROLES: { id: SkillRole; label: string }[] = [
  { id: "ba", label: "BA (Business Analyst)" },
  { id: "pm", label: "PM (Product / Project Manager)" },
  { id: "uiux", label: "UI/UX (Product Designer & Frontend Art Direction)" },
  { id: "tech-lead", label: "Tech Lead (Systems Architect & Engineering Lead)" },
  { id: "be", label: "BE (Backend: Elysia.js, Better Auth, TypeBox, Drizzle)" },
  { id: "fe", label: "FE (Frontend: SolidJS, TanStack, Eden v2, Tailwind v4)" },
  { id: "qa", label: "QA (Playwright E2E & API Security Tester)" },
  { id: "infra", label: "Infra / DevOps (Docker, Turborepo, CI/CD & SRE)" },
  { id: "general", label: "General (Token Efficiency, Context & Meta-Skills)" },
];

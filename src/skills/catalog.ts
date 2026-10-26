import type { SkillDefinition, SkillRole } from "../types";
import { ENG_AND_OPS_SKILLS } from "./catalog-eng";
import { PRODUCT_AND_ARCH_SKILLS } from "./catalog-product";

export const SKILL_CATALOG: SkillDefinition[] = [
  ...PRODUCT_AND_ARCH_SKILLS,
  ...ENG_AND_OPS_SKILLS,
];

export function getSkillsByRoles(roles: SkillRole[]): SkillDefinition[] {
  const roleSet = new Set(roles);
  const seen = new Set<string>();
  const result: SkillDefinition[] = [];
  for (const skill of SKILL_CATALOG) {
    if (roleSet.has(skill.role) && !seen.has(skill.name)) {
      seen.add(skill.name);
      result.push(skill);
    }
  }
  return result;
}

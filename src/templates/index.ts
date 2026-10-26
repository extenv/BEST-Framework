import type { TemplateFile } from "../types";
import { getApiCoreTemplates } from "./api-core";
import { getApiModuleTemplates } from "./api-modules";
import { getDbTemplates } from "./db";
import { getDocsTemplates } from "./docs";
import { getRootTemplates } from "./root";
import { getSharedTemplates } from "./shared";
import { getWebCoreTemplates } from "./web-core";
import { getWebRouteTemplates } from "./web-routes";

export function getAllProjectTemplates(): TemplateFile[] {
  return [
    ...getRootTemplates(),
    ...getDocsTemplates(),
    ...getSharedTemplates(),
    ...getDbTemplates(),
    ...getApiCoreTemplates(),
    ...getApiModuleTemplates(),
    ...getWebCoreTemplates(),
    ...getWebRouteTemplates(),
  ];
}

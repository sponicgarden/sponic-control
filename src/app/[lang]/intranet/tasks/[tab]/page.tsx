import { INTRANET_LOCALES } from "@/i18n/config";
import { ALL_TAB_SLUGS } from "@/types/intranet";
import { TasksTabContent } from "@/components/tasks/tasks-tab-content";

export function generateStaticParams() {
  const params: { lang: string; tab: string }[] = [];
  for (const locale of INTRANET_LOCALES) {
    for (const tab of ALL_TAB_SLUGS.tasks) {
      params.push({ lang: locale, tab });
    }
  }
  return params;
}

export default function TasksTabPage() {
  return <TasksTabContent />;
}

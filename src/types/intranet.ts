export type IntranetSection =
  | "devices"
  | "members"
  | "associates"
  | "staff"
  | "tasks"
  | "meetings"
  | "admin"
  | "devcontrol";

export interface TabDefinition {
  key: string;
  label: string;
  defaultVisible: boolean;
}

export interface TabConfig {
  tab_key: string;
  tab_label: string;
  is_visible: boolean;
  sort_order: number;
}

export interface SectionDefinition {
  key: IntranetSection;
  label: string;
}

export const SECTIONS: SectionDefinition[] = [
  { key: "devices", label: "Devices" },
  { key: "members", label: "Members" },
  { key: "associates", label: "Associates" },
  { key: "staff", label: "Staff" },
  { key: "tasks", label: "Tasks" },
  { key: "meetings", label: "Meetings" },
  { key: "admin", label: "Admin" },
  { key: "devcontrol", label: "DevControl" },
];

export const DEFAULT_TABS: Record<IntranetSection, TabDefinition[]> = {
  devices: [
    { key: "inventory", label: "Inventory", defaultVisible: true },
    { key: "assignments", label: "Assignments", defaultVisible: true },
    { key: "maintenance", label: "Maintenance", defaultVisible: false },
    { key: "procurement", label: "Procurement", defaultVisible: false },
  ],
  members: [
    { key: "directory", label: "Directory", defaultVisible: true },
    { key: "rooms", label: "Rooms", defaultVisible: true },
    { key: "check-in-out", label: "Check In/Out", defaultVisible: false },
    { key: "requests", label: "Requests", defaultVisible: false },
  ],
  associates: [
    { key: "directory", label: "Directory", defaultVisible: true },
    { key: "organizations", label: "Organizations", defaultVisible: true },
    { key: "donations", label: "Donations", defaultVisible: false },
    { key: "communications", label: "Communications", defaultVisible: false },
  ],
  staff: [
    { key: "directory", label: "Directory", defaultVisible: true },
    { key: "schedules", label: "Schedules", defaultVisible: true },
    { key: "roles", label: "Roles", defaultVisible: false },
    { key: "attendance", label: "Attendance", defaultVisible: false },
  ],
  tasks: [
    { key: "list", label: "List", defaultVisible: true },
    { key: "labels", label: "Labels", defaultVisible: true },
    { key: "projects", label: "Projects", defaultVisible: true },
  ],
  meetings: [
    { key: "list", label: "Meetings", defaultVisible: true },
    { key: "action-items", label: "Action Items", defaultVisible: true },
    { key: "import", label: "Import", defaultVisible: true },
  ],
  admin: [
    { key: "users", label: "Users", defaultVisible: true },
    { key: "passwords", label: "Passwords", defaultVisible: false },
    { key: "settings", label: "Settings", defaultVisible: false },
    { key: "releases", label: "Releases", defaultVisible: true },
    { key: "templates", label: "Templates", defaultVisible: false },
    { key: "brand", label: "Brand", defaultVisible: true },
    { key: "accounting", label: "Accounting", defaultVisible: false },
    { key: "life-of-pai", label: "Life of PAI", defaultVisible: false },
  ],
  devcontrol: [
    { key: "overview", label: "Overview", defaultVisible: true },
    { key: "releases", label: "Releases", defaultVisible: true },
    { key: "sessions", label: "Sessions", defaultVisible: true },
    { key: "tokens", label: "Tokens & Cost", defaultVisible: true },
    { key: "context", label: "Context Window", defaultVisible: true },
    { key: "backups", label: "Backups", defaultVisible: true },
    { key: "planlist", label: "PlanList", defaultVisible: true },
  ],
};

export const ALL_TAB_SLUGS: Record<IntranetSection, string[]> = {
  devices: DEFAULT_TABS.devices.map((t) => t.key),
  members: DEFAULT_TABS.members.map((t) => t.key),
  associates: DEFAULT_TABS.associates.map((t) => t.key),
  staff: DEFAULT_TABS.staff.map((t) => t.key),
  tasks: DEFAULT_TABS.tasks.map((t) => t.key),
  meetings: DEFAULT_TABS.meetings.map((t) => t.key),
  admin: DEFAULT_TABS.admin.map((t) => t.key),
  devcontrol: DEFAULT_TABS.devcontrol.map((t) => t.key),
};

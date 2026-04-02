export type DashboardCheckinHistoryItem = {
  id: string;
  zone: "red" | "yellow" | "blue" | "green";
  feeling: string;
  createdAtLabel: string;
};

export type DashboardProfile = {
  id: string;
  name: string;
  avatarKey: string | null;
  checkinCount: number;
  lastActiveLabel: string;
  history: DashboardCheckinHistoryItem[];
};

export const DASHBOARD_MOCK_PROFILES: DashboardProfile[] = [
  {
    id: "maya",
    name: "Maya",
    avatarKey: "rabbit",
    checkinCount: 12,
    lastActiveLabel: "Today",
    history: [
      { id: "maya-1", zone: "yellow", feeling: "Nervous", createdAtLabel: "Today - 8:15 AM" },
      { id: "maya-2", zone: "green", feeling: "Calm", createdAtLabel: "Yesterday - 3:40 PM" },
      { id: "maya-3", zone: "blue", feeling: "Tired", createdAtLabel: "Mon - 7:55 PM" },
    ],
  },
  {
    id: "leo",
    name: "Leo",
    avatarKey: "lion",
    checkinCount: 7,
    lastActiveLabel: "Yesterday",
    history: [
      { id: "leo-1", zone: "red", feeling: "Overwhelmed", createdAtLabel: "Yesterday - 1:10 PM" },
      { id: "leo-2", zone: "yellow", feeling: "Excited", createdAtLabel: "Tue - 4:05 PM" },
      { id: "leo-3", zone: "green", feeling: "Confident", createdAtLabel: "Sun - 11:25 AM" },
    ],
  },
  {
    id: "room-a",
    name: "Room A Group",
    avatarKey: "owl",
    checkinCount: 19,
    lastActiveLabel: "2 days ago",
    history: [
      { id: "room-a-1", zone: "yellow", feeling: "Worried", createdAtLabel: "Tue - 9:00 AM" },
      { id: "room-a-2", zone: "blue", feeling: "Discouraged", createdAtLabel: "Mon - 2:15 PM" },
      { id: "room-a-3", zone: "green", feeling: "Okay", createdAtLabel: "Fri - 10:30 AM" },
    ],
  },
] as const;

export function getDashboardProfileById(profileId: string): DashboardProfile | null {
  return DASHBOARD_MOCK_PROFILES.find((profile) => profile.id === profileId) ?? null;
}

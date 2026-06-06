export type WidgetType = 'weather' | 'calendar' | 'battery' | 'photos' | 'tasks';

export type LauncherApp = {
  id: string;
  title: string;
  url: string;
  icon: string;
  tintColor: string;
  order: number;
  folderId: string | null;
};

export type LauncherFolder = {
  id: string;
  title: string;
  tintColor: string;
  appIds: string[];
  order: number;
};

export type WallpaperPreset = {
  id: string;
  title: string;
  colors: [string, string];
};

export type TaskItem = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

export type WeatherSnapshot = {
  temperature: number;
  description: string;
  code: number;
  updatedAt: number;
  locationLabel: string;
  hourly: Array<{ time: string; temperature: number; code: number }>;
};

export type CalendarEventItem = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  calendarTitle: string;
  location?: string | null;
};

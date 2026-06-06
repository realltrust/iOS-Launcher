import AsyncStorage from '@react-native-async-storage/async-storage';
import { LauncherApp, LauncherFolder, TaskItem, WidgetType, WallpaperPreset } from '../types';

const PREFIX = 'launcher.clone.v1';

const key = (suffix: string) => `${PREFIX}.${suffix}`;

export type PersistedState = {
  apps: LauncherApp[];
  folders: LauncherFolder[];
  widgets: WidgetType[];
  wallpaper: WallpaperPreset;
  tasks: TaskItem[];
};

export const loadState = async (): Promise<Partial<PersistedState>> => {
  const pairs = await AsyncStorage.multiGet([
    key('apps'),
    key('folders'),
    key('widgets'),
    key('wallpaper'),
    key('tasks'),
  ]);

  const map = Object.fromEntries(pairs);

  return {
    apps: map[key('apps')] ? JSON.parse(map[key('apps')]!) : undefined,
    folders: map[key('folders')] ? JSON.parse(map[key('folders')]!) : undefined,
    widgets: map[key('widgets')] ? JSON.parse(map[key('widgets')]!) : undefined,
    wallpaper: map[key('wallpaper')] ? JSON.parse(map[key('wallpaper')]!) : undefined,
    tasks: map[key('tasks')] ? JSON.parse(map[key('tasks')]!) : undefined,
  };
};

export const saveState = async (state: PersistedState) => {
  await AsyncStorage.multiSet([
    [key('apps'), JSON.stringify(state.apps)],
    [key('folders'), JSON.stringify(state.folders)],
    [key('widgets'), JSON.stringify(state.widgets)],
    [key('wallpaper'), JSON.stringify(state.wallpaper)],
    [key('tasks'), JSON.stringify(state.tasks)],
  ]);
};

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createId } from '../utils/id';
import { loadState, saveState } from '../services/storage';
import { LauncherApp, LauncherFolder, TaskItem, WallpaperPreset, WidgetType } from '../types';

const WALLPAPERS: WallpaperPreset[] = [
  { id: 'midnight', title: 'Midnight', colors: ['#0F172A', '#111827'] },
  { id: 'aurora', title: 'Aurora', colors: ['#0F766E', '#1D4ED8'] },
  { id: 'sunset', title: 'Sunset', colors: ['#7C2D12', '#BE185D'] },
  { id: 'glass', title: 'Glass', colors: ['#1C1C1E', '#3A3A3C'] },
];

type LauncherState = {
  apps: LauncherApp[];
  folders: LauncherFolder[];
  widgets: WidgetType[];
  wallpaper: WallpaperPreset;
  tasks: TaskItem[];
};

type LauncherActions = {
  hydrate: () => Promise<void>;
  addApp: (input: Omit<LauncherApp, 'id' | 'order' | 'folderId'> & { folderId?: string | null }) => Promise<void>;
  updateApp: (appId: string, patch: Partial<LauncherApp>) => Promise<void>;
  deleteApp: (appId: string) => Promise<void>;
  createFolder: (title: string, appIds: string[], tintColor: string) => Promise<void>;
  renameFolder: (folderId: string, title: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  setWallpaper: (id: string) => Promise<void>;
  toggleWidget: (widget: WidgetType) => Promise<void>;
  addTask: (title: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  openApp: (app: LauncherApp) => Promise<void>;
};

const defaultState: LauncherState = {
  apps: [],
  folders: [],
  widgets: ['weather', 'calendar', 'battery', 'photos'],
  wallpaper: WALLPAPERS[0],
  tasks: [],
};

const LauncherContext = createContext<(LauncherState & LauncherActions) | null>(null);

const persist = async (state: LauncherState) => {
  await saveState(state);
};

const sortByOrder = <T extends { order: number }>(items: T[]) =>
  [...items].sort((a, b) => a.order - b.order);

export const LauncherProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<LauncherState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  const sync = async (next: LauncherState) => {
    setState(next);
    await persist(next);
  };

  const hydrate = async () => {
    const loaded = await loadState();
    const next: LauncherState = {
      apps: loaded.apps ?? defaultState.apps,
      folders: loaded.folders ?? defaultState.folders,
      widgets: loaded.widgets ?? defaultState.widgets,
      wallpaper: loaded.wallpaper ?? defaultState.wallpaper,
      tasks: loaded.tasks ?? defaultState.tasks,
    };
    setState(next);
    setHydrated(true);
  };

  useEffect(() => {
    void hydrate();
  }, []);

  const actions: LauncherActions = useMemo(() => ({
    hydrate,
    addApp: async (input) => {
      const newApp: LauncherApp = {
        id: createId(),
        title: input.title.trim(),
        url: input.url.trim(),
        icon: input.icon.trim(),
        tintColor: input.tintColor,
        folderId: input.folderId ?? null,
        order: state.apps.length,
      };
      const next = {
        ...state,
        apps: sortByOrder([...state.apps, newApp]),
      };
      await sync(next);
    },
    updateApp: async (appId, patch) => {
      const next = {
        ...state,
        apps: sortByOrder(state.apps.map((app) => (app.id === appId ? { ...app, ...patch } : app))),
      };
      await sync(next);
    },
    deleteApp: async (appId) => {
      const app = state.apps.find((item) => item.id === appId);
      if (!app) return;
      const nextFolders = state.folders
        .map((folder) => ({
          ...folder,
          appIds: folder.appIds.filter((id) => id !== appId),
        }))
        .filter((folder) => folder.appIds.length > 0);
      const next = {
        ...state,
        apps: state.apps.filter((item) => item.id !== appId),
        folders: nextFolders,
      };
      await sync(next);
    },
    createFolder: async (title, appIds, tintColor) => {
      const folderId = createId();
      const folder: LauncherFolder = {
        id: folderId,
        title: title.trim(),
        tintColor,
        appIds,
        order: state.folders.length,
      };
      const nextApps = state.apps.map((app) =>
        appIds.includes(app.id) ? { ...app, folderId } : app
      );
      const next = {
        ...state,
        apps: sortByOrder(nextApps),
        folders: sortByOrder([...state.folders, folder]),
      };
      await sync(next);
    },
    renameFolder: async (folderId, title) => {
      const next = {
        ...state,
        folders: state.folders.map((folder) =>
          folder.id === folderId ? { ...folder, title: title.trim() } : folder
        ),
      };
      await sync(next);
    },
    deleteFolder: async (folderId) => {
      const next = {
        ...state,
        apps: state.apps.map((app) =>
          app.folderId === folderId ? { ...app, folderId: null } : app
        ),
        folders: state.folders.filter((folder) => folder.id !== folderId),
      };
      await sync(next);
    },
    setWallpaper: async (id) => {
      const nextWallpaper = WALLPAPERS.find((item) => item.id === id) ?? state.wallpaper;
      await sync({ ...state, wallpaper: nextWallpaper });
    },
    toggleWidget: async (widget) => {
      const widgets = state.widgets.includes(widget)
        ? state.widgets.filter((item) => item !== widget)
        : [...state.widgets, widget];
      await sync({ ...state, widgets });
    },
    addTask: async (title) => {
      const task: TaskItem = {
        id: createId(),
        title: title.trim(),
        completed: false,
        createdAt: Date.now(),
      };
      await sync({ ...state, tasks: [task, ...state.tasks] });
    },
    toggleTask: async (taskId) => {
      await sync({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      });
    },
    deleteTask: async (taskId) => {
      await sync({
        ...state,
        tasks: state.tasks.filter((task) => task.id !== taskId),
      });
    },
    openApp: async (app) => {
      const canOpen = await Linking.canOpenURL(app.url);
      if (!canOpen) {
        Alert.alert('Cannot open app', `No handler found for ${app.url}`);
        return;
      }
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      await Linking.openURL(app.url);
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state]);

  const value = useMemo(() => ({ ...state, ...actions, hydrated }), [state, actions, hydrated]);

  return <LauncherContext.Provider value={value}>{children}</LauncherContext.Provider>;
};

export const useLauncher = () => {
  const context = useContext(LauncherContext);
  if (!context) throw new Error('useLauncher must be used inside LauncherProvider');
  return context;
};

export const getWallpaperPresets = () => WALLPAPERS;

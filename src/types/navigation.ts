import { LauncherApp } from './index';

export type RootStackParamList = {
  Home: undefined;
  Library: undefined;
  AppEditor: { appId?: string } | undefined;
  FolderManager: undefined;
  Wallpaper: undefined;
  Tasks: undefined;
};

export type LibraryScreenProps = {
  onSelectApp?: (app: LauncherApp) => void;
};

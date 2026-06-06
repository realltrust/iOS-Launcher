import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LauncherProvider } from './src/context/LauncherContext';
import { RootStackParamList } from './src/types/navigation';
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import AppEditorScreen from './src/screens/AppEditorScreen';
import FolderManagerScreen from './src/screens/FolderManagerScreen';
import WallpaperScreen from './src/screens/WallpaperScreen';
import TasksScreen from './src/screens/TasksScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <LauncherProvider>
        <NavigationContainer theme={DarkTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Library" component={LibraryScreen} />
            <Stack.Screen name="AppEditor" component={AppEditorScreen} />
            <Stack.Screen name="FolderManager" component={FolderManagerScreen} />
            <Stack.Screen name="Wallpaper" component={WallpaperScreen} />
            <Stack.Screen name="Tasks" component={TasksScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </LauncherProvider>
    </SafeAreaProvider>
  );
}

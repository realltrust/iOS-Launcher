import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useClock } from '../hooks/useClock';
import { useLauncher } from '../context/LauncherContext';
import { RootStackParamList } from '../types/navigation';
import GradientShell from '../components/GradientShell';
import LauncherAppTile from '../components/LauncherAppTile';
import FolderTile from '../components/FolderTile';
import WeatherWidget from '../components/widgets/WeatherWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import BatteryWidget from '../components/widgets/BatteryWidget';
import PhotosWidget from '../components/widgets/PhotosWidget';
import TasksWidget from '../components/widgets/TasksWidget';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { apps, folders, widgets, wallpaper, openApp, deleteApp, deleteFolder, hydrated } = useLauncher();
  const [editMode, setEditMode] = useState(false);
  const now = useClock();

  const items = useMemo(() => {
    const folderIds = new Set(folders.map((folder) => folder.id));
    const visibleApps = apps.filter((app) => !app.folderId || !folderIds.has(app.folderId));
    return { visibleApps };
  }, [apps, folders]);

  const openFolder = (folderId: string) => {
    navigation.navigate('FolderManager');
  };

  const renderWidget = (widget: string) => {
    switch (widget) {
      case 'weather':
        return <WeatherWidget key={widget} />;
      case 'calendar':
        return <CalendarWidget key={widget} />;
      case 'battery':
        return <BatteryWidget key={widget} />;
      case 'photos':
        return <PhotosWidget key={widget} />;
      case 'tasks':
        return <TasksWidget key={widget} />;
      default:
        return null;
    }
  };

  const handleEditToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setEditMode((value) => !value);
  };

  const wallpaperText = wallpaper.title;

  return (
    <GradientShell colors={wallpaper.colors}>
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.time}>{new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(now)}</Text>
            <Text style={styles.date}>{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(now)}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={() => navigation.navigate('Wallpaper')}>
              <Ionicons name="color-palette-outline" size={18} color="#fff" />
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => navigation.navigate('Library')}>
              <Ionicons name="apps-outline" size={18} color="#fff" />
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleEditToggle}>
              <Ionicons name={editMode ? 'checkmark' : 'create-outline'} size={18} color="#fff" />
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.searchBar} onPress={() => navigation.navigate('Library')}>
          <Ionicons name="search" size={17} color="rgba(255,255,255,0.7)" />
          <Text style={styles.searchText}>Search apps, folders, and actions</Text>
        </Pressable>

        <Text style={styles.meta}>Wallpaper · {wallpaperText}</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {hydrated ? null : <Text style={styles.meta}>Loading your launcher…</Text>}
          {widgets.map((widget) => renderWidget(widget))}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pinned apps</Text>
            <Pressable onPress={() => navigation.navigate('AppEditor')}><Text style={styles.link}>Add app</Text></Pressable>
          </View>

          <View style={styles.grid}>
            {folders.map((folder) => {
              const folderApps = apps.filter((app) => folder.appIds.includes(app.id));
              return (
                <FolderTile
                  key={folder.id}
                  folder={folder}
                  apps={folderApps}
                  editMode={editMode}
                  onPress={() => Alert.alert('Folder', `Open folder "${folder.title}" from Folder Manager`)}
                  onDelete={() => void deleteFolder(folder.id)}
                />
              );
            })}
            {items.visibleApps.map((app) => (
              <LauncherAppTile
                key={app.id}
                app={app}
                editMode={editMode}
                onPress={() => {
                  if (editMode) return;
                  void openApp(app);
                }}
                onLongPress={() => setEditMode(true)}
                onDelete={() => void deleteApp(app.id)}
              />
            ))}
            {apps.length === 0 && folders.length === 0 ? (
              <Text style={styles.empty}>No apps yet. Add one to start building your launcher.</Text>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable style={styles.bottomButton} onPress={() => navigation.navigate('Tasks')}>
            <Ionicons name="checkbox-outline" size={18} color="#fff" />
            <Text style={styles.bottomLabel}>Tasks</Text>
          </Pressable>
          <Pressable style={styles.bottomButton} onPress={() => navigation.navigate('FolderManager')}>
            <Ionicons name="folder-open-outline" size={18} color="#fff" />
            <Text style={styles.bottomLabel}>Folders</Text>
          </Pressable>
          <Pressable style={styles.bottomButton} onPress={() => navigation.navigate('AppEditor')}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.bottomLabel}>Add</Text>
          </Pressable>
        </View>
      </View>
    </GradientShell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 26, paddingHorizontal: 18 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  time: { color: '#fff', fontSize: 40, fontWeight: '700' },
  date: { color: 'rgba(255,255,255,0.78)', fontSize: 15, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginTop: 18 },
  searchText: { color: 'rgba(255,255,255,0.72)', fontSize: 15 },
  meta: { color: 'rgba(255,255,255,0.62)', marginTop: 10, fontSize: 12 },
  scrollContent: { paddingTop: 12, paddingBottom: 120 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  link: { color: '#d1d5db', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 12, alignItems: 'flex-start' },
  empty: { color: 'rgba(255,255,255,0.74)', marginTop: 8 },
  bottomBar: { position: 'absolute', left: 18, right: 18, bottom: 18, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.22)' },
  bottomButton: { alignItems: 'center' },
  bottomLabel: { color: '#fff', fontSize: 11, marginTop: 4 },
});

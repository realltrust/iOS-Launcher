import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LauncherFolder, LauncherApp } from '../types';

type Props = {
  folder: LauncherFolder;
  apps: LauncherApp[];
  editMode?: boolean;
  onPress: () => void;
  onDelete?: () => void;
};

export default function FolderTile({ folder, apps, editMode, onPress, onDelete }: Props) {
  const preview = apps.slice(0, 4);
  return (
    <View style={styles.container}>
      <Pressable onPress={onPress} style={[styles.folder, { borderColor: folder.tintColor }]}>
        <View style={styles.previewGrid}>
          {preview.map((app) => (
            <View key={app.id} style={[styles.previewIcon, { backgroundColor: app.tintColor }]}>
              <Ionicons name={app.icon as keyof typeof Ionicons.glyphMap} size={12} color="#fff" />
            </View>
          ))}
        </View>
      </Pressable>
      {editMode && onDelete ? (
        <Pressable onPress={onDelete} hitSlop={10} style={styles.deleteBadge}>
          <Ionicons name="close-circle" size={24} color="#ff453a" />
        </Pressable>
      ) : null}
      <Text numberOfLines={1} style={styles.label}>
        {folder.title}
      </Text>
      <Text style={styles.count}>{apps.length} apps</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 78, alignItems: 'center', marginBottom: 18, position: 'relative' },
  folder: {
    width: 68,
    height: 68,
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 8,
  },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', height: '100%' },
  previewIcon: {
    width: '48%',
    height: '48%',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1%',
  },
  label: { marginTop: 6, color: '#fff', fontSize: 11, textAlign: 'center' },
  count: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 },
  deleteBadge: { position: 'absolute', top: -8, right: -6 },
});

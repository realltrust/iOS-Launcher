import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LauncherApp } from '../types';

type Props = {
  app: LauncherApp;
  editMode?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onDelete?: () => void;
};

export default function LauncherAppTile({ app, editMode, onPress, onLongPress, onDelete }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.icon,
          { backgroundColor: app.tintColor, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Ionicons name={app.icon as keyof typeof Ionicons.glyphMap} size={34} color="#fff" />
      </Pressable>
      {editMode && onDelete ? (
        <Pressable onPress={onDelete} hitSlop={10} style={styles.deleteBadge}>
          <Ionicons name="close-circle" size={24} color="#ff453a" />
        </Pressable>
      ) : null}
      <Text numberOfLines={1} style={styles.label}>
        {app.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 78, alignItems: 'center', marginBottom: 18, position: 'relative' },
  icon: {
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  label: { marginTop: 6, color: '#fff', fontSize: 11, textAlign: 'center' },
  deleteBadge: { position: 'absolute', top: -8, right: -6, backgroundColor: 'transparent' },
});

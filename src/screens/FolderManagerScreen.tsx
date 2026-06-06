import React, { useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { RootStackParamList } from '../types/navigation';
import { createId } from '../utils/id';

type Props = NativeStackScreenProps<RootStackParamList, 'FolderManager'>;

export default function FolderManagerScreen({ navigation }: Props) {
  const { apps, folders, createFolder, renameFolder, deleteFolder } = useLauncher();
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [tintColor, setTintColor] = useState('#007aff');

  const ungrouped = useMemo(() => apps.filter((app) => !app.folderId), [apps]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const save = async () => {
    if (!title.trim() || selected.length < 2) {
      Alert.alert('Need more info', 'Pick at least two apps and name the folder.');
      return;
    }
    await createFolder(title.trim(), selected, tintColor);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>Back</Text></Pressable>
          <Text style={styles.heading}>Folders</Text>
          <Pressable onPress={() => void save()}><Text style={styles.save}>Create</Text></Pressable>
        </View>

        <Text style={styles.label}>Folder name</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Work" placeholderTextColor="rgba(255,255,255,0.4)" />

        <Text style={styles.label}>Pick apps</Text>
        <View style={styles.grid}>
          {ungrouped.map((app) => {
            const active = selected.includes(app.id);
            return (
              <Pressable
                key={app.id}
                onPress={() => toggle(app.id)}
                style={[styles.appChip, active && styles.appChipActive]}
              >
                <Ionicons name={app.icon as keyof typeof Ionicons.glyphMap} size={18} color="#fff" />
                <Text style={styles.appChipText}>{app.title}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Existing folders</Text>
        {folders.map((folder) => (
          <View key={folder.id} style={styles.folderRow}>
            <Text style={styles.folderTitle}>{folder.title}</Text>
            <View style={styles.folderActions}>
              <Pressable onPress={() => void renameFolder(folder.id, `${folder.title} `)}><Ionicons name="create-outline" size={18} color="#fff" /></Pressable>
              <Pressable onPress={() => void deleteFolder(folder.id)} style={{ marginLeft: 14 }}><Ionicons name="trash-outline" size={18} color="#ff453a" /></Pressable>
            </View>
          </View>
        ))}
        {folders.length === 0 ? <Text style={styles.empty}>No folders yet.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0b0f' },
  content: { padding: 18, paddingBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  back: { color: '#d1d5db' },
  heading: { color: '#fff', fontSize: 24, fontWeight: '800' },
  save: { color: '#d1d5db', fontWeight: '700' },
  label: { color: '#fff', fontWeight: '700', marginTop: 12, marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', paddingHorizontal: 14, paddingVertical: 13, borderRadius: 14, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  appChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  appChipActive: { backgroundColor: 'rgba(0,122,255,0.35)' },
  appChipText: { color: '#fff' },
  folderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', padding: 14, borderRadius: 14, marginTop: 10 },
  folderTitle: { color: '#fff', fontWeight: '700' },
  folderActions: { flexDirection: 'row', alignItems: 'center' },
  empty: { color: 'rgba(255,255,255,0.62)', marginTop: 10 },
});

import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { RootStackParamList } from '../types/navigation';
import { LauncherApp } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

export default function LibraryScreen({ navigation }: Props) {
  const { apps, folders, deleteApp } = useLauncher();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((app) =>
      [app.title, app.url, app.icon].some((value) => value.toLowerCase().includes(q))
    );
  }, [apps, query]);

  const renderItem = ({ item }: { item: LauncherApp }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={[styles.icon, { backgroundColor: item.tintColor }]}>
          <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color="#fff" />
        </View>
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{item.url}</Text>
        </View>
      </View>
      <Pressable onPress={() => navigation.navigate('AppEditor', { appId: item.id })}>
        <Ionicons name="pencil-outline" size={18} color="#fff" />
      </Pressable>
      <Pressable onPress={() => void deleteApp(item.id)} style={{ marginLeft: 12 }}>
        <Ionicons name="trash-outline" size={18} color="#ff453a" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.heading}>Library</Text>
        <Pressable onPress={() => navigation.navigate('AppEditor')}>
          <Text style={styles.add}>New app</Text>
        </Pressable>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color="rgba(255,255,255,0.7)" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your apps"
          placeholderTextColor="rgba(255,255,255,0.45)"
          style={styles.input}
        />
      </View>

      <View style={styles.stats}>
        <Text style={styles.stat}>{apps.length} apps</Text>
        <Text style={styles.stat}>{folders.length} folders</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No matches.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0b0f', paddingHorizontal: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginBottom: 16 },
  heading: { color: '#fff', fontSize: 34, fontWeight: '800' },
  add: { color: '#d1d5db', fontSize: 15 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 12 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 14 },
  stat: { color: 'rgba(255,255,255,0.7)' },
  list: { paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomColor: 'rgba(255,255,255,0.08)', borderBottomWidth: 1 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  subtitle: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2, maxWidth: 240 },
  empty: { color: 'rgba(255,255,255,0.7)', paddingTop: 20 },
});

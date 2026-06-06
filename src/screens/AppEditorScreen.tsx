import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AppEditor'>;

const iconSuggestions = ['compass', 'chatbubbles', 'calendar', 'images', 'mail', 'music-note', 'phone-portrait', 'cart', 'browser'];

const colorSuggestions = ['#007aff', '#34c759', '#ff3b30', '#ff9500', '#af52de', '#0f172a'];

export default function AppEditorScreen({ navigation, route }: Props) {
  const { apps, addApp, updateApp } = useLauncher();
  const existing = route.params?.appId ? apps.find((app) => app.id === route.params!.appId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [url, setUrl] = useState(existing?.url ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? 'apps');
  const [tintColor, setTintColor] = useState(existing?.tintColor ?? '#007aff');

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setUrl(existing.url);
      setIcon(existing.icon);
      setTintColor(existing.tintColor);
    }
  }, [existing]);

  const save = async () => {
    if (!title.trim() || !url.trim()) {
      Alert.alert('Missing fields', 'Add a title and a launch URL.');
      return;
    }
    if (existing) {
      await updateApp(existing.id, { title: title.trim(), url: url.trim(), icon: icon.trim(), tintColor });
    } else {
      await addApp({ title: title.trim(), url: url.trim(), icon: icon.trim(), tintColor });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>Cancel</Text></Pressable>
          <Text style={styles.heading}>{existing ? 'Edit App' : 'New App'}</Text>
          <Pressable onPress={() => void save()}><Text style={styles.save}>Save</Text></Pressable>
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Safari" placeholderTextColor="rgba(255,255,255,0.4)" />

        <Text style={styles.label}>Launch URL or scheme</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com or myapp://"
          placeholderTextColor="rgba(255,255,255,0.4)"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Icon name</Text>
        <TextInput style={styles.input} value={icon} onChangeText={setIcon} placeholder="compass" placeholderTextColor="rgba(255,255,255,0.4)" />
        <Text style={styles.help}>Uses Ionicons names. Tap a suggestion to fill it.</Text>
        <View style={styles.chips}>
          {iconSuggestions.map((item) => (
            <Pressable key={item} onPress={() => setIcon(item)} style={styles.chip}><Text style={styles.chipText}>{item}</Text></Pressable>
          ))}
        </View>

        <Text style={styles.label}>Tint color</Text>
        <View style={styles.chips}>
          {colorSuggestions.map((item) => (
            <Pressable key={item} onPress={() => setTintColor(item)} style={[styles.colorChip, { backgroundColor: item, borderColor: tintColor === item ? '#fff' : 'transparent' }]} />
          ))}
        </View>

        <View style={styles.previewRow}>
          <View style={[styles.preview, { backgroundColor: tintColor }]}>
            <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={36} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.previewTitle}>{title || 'Preview'}</Text>
            <Text style={styles.previewMeta}>{url || 'Launch target'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0b0f' },
  content: { padding: 18, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  back: { color: '#d1d5db', fontSize: 15 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '800' },
  save: { color: '#d1d5db', fontSize: 15, fontWeight: '700' },
  label: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', paddingHorizontal: 14, paddingVertical: 13, borderRadius: 14, fontSize: 15 },
  help: { color: 'rgba(255,255,255,0.52)', fontSize: 12, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  chip: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  chipText: { color: '#fff', fontSize: 12 },
  colorChip: { width: 34, height: 34, borderRadius: 17, borderWidth: 2 },
  previewRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 14 },
  preview: { width: 76, height: 76, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  previewTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  previewMeta: { color: 'rgba(255,255,255,0.58)', fontSize: 12, marginTop: 4 },
});

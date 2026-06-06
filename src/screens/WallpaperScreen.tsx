import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLauncher, getWallpaperPresets } from '../context/LauncherContext';

export default function WallpaperScreen() {
  const { wallpaper, setWallpaper } = useLauncher();
  const presets = getWallpaperPresets();

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Wallpaper</Text>
        {presets.map((item) => {
          const active = item.id === wallpaper.id;
          return (
            <Pressable key={item.id} onPress={() => void setWallpaper(item.id)} style={styles.card}>
              <View style={[styles.preview, { backgroundColor: item.colors[0] }]}>
                <View style={[styles.previewInner, { backgroundColor: item.colors[1] }]} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              {active ? <Text style={styles.active}>Selected</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0b0f' },
  content: { padding: 18, paddingBottom: 24 },
  heading: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 16 },
  card: { marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 14 },
  preview: { height: 150, borderRadius: 16, overflow: 'hidden' },
  previewInner: { position: 'absolute', right: 18, top: 18, width: 70, height: 70, borderRadius: 35, opacity: 0.55 },
  title: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 10 },
  active: { color: '#34c759', marginTop: 4 },
});

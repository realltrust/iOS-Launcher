import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { loadRecentPhotos, PhotoItem } from '../../services/photos';

export default function PhotosWidget() {
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadRecentPhotos()
      .then((items) => mounted && setPhotos(items))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Recent Photos</Text>
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.grid}>
        {photos.slice(0, 4).map((photo) => (
          <Image key={photo.id} source={{ uri: photo.uri }} style={styles.image} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 16, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 14 },
  title: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  image: { width: '48%', aspectRatio: 1, borderRadius: 14, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.12)' },
  error: { color: '#ffb4b4' },
});

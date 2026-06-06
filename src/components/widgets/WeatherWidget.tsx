import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadWeather } from '../../services/weather';
import { formatShortHour } from '../../utils/format';

export default function WeatherWidget() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof loadWeather>> | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadWeather()
      .then((snapshot) => mounted && setData(snapshot))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Weather</Text>
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {data ? (
        <>
          <View style={styles.row}>
            <View>
              <Text style={styles.temp}>{Math.round(data.temperature)}°</Text>
              <Text style={styles.description}>{data.description}</Text>
              <Text style={styles.meta}>{data.locationLabel}</Text>
            </View>
            <Ionicons name="partly-sunny" size={40} color="#ffd60a" />
          </View>
          <View style={styles.hourRow}>
            {data.hourly.slice(0, 4).map((slot) => (
              <View key={slot.time} style={styles.hourItem}>
                <Text style={styles.hourText}>{formatShortHour(slot.time)}</Text>
                <Text style={styles.hourTemp}>{Math.round(slot.temperature)}°</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 16, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 14 },
  title: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  temp: { color: '#fff', fontSize: 46, fontWeight: '300' },
  description: { color: '#fff', fontSize: 15, opacity: 0.95 },
  meta: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  hourItem: { alignItems: 'center' },
  hourText: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  hourTemp: { color: '#fff', fontSize: 13, marginTop: 4 },
  error: { color: '#ffb4b4' },
});

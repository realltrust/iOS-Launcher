import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { loadUpcomingEvents } from '../../services/calendar';
import { formatHour } from '../../utils/format';

export default function CalendarWidget() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Awaited<ReturnType<typeof loadUpcomingEvents>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadUpcomingEvents()
      .then((items) => mounted && setEvents(items))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Calendar</Text>
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {events.length === 0 && !loading && !error ? (
        <Text style={styles.empty}>No upcoming events</Text>
      ) : null}
      {events.map((event) => (
        <View key={event.id} style={styles.event}>
          <View style={styles.dot} />
          <View style={styles.content}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventMeta}>
              {formatHour(event.startDate)} · {event.calendarTitle}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 16, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 14 },
  title: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  event: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff9f0a', marginTop: 6, marginRight: 10 },
  content: { flex: 1 },
  eventTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  eventMeta: { color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 2 },
  empty: { color: 'rgba(255,255,255,0.74)' },
  error: { color: '#ffb4b4' },
});

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Battery from 'expo-battery';

export default function BatteryWidget() {
  const [level, setLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState<boolean | null>(null);

  useEffect(() => {
    let levelSub: Battery.BatterySubscription | undefined;
    let stateSub: Battery.BatterySubscription | undefined;

    Battery.getBatteryLevelAsync().then((value) => setLevel(value));
    Battery.getBatteryStateAsync().then((value) => setCharging(value === Battery.BatteryState.CHARGING));

    levelSub = Battery.addBatteryLevelListener(({ batteryLevel }) => setLevel(batteryLevel));
    stateSub = Battery.addBatteryStateListener(({ batteryState }) =>
      setCharging(batteryState === Battery.BatteryState.CHARGING)
    );

    return () => {
      levelSub?.remove();
      stateSub?.remove();
    };
  }, []);

  const pct = level == null ? '—' : `${Math.round(level * 100)}%`;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Battery</Text>
      <Text style={styles.percent}>{pct}</Text>
      <Text style={styles.meta}>{charging ? 'Charging' : 'Not charging'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 16, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 14 },
  title: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  percent: { color: '#fff', fontSize: 42, fontWeight: '300' },
  meta: { color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 2 },
});

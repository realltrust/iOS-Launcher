import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  colors: [string, string];
  children: React.ReactNode;
};

export default function GradientShell({ colors, children }: Props) {
  return (
    <LinearGradient colors={colors} style={styles.root}>
      <View style={styles.overlay}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)' },
});

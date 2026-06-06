import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../../context/LauncherContext';

export default function TasksWidget() {
  const { tasks, toggleTask, deleteTask } = useLauncher();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
      </View>
      {tasks.length === 0 ? <Text style={styles.empty}>No tasks yet</Text> : null}
      {tasks.slice(0, 4).map((task) => (
        <View key={task.id} style={styles.row}>
          <Pressable onPress={() => void toggleTask(task.id)} style={styles.rowLeft}>
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={task.completed ? '#30d158' : '#fff'}
            />
            <Text style={[styles.taskTitle, task.completed && styles.completed]}>{task.title}</Text>
          </Pressable>
          <Pressable onPress={() => void deleteTask(task.id)} hitSlop={10}>
            <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 16, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { color: '#fff', fontSize: 14, fontWeight: '700' },
  empty: { color: 'rgba(255,255,255,0.74)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  taskTitle: { color: '#fff', marginLeft: 10, fontSize: 15, flex: 1 },
  completed: { textDecorationLine: 'line-through', color: 'rgba(255,255,255,0.55)' },
});

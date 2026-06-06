import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLauncher } from '../context/LauncherContext';

export default function TasksScreen() {
  const { tasks, addTask, toggleTask, deleteTask } = useLauncher();
  const [text, setText] = useState('');

  const submit = async () => {
    if (!text.trim()) {
      Alert.alert('Add a task', 'Type something first.');
      return;
    }
    await addTask(text);
    setText('');
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.heading}>Tasks</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Buy milk"
          placeholderTextColor="rgba(255,255,255,0.45)"
          onSubmitEditing={() => void submit()}
        />
        <Pressable onPress={() => void submit()} style={styles.button}><Text style={styles.buttonText}>Add</Text></Pressable>
      </View>

      {tasks.map((task) => (
        <View key={task.id} style={styles.taskRow}>
          <Pressable onPress={() => void toggleTask(task.id)} style={styles.taskLeft}>
            <View style={[styles.check, task.completed && styles.checkDone]} />
            <Text style={[styles.taskText, task.completed && styles.taskDone]}>{task.title}</Text>
          </Pressable>
          <Pressable onPress={() => void deleteTask(task.id)}><Text style={styles.delete}>Delete</Text></Pressable>
        </View>
      ))}
      {tasks.length === 0 ? <Text style={styles.empty}>No tasks yet.</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0b0f', padding: 18 },
  heading: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', paddingHorizontal: 14, paddingVertical: 13, borderRadius: 14, fontSize: 15 },
  button: { backgroundColor: '#0a84ff', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  buttonText: { color: '#fff', fontWeight: '700' },
  taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  check: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#fff', marginRight: 10 },
  checkDone: { backgroundColor: '#30d158', borderColor: '#30d158' },
  taskText: { color: '#fff', fontSize: 16, flex: 1 },
  taskDone: { textDecorationLine: 'line-through', color: 'rgba(255,255,255,0.55)' },
  delete: { color: '#ff453a' },
  empty: { color: 'rgba(255,255,255,0.62)', marginTop: 18 },
});

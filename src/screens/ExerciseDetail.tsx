import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { colors } from '../theme';
import { saveWorkoutEntry } from '../services/storage/storageService';

export default function ExerciseDetail({ route, navigation }: any) {
  const exercise = route?.params?.exercise || {};
  const templateId = route?.params?.templateId || route?.params?.template?.id;

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState<Array<any>>([]);

  function addSet() {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (isNaN(w) || isNaN(r)) {
      Alert.alert('Invalid input', 'Please enter numeric weight and reps');
      return;
    }
    const newSet = { weight: w, reps: r, timestamp: new Date().toISOString() };
    setSets(prev => [...prev, newSet]);
    setWeight('');
    setReps('');
  }

  function removeSet(index: number) {
    setSets(prev => prev.filter((_, i) => i !== index));
  }

  async function saveWorkout() {
    if (!exercise?.id) {
      Alert.alert('Missing exercise', 'Cannot save workout without exercise id');
      return;
    }
    if (sets.length === 0) {
      Alert.alert('No sets', 'Add at least one set before saving');
      return;
    }
    const id = `${templateId || 'manual'}-${exercise.id}-${Date.now()}`;
    const entry = {
      id,
      templateId: templateId || null,
      date: new Date().toISOString(),
      sets,
    };

    try {
      await saveWorkoutEntry(entry);
      Alert.alert('Saved', 'Workout entry saved');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save workout');
    }
  }

  const instructions = Array.isArray(exercise.instructions)
    ? exercise.instructions
    : (exercise.instructions || '').split('\n').filter(Boolean);

  return (
    <View style={styles.container}>
      {exercise.image ? (
        <Image source={{ uri: exercise.image }} style={styles.image} />
      ) : null}
      <Text style={styles.name}>{exercise.name}</Text>
      <Text style={styles.meta}>Primary: {exercise.primary_muscle || '—'}</Text>
      <Text style={styles.meta}>Equipment: {exercise.equipment || '—'}</Text>
      {exercise.description ? <Text style={styles.description}>{exercise.description}</Text> : null}

      <Text style={styles.sectionTitle}>Instructions</Text>
      <FlatList
        data={instructions}
        keyExtractor={(item, idx) => String(idx)}
        renderItem={({ item }) => (
          <View style={styles.instructionRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.instructionText}>{item}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
      />

      <Text style={styles.sectionTitle}>Record Set</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Weight (KG)"
          keyboardType="numeric"
          accessibilityLabel="weight-input"
        />
        <TextInput
          style={styles.input}
          value={reps}
          onChangeText={setReps}
          placeholder="Reps"
          keyboardType="numeric"
          accessibilityLabel="reps-input"
        />
        <TouchableOpacity style={styles.addButton} onPress={addSet} accessibilityRole="button">
          <Text style={styles.addButtonText}>Add Set</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Unsaved Sets</Text>
      {sets.length === 0 ? (
        <Text style={styles.placeholder}>No sets added yet.</Text>
      ) : (
        <FlatList
          data={sets}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={({ item, index }) => (
            <View style={styles.setRow}>
              <Text style={styles.setText}>{item.weight} KG × {item.reps}</Text>
              <TouchableOpacity onPress={() => removeSet(index)} accessibilityRole="button">
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        />
      )}

      <View style={{ height: 12 }} />
      <TouchableOpacity style={styles.saveButton} onPress={saveWorkout} accessibilityRole="button">
        <Text style={styles.saveText}>Save Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12, backgroundColor: colors.surface },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 6 },
  meta: { color: colors.muted, marginBottom: 4 },
  description: { color: colors.text, marginBottom: 8 },
  sectionTitle: { color: colors.accent, marginTop: 8, marginBottom: 6, fontWeight: '700' },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start' },
  bullet: { color: colors.text, marginRight: 8 },
  instructionText: { color: colors.text, flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, padding: 8, marginRight: 8, backgroundColor: colors.surface, color: colors.text, borderRadius: 6 },
  addButton: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: colors.primary, borderRadius: 6 },
  addButtonText: { color: colors.text, fontWeight: '700' },
  placeholder: { color: colors.muted },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: colors.surface, borderRadius: 6 },
  setText: { color: colors.text },
  removeText: { color: colors.primary, fontWeight: '700' },
  saveButton: { marginTop: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8 },
  saveText: { color: colors.background, fontWeight: '700' },
});

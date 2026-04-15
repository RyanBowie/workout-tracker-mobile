import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { colors } from '../theme';
import { saveWorkoutEntryWithSets } from '../services/storage/storageService';

type Props = {
  exercise: any;
  templateId?: string | null;
  onSaved?: (report: { success: boolean; entries?: any[]; error?: any }) => void;
  compact?: boolean; // smaller layout for inline use
};

export default function ExerciseSetInput({ exercise, templateId, onSaved, compact }: Props) {
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
    const newSet = { weightKg: w, reps: r, timestamp: new Date().toISOString() };
    setSets(prev => [...prev, newSet]);
    setWeight('');
    setReps('');
  }

  function removeSet(index: number) {
    setSets(prev => prev.filter((_, i) => i !== index));
  }

  function editSet(index: number) {
    const s = sets[index];
    if (!s) return;
    setWeight(String(s.weightKg));
    setReps(String(s.reps));
    setSets(prev => prev.filter((_, i) => i !== index));
  }

  async function saveAll() {
    if (!exercise?.id) {
      Alert.alert('Missing exercise', 'Cannot save workout without exercise id');
      onSaved && onSaved({ success: false, error: 'missing-exercise-id' });
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
      exerciseId: exercise.id,
      date: new Date().toISOString(),
      sets,
    };

    try {
      await saveWorkoutEntryWithSets(entry);
      setSets([]);
      onSaved && onSaved({ success: true, entries: [entry] });
      Alert.alert('Saved', 'Workout entry saved');
    } catch (e) {
      onSaved && onSaved({ success: false, error: e });
      Alert.alert('Error', 'Failed to save workout');
    }
  }

  return (
    <View style={[styles.container, compact ? styles.compact : undefined]}>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={weight}
          onChangeText={setWeight}
          placeholder="Weight (KG)"
          keyboardType="numeric"
          accessibilityLabel="weight-input"
        />
        <TextInput
          style={[styles.input, { width: 80 }]}
          value={reps}
          onChangeText={setReps}
          placeholder="Reps"
          keyboardType="numeric"
          accessibilityLabel="reps-input"
        />
        <TouchableOpacity style={styles.addButton} onPress={addSet} accessibilityRole="button">
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 8 }} />

      {sets.length === 0 ? (
        <Text style={styles.placeholder}>No sets added yet.</Text>
      ) : (
        <FlatList
          data={sets}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={({ item, index }) => (
            <View style={styles.setRow}>
              <Text style={styles.setText}>{item.weightKg} KG × {item.reps}</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => editSet(index)}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <View style={{ width: 12 }} />
                <TouchableOpacity onPress={() => removeSet(index)}>
                  <Text style={[styles.actionText, { color: colors.primary }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        />
      )}

      <View style={{ height: 8 }} />
      <TouchableOpacity style={styles.saveButton} onPress={saveAll} accessibilityRole="button">
        <Text style={styles.saveText}>Save Sets</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: colors.surface, borderRadius: 8 },
  compact: { padding: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { padding: 8, marginRight: 8, backgroundColor: '#0B1620', color: colors.text, borderRadius: 6 },
  addButton: { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: colors.primary, borderRadius: 6 },
  addButtonText: { color: colors.background, fontWeight: '700' },
  placeholder: { color: colors.muted },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#07151D', borderRadius: 6 },
  setText: { color: colors.text },
  actionText: { color: colors.accent, marginHorizontal: 6 },
  saveButton: { marginTop: 8, paddingVertical: 8, alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8 },
  saveText: { color: colors.background, fontWeight: '700' },
});

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { colors } from '../theme';
import ExerciseSetInput from '../components/ExerciseSetInput';
import { getWorkoutById } from '../services/storage/storageService';

export default function WorkoutScreen({ navigation, route }: any) {
  const template = route?.params?.template;
  const workoutId = route?.params?.workoutId;
  const sessions = template?.sessions || [];
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [pastEntry, setPastEntry] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!workoutId) return;
      const e = await getWorkoutById(workoutId);
      if (mounted) setPastEntry(e);
    }
    load();
    return () => { mounted = false };
  }, [workoutId]);

  // If opened from history, show the saved workout entry
  if (workoutId) {
    if (!pastEntry) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Loading workout…</Text>
        </View>
      );
    }

    const totalVolume = (pastEntry.sets || []).reduce((s: number, se: any) => s + (se.weightKg || se.kg || 0) * (se.reps || 0), 0);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{pastEntry.templateId || 'Workout'} — {new Date(pastEntry.date).toLocaleString()}</Text>

        <View style={{ height: 12 }} />
        <FlatList
          data={pastEntry.sets || []}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={({ item, index }) => (
            <View style={styles.exerciseRow}>
              <View style={styles.rowIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>Set {index + 1}</Text>
                <Text style={styles.intervalText}>{(item.weightKg || item.kg || 0)} KG × {item.reps} reps</Text>
              </View>
              {(pastEntry.exerciseId) ? (
                <TouchableOpacity onPress={() => navigation.navigate('Exercise', { exercise: { id: pastEntry.exerciseId, name: pastEntry.exerciseId }, templateId: pastEntry.templateId })}>
                  <Text style={[styles.backText, { color: colors.primary }]}>Open Exercise</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />

        <View style={{ height: 12 }} />
        <Text style={styles.meta}>Total: {Math.round(totalVolume)} kg · {pastEntry.sets.length} sets</Text>

        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button">
          <Text style={styles.backText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderIcon(exercise: any, size = 48) {
    const uri = exercise.icon || exercise.image || null;
    if (uri) return <Image source={{ uri }} style={[styles.rowIcon, { width: size, height: size }]} />;
    if (exercise.iconEmoji) return <Text style={[styles.emoji, { fontSize: size * 0.6 }]}>{exercise.iconEmoji}</Text>;

    // fallback placeholder with initials
    const initials = (exercise.name || '').split(' ').slice(0,2).map((s: string)=>s[0]).join('').toUpperCase();
    return (
      <View style={[styles.rowIcon, { width: size, height: size, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.muted, fontWeight: '700' }}>{initials}</Text>
      </View>
    );
  }

  // thumbnail row for quick identification
  function renderThumbnails(exList: any[]) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {exList.map((ex, i) => (
          <TouchableOpacity key={i} onPress={() => navigation.navigate('Exercise', { exercise: ex, templateId: template.id })} accessibilityRole="button">
            <View style={{ marginRight: 8 }}>{renderIcon(ex, 44)}</View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{template.name}</Text>

      {!selectedSession ? (
        <FlatList
          data={sessions}
          keyExtractor={(item, idx) => item.name ? item.name : String(idx)}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedSession(item)} accessibilityRole="button">
              <View style={styles.intervalRow}>
                <Text style={styles.intervalIndex}>{item.name}</Text>
                <Text style={styles.intervalText}>{(item.exercises || []).length} exercises</Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setSelectedSession(null)} accessibilityRole="button">
            <Text style={[styles.backText, { marginBottom: 8 }]}>← Back to sessions</Text>
          </TouchableOpacity>

          {renderThumbnails(selectedSession.exercises || [])}

          <FlatList
            data={selectedSession.exercises || []}
            keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
            renderItem={({ item }) => (
              <View>
                <View style={styles.exerciseRow}>
                  {renderIcon(item)}
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => navigation.navigate('Exercise', { exercise: item, templateId: template.id })}
                    accessibilityRole="button"
                  >
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <Text style={styles.intervalText}>{item.primary_muscle || item.primary_muscle || ''}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addInline}
                    onPress={() => setExpandedExercise(expandedExercise === item.id ? null : item.id)}
                    accessibilityRole="button"
                  >
                    <Text style={{ color: colors.background, fontWeight: '700' }}>Add</Text>
                  </TouchableOpacity>
                </View>

                {expandedExercise === item.id ? (
                  <View style={{ marginTop: 8 }}>
                    <ExerciseSetInput exercise={item} templateId={template.id} compact onSaved={() => setExpandedExercise(null)} />
                  </View>
                ) : null}
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        </View>
      )}

      <View style={{ height: 12 }} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button">
        <Text style={styles.backText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 12 },
  placeholder: { color: colors.muted, marginBottom: 20 },
  intervalRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.surface, borderRadius: 8 },
  intervalIndex: { flex: 1, fontWeight: '700', color: colors.primary },
  intervalText: { color: colors.text },
  backButton: { marginTop: 6, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  backText: { color: colors.text, fontWeight: '600' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.surface, borderRadius: 8 },
  exerciseName: { fontWeight: '700', color: colors.primary, marginBottom: 2 },
  rowIcon: { width: 48, height: 48, borderRadius: 6, marginRight: 12, backgroundColor: '#07151D' },
  emoji: { fontSize: 28, marginRight: 12 },
  addInline: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.primary, borderRadius: 6 },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { colors } from '../theme';
import ExerciseSetInput from '../components/ExerciseSetInput';

export default function ExerciseDetail({ route, navigation }: any) {
  const exercise = route?.params?.exercise || {};
  const templateId = route?.params?.templateId || route?.params?.template?.id;

  const instructions = Array.isArray(exercise.instructions)
    ? exercise.instructions
    : (exercise.instructions || '').split('\n').filter(Boolean);

  function renderIcon() {
    const placeholder = 'https://via.placeholder.com/96';
    const uri = exercise.icon || exercise.image || null;
    if (uri) {
      return <Image source={{ uri }} style={styles.icon} />;
    }
    if (exercise.iconEmoji) {
      return <Text style={styles.emoji}>{exercise.iconEmoji}</Text>;
    }
    return <Image source={{ uri: placeholder }} style={styles.icon} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={{ alignItems: 'center' }}>
        {renderIcon()}
        <Text style={styles.name}>{exercise.name}</Text>
      </View>

      <Text style={styles.meta}>Primary: {exercise.primary_muscle || '—'}</Text>
      <Text style={styles.meta}>Equipment: {exercise.equipment || '—'}</Text>
      {exercise.secondaryMuscles ? (
        <Text style={styles.meta}>Targets: {(exercise.secondaryMuscles || []).join(', ')}</Text>
      ) : null}

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

      {exercise.exampleSets ? (
        <>
          <Text style={styles.sectionTitle}>Example Sets</Text>
          {Array.isArray(exercise.exampleSets) && exercise.exampleSets.map((ex: any, i: number) => (
            <Text key={i} style={{ color: colors.muted }}>{ex.sets} × {ex.reps} — {ex.weight}</Text>
          ))}
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Log Sets</Text>
      <ExerciseSetInput exercise={exercise} templateId={templateId} onSaved={() => navigation.goBack()} />

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  icon: { width: 96, height: 96, borderRadius: 8, marginBottom: 8, backgroundColor: colors.surface },
  emoji: { fontSize: 64, marginBottom: 8 },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 6 },
  meta: { color: colors.muted, marginBottom: 4, paddingHorizontal: 8 },
  description: { color: colors.text, marginBottom: 8, paddingHorizontal: 8 },
  sectionTitle: { color: colors.accent, marginTop: 8, marginBottom: 6, fontWeight: '700', paddingHorizontal: 8 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 8 },
  bullet: { color: colors.text, marginRight: 8 },
  instructionText: { color: colors.text, flex: 1 },
});

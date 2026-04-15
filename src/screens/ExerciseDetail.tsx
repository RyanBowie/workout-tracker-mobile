import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { colors } from '../theme';
import ExerciseSetInput from '../components/ExerciseSetInput';

export default function ExerciseDetail({ route, navigation }: any) {
  const exercise = route?.params?.exercise || {};
  const templateId = route?.params?.templateId || route?.params?.template?.id;

  const instructions = Array.isArray(exercise.instructions)
    ? exercise.instructions
    : (exercise.instructions || exercise.howTo || '').split('\n').filter(Boolean);

  function renderIcon() {
    const uri = exercise.icon || exercise.image || null;
    if (uri) {
      return <Image source={{ uri }} style={styles.icon} />;
    }
    if (exercise.iconEmoji) {
      return <Text style={styles.emoji}>{exercise.iconEmoji}</Text>;
    }
    const initials = (exercise.name || '').split(' ').slice(0,2).map((s: string)=>s[0]).join('').toUpperCase();
    return (
      <View style={styles.iconPlaceholder}>
        <Text style={{ color: colors.muted, fontWeight: '700', fontSize: 24 }}>{initials}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={{ alignItems: 'center' }}>
        {renderIcon()}
        <Text style={styles.name}>{exercise.name}</Text>
      </View>

      <Text style={styles.meta}>Primary: {exercise.primary_muscle || exercise.primary_muscle || '—'}</Text>
      <Text style={styles.meta}>Equipment: {exercise.equipment || '—'}</Text>

      {exercise.muscles && Array.isArray(exercise.muscles) ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {exercise.muscles.map((m: string, i: number) => (
            <View key={i} style={styles.chip}><Text style={styles.chipText}>{m}</Text></View>
          ))}
        </View>
      ) : null}

      {exercise.description ? <Text style={styles.description}>{exercise.description}</Text> : null}

      {instructions && instructions.length ? (
        <>
          <Text style={styles.sectionTitle}>How to</Text>
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
        </>
      ) : null}

      {exercise.tips ? (
        <>
          <Text style={styles.sectionTitle}>Tips</Text>
          <Text style={{ color: colors.muted, paddingHorizontal: 8 }}>{exercise.tips}</Text>
        </>
      ) : null}

      {exercise.exampleSets ? (
        <>
          <Text style={styles.sectionTitle}>Example Sets</Text>
          {Array.isArray(exercise.exampleSets) && exercise.exampleSets.map((ex: any, i: number) => (
            <View key={i} style={{ paddingHorizontal: 8, marginBottom: 6 }}>
              <Text style={{ color: colors.text }}>{ex.sets} × {ex.reps} {ex.weight ? `— ${ex.weight}` : ''}</Text>
              {ex.rest_seconds ? <Text style={{ color: colors.muted, fontSize: 12 }}>Rest: {ex.rest_seconds}s</Text> : null}
            </View>
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
  iconPlaceholder: { width: 96, height: 96, borderRadius: 8, marginBottom: 8, backgroundColor: '#081018', alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64, marginBottom: 8 },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 6 },
  meta: { color: colors.muted, marginBottom: 4, paddingHorizontal: 8 },
  description: { color: colors.text, marginBottom: 8, paddingHorizontal: 8 },
  sectionTitle: { color: colors.accent, marginTop: 8, marginBottom: 6, fontWeight: '700', paddingHorizontal: 8 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 8 },
  bullet: { color: colors.text, marginRight: 8 },
  instructionText: { color: colors.text, flex: 1 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.surface, borderRadius: 16, marginRight: 8, marginBottom: 6 },
  chipText: { color: colors.text, fontSize: 12 },
});

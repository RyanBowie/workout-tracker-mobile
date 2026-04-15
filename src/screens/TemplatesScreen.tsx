import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme';
import splitsData from '../data/sample-splits.json';

export default function TemplatesScreen({ navigation }: any) {
  const templates = useMemo(() => (splitsData as any).templates || (splitsData as any).splits || [], []);

  function renderThumb(ex: any, idx: number) {
    const uri = ex.icon || ex.image || null;
    if (uri) return <Image key={idx} source={{ uri }} style={styles.thumb} />;
    if (ex.iconEmoji) return <Text key={idx} style={styles.thumbEmoji}>{ex.iconEmoji}</Text>;

    const initials = (ex.name || '').split(' ').slice(0,2).map((s: string)=>s[0]).join('').toUpperCase();
    return (
      <View key={idx} style={styles.thumbPlaceholder}>
        <Text style={styles.thumbInitials}>{initials}</Text>
      </View>
    );
  }

  function renderItem({ item }: any) {
    const sessions = item.sessions || [];
    const exerciseCount = sessions.reduce((acc: number, s: any) => acc + (s.exercises ? s.exercises.length : 0), 0);
    const desc = `${sessions.length} session(s) • ${exerciseCount} exercise(s)`;

    // collect first few exercises for a small thumbnail row
    const allExercises = ([] as any[]).concat(...sessions.map((s: any) => s.exercises || []));
    const thumbs = allExercises.slice(0, 4);

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.desc}>{desc}</Text>

          <View style={styles.thumbRow}>
            {thumbs.length ? thumbs.map((ex: any, i: number) => renderThumb(ex, i)) : (
              <View style={styles.thumbPlaceholderSmall}><Text style={styles.thumbInitials}>—</Text></View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('Workout', { template: item })} accessibilityRole="button">
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Templates</Text>
      <FlatList
        data={templates}
        keyExtractor={(item, idx) => item.name ? item.name : String(idx)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12, color: colors.text },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  name: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 },
  desc: { color: colors.muted },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  startText: { color: '#081014', fontWeight: '700' },
  thumbRow: { flexDirection: 'row', marginTop: 8 },
  thumb: { width: 36, height: 36, borderRadius: 6, marginRight: 8, backgroundColor: colors.surface },
  thumbEmoji: { fontSize: 20, marginRight: 8 },
  thumbPlaceholder: { width: 36, height: 36, borderRadius: 6, marginRight: 8, backgroundColor: '#0B1620', alignItems: 'center', justifyContent: 'center' },
  thumbPlaceholderSmall: { width: 36, height: 36, borderRadius: 6, marginRight: 8, backgroundColor: '#0B1620', alignItems: 'center', justifyContent: 'center' },
  thumbInitials: { color: colors.muted, fontWeight: '700' },
});

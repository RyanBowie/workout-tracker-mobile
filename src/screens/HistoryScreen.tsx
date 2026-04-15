import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '../theme';
import * as storage from '../services/storage/storageService';

function formatDate(d: string) {
  try { return new Date(d).toLocaleString(); } catch { return d; }
}

function dayKey(iso: string) {
  return iso ? iso.split('T')[0] : '';
}

export default function HistoryScreen({ navigation }: any) {
  const [history, setHistory] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [filterDays, setFilterDays] = useState(30);

  useEffect(() => {
    let mounted = true;
    async function load() {
      await storage.init();
      const h = await storage.getWorkoutHistory();
      // sort desc by date
      h.sort((a: any,b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (mounted) setHistory(h);
    }
    load();
    return () => { mounted = false };
  }, []);

  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - filterDays);
    return history.filter(h => {
      const d = new Date(h.date);
      if (isNaN(d.getTime())) return false;
      if (d < cutoff) return false;
      if (!query) return true;
      const name = (h.templateId || '') + '';
      return name.toLowerCase().includes(query.toLowerCase());
    });
  }, [history, filterDays, query]);

  // progress: weekly totals for last 4 weeks
  const weekly = useMemo(() => {
    const now = new Date();
    const weeks: number[] = [0,0,0,0];
    filtered.forEach(item => {
      const d = new Date(item.date);
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000*60*60*24));
      const weekIndex = Math.floor(diffDays / 7);
      if (weekIndex >=0 && weekIndex < 4) {
        const vol = (item.sets || []).reduce((s: number, se: any) => s + (se.weightKg || se.kg || 0) * (se.reps || 0), 0);
        weeks[weekIndex] += vol;
      }
    });
    return weeks.reverse(); // oldest -> newest
  }, [filtered]);

  function renderItem({ item }: any) {
    const totalVolume = (item.sets || []).reduce((s: number, se: any) => s + (se.weightKg || se.kg || 0) * (se.reps || 0), 0);
    const totalSets = (item.sets || []).length;
    const totalReps = (item.sets || []).reduce((s: number, se: any) => s + (se.reps || 0), 0);

    const title = item.templateId || 'Manual';

    return (
      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Workout', { workoutId: item.id })} accessibilityRole="button">
        <View style={styles.left}>
          <View style={styles.thumb}><Text style={styles.thumbText}>{(title || 'M').slice(0,2).toUpperCase()}</Text></View>
        </View>
        <View style={styles.middle}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.metric}>{Math.round(totalVolume)} kg</Text>
          <Text style={styles.meta}>{totalSets} sets · {totalReps} reps</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>History</Text>

      <View style={styles.progressRow}>
        {weekly.map((w, i) => (
          <View key={i} style={styles.progressItem}>
            <View style={[styles.bar, { height: Math.min(80, Math.max(6, Math.round(w / Math.max(1, Math.max(...weekly || [1])) * 80))) }]} />
            <Text style={styles.metaSmall}>{Math.round(w)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <View style={{ flex: 1 }}>
          <TextInput placeholder="Search template" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={styles.search} />
        </View>
        <View style={{ width: 12 }} />
        <View style={styles.chips}>
          {[7,30,90].map(d => (
            <TouchableOpacity key={d} onPress={() => setFilterDays(d)} style={[styles.chip, filterDays===d?styles.chipActive:null]} accessibilityRole="button">
              <Text style={[styles.chipText, filterDays===d?styles.chipTextActive:null]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingVertical: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.background },
  header: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressItem: { alignItems: 'center', flex: 1, marginHorizontal: 6 },
  bar: { width: '100%', backgroundColor: colors.primary, borderRadius: 6 },
  metaSmall: { color: colors.muted, fontSize: 12, marginTop: 6 },
  controls: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  search: { padding: 8, backgroundColor: colors.surface, color: colors.text, borderRadius: 8 },
  chips: { flexDirection: 'row' },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)', marginLeft: 6 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.text },
  chipTextActive: { color: colors.background, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.surface, borderRadius: 8 },
  left: { width: 56 },
  thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#081018', alignItems: 'center', justifyContent: 'center' },
  thumbText: { color: colors.muted, fontWeight: '700' },
  middle: { flex: 1, paddingHorizontal: 8 },
  title: { color: colors.primary, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 12 },
  right: { alignItems: 'flex-end' },
  metric: { color: colors.text, fontWeight: '700' }
});

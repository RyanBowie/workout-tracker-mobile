import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { colors } from '../theme';

export default function WorkoutScreen({ navigation, route }: any) {
  const template = route?.params?.template;
  const sessions = template?.sessions || [];
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  if (!template) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>No template selected.</Text>
        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button">
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
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

          <FlatList
            data={selectedSession.exercises || []}
            keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Exercise', { exercise: item, templateId: template.id })}
                accessibilityRole="button"
              >
                <View style={styles.intervalRow}>
                  <Text style={styles.intervalIndex}>{item.name}</Text>
                  <Text style={styles.intervalText}>{item.primary_muscle || ''}</Text>
                </View>
              </TouchableOpacity>
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
});

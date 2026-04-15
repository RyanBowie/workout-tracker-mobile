import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, WorkoutTemplate, WorkoutEntry } from '../../models/workout';
import sampleSplits from '../../data/sample-splits.json';

const DB_NAME = 'workout-tracker.db';
const WORKOUT_TABLE = 'workout_entries';
const SPLITS_KEY = 'sample_splits_v1';

let db: SQLite.WebSQLDatabase | null = null;

export async function init() {
  try {
    db = SQLite.openDatabase(DB_NAME);
    await new Promise<void>((resolve, reject) => {
      db!.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${WORKOUT_TABLE} (
            id TEXT PRIMARY KEY NOT NULL,
            templateId TEXT,
            date TEXT,
            sets TEXT
          );`,
          [],
          () => resolve(),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  } catch (e) {
    db = null;
  }
}

export async function saveWorkoutEntry(entry: WorkoutEntry) {
  if (db) {
    await new Promise<void>((resolve, reject) => {
      db!.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO ${WORKOUT_TABLE} (id, templateId, date, sets) VALUES (?, ?, ?, ?);`,
          [entry.id, entry.templateId, entry.date, JSON.stringify(entry.sets)],
          () => resolve(),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  } else {
    // fallback to AsyncStorage
    const history = await getWorkoutHistory();
    const filtered = history.filter(e => e.id !== entry.id);
    filtered.push(entry);
    await AsyncStorage.setItem(WORKOUT_TABLE, JSON.stringify(filtered));
  }
}

export async function getWorkoutHistory(): Promise<WorkoutEntry[]> {
  if (db) {
    return await new Promise<WorkoutEntry[]>((resolve, reject) => {
      db!.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM ${WORKOUT_TABLE};`,
          [],
          (_, { rows }) => {
            const result: WorkoutEntry[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              result.push({
                id: row.id,
                templateId: row.templateId,
                date: row.date,
                sets: JSON.parse(row.sets)
              });
            }
            resolve(result);
          },
          (_, error) => { reject(error); return false; }
        );
      });
    });
  } else {
    const raw = await AsyncStorage.getItem(WORKOUT_TABLE);
    return raw ? JSON.parse(raw) : [];
  }
}

export async function deleteWorkoutEntry(id: string) {
  if (db) {
    await new Promise<void>((resolve, reject) => {
      db!.transaction(tx => {
        tx.executeSql(
          `DELETE FROM ${WORKOUT_TABLE} WHERE id = ?;`,
          [id],
          () => resolve(),
          (_, error) => { reject(error); return false; }
        );
      });
    });
  } else {
    const history = await getWorkoutHistory();
    const filtered = history.filter(e => e.id !== id);
    await AsyncStorage.setItem(WORKOUT_TABLE, JSON.stringify(filtered));
  }
}

export async function seedSampleSplits() {
  const existing = await AsyncStorage.getItem(SPLITS_KEY);
  if (!existing) {
    await AsyncStorage.setItem(SPLITS_KEY, JSON.stringify(sampleSplits, null, 2));
  }
}

// Helper to accept an entry object that may include exerciseId and createdAt
// Keeps backwards compatibility by mapping createdAt -> date and delegating to saveWorkoutEntry
export async function saveWorkoutEntryWithSets(entry: any) {
  const mapped = {
    id: entry.id,
    templateId: entry.templateId || null,
    date: entry.createdAt || entry.date || new Date().toISOString(),
    sets: entry.sets || [],
  };
  // Delegate to existing save function which persists to SQLite or AsyncStorage
  return await saveWorkoutEntry(mapped as any);
}

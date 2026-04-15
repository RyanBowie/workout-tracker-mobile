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

export type HistorySummary = {
  id: string;
  templateId: string | null;
  templateName: string | null;
  date: string;
  sets: any[];
  totalVolumeKg: number;
  totalReps: number;
  totalSets: number;
};

export interface GetHistoryOptions {
  limit?: number;
  offset?: number;
  fromDate?: string; // ISO
  toDate?: string; // ISO
  templateId?: string;
  search?: string; // searches templateId and raw sets JSON
}

/**
 * Get workout history with simple progress metrics computed per entry.
 * Falls back to AsyncStorage when SQLite is unavailable.
 *
 * Example:
 * const items = await getWorkoutHistory({ limit: 20, fromDate: '2023-01-01' });
 */
export async function getWorkoutHistory(opts?: GetHistoryOptions): Promise<any> {
  // Backwards compatible: when called with no args, return raw WorkoutEntry[] as before.
  if (typeof opts === 'undefined') {
    try {
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
                  try { result.push({ id: row.id, templateId: row.templateId, date: row.date, sets: JSON.parse(row.sets) }); }
                  catch { result.push({ id: row.id, templateId: row.templateId, date: row.date, sets: [] }); }
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
    } catch (e) {
      return [];
    }
  }

  const { limit = 50, offset = 0, fromDate, toDate, templateId, search } = opts;

  const safeParseSets = (raw: any): any[] => {
    try {
      if (!raw) return [];
      if (typeof raw === 'string') return JSON.parse(raw);
      if (Array.isArray(raw)) return raw;
      return [];
    } catch (e) {
      return [];
    }
  };

  const computeMetrics = (sets: any[]) => {
    let totalVolumeKg = 0;
    let totalReps = 0;
    let totalSets = 0;
    if (!Array.isArray(sets)) return { totalVolumeKg, totalReps, totalSets };
    for (const s of sets) {
      const kg = Number(s && s.kg) || 0;
      const reps = Number(s && s.reps) || 0;
      totalVolumeKg += kg * reps;
      totalReps += reps;
      totalSets += 1;
    }
    return { totalVolumeKg, totalReps, totalSets };
  };

  try {
    if (db) {
      // Build SQL with optional filters; keep sets as text so we can parse locally
      let sql = `SELECT * FROM ${WORKOUT_TABLE} WHERE 1=1`;
      const params: any[] = [];
      if (fromDate) { sql += ` AND date >= ?`; params.push(fromDate); }
      if (toDate) { sql += ` AND date <= ?`; params.push(toDate); }
      if (templateId) { sql += ` AND templateId = ?`; params.push(templateId); }
      if (search) { sql += ` AND (templateId LIKE ? OR sets LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
      sql += ` ORDER BY date DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      return await new Promise<HistorySummary[]>((resolve, reject) => {
        db!.transaction(tx => {
          tx.executeSql(
            sql,
            params,
            (_, { rows }) => {
              const result: HistorySummary[] = [];
              for (let i = 0; i < rows.length; i++) {
                const row = rows.item(i);
                const sets = safeParseSets(row.sets);
                const metrics = computeMetrics(sets);
                result.push({
                  id: row.id,
                  templateId: row.templateId || null,
                  templateName: null, // schema does not store templateName; leave null
                  date: row.date,
                  sets,
                  totalVolumeKg: metrics.totalVolumeKg,
                  totalReps: metrics.totalReps,
                  totalSets: metrics.totalSets,
                });
              }
              resolve(result);
            },
            (_, error) => { reject(error); return false; }
          );
        });
      });
    }
  } catch (e) {
    // Fall through to AsyncStorage fallback
  }

  // Fallback when SQLite unavailable or failed
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_TABLE);
    const all: WorkoutEntry[] = raw ? JSON.parse(raw) : [];
    // validate and map
    const filtered = all.filter(e => {
      if (!e || !e.date) return false;
      if (fromDate && e.date < fromDate) return false;
      if (toDate && e.date > toDate) return false;
      if (templateId && e.templateId !== templateId) return false;
      if (search) {
        const hay = (e.templateId || '') + ' ' + JSON.stringify(e.sets || []);
        if (!hay.includes(search)) return false;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));

    const page = filtered.slice(offset, offset + limit);
    return page.map(e => {
      const sets = Array.isArray(e.sets) ? e.sets : [];
      const metrics = computeMetrics(sets);
      return {
        id: e.id,
        templateId: e.templateId || null,
        templateName: null,
        date: e.date,
        sets,
        totalVolumeKg: metrics.totalVolumeKg,
        totalReps: metrics.totalReps,
        totalSets: metrics.totalSets,
      };
    });
  } catch (e) {
    return []; // unit-friendly empty fallback
  }
}

/**
 * Retrieve a full workout entry by id.
 * Returns null if not found.
 *
 * Example:
 * const entry = await getWorkoutById('entry-123');
 */
export async function getWorkoutById(id: string): Promise<WorkoutEntry | null> {
  if (!id) return null;
  try {
    if (db) {
      return await new Promise<WorkoutEntry | null>((resolve, reject) => {
        db!.transaction(tx => {
          tx.executeSql(
            `SELECT * FROM ${WORKOUT_TABLE} WHERE id = ? LIMIT 1;`,
            [id],
            (_, { rows }) => {
              if (rows.length === 0) return resolve(null);
              const row = rows.item(0);
              try {
                const sets = JSON.parse(row.sets);
                resolve({ id: row.id, templateId: row.templateId, date: row.date, sets });
              } catch (e) {
                resolve({ id: row.id, templateId: row.templateId, date: row.date, sets: [] });
              }
            },
            (_, error) => { reject(error); return false; }
          );
        });
      });
    }
  } catch (e) {
    // fallthrough to AsyncStorage
  }

  try {
    const raw = await AsyncStorage.getItem(WORKOUT_TABLE);
    const all: WorkoutEntry[] = raw ? JSON.parse(raw) : [];
    const found = all.find(a => a.id === id);
    if (!found) return null;
    return { id: found.id, templateId: found.templateId, date: found.date, sets: Array.isArray(found.sets) ? found.sets : [] };
  } catch (e) {
    return null;
  }
}

/**
 * Compute weekly total volume (kg * reps) for the past N weeks (including current week).
 * Returns array with weekStart (ISO date at 00:00:00) and totalVolumeKg.
 *
 * Example:
 * const volumes = await getWeeklyVolume(6);
 */
export async function getWeeklyVolume(weeks = 4): Promise<{ weekStart: string; totalVolumeKg: number }[]> {
  if (weeks <= 0) weeks = 1;
  const msPerDay = 24 * 60 * 60 * 1000;
  const msPerWeek = 7 * msPerDay;

  const now = new Date();
  // week starts on Monday
  const day = now.getDay(); // 0 (Sun) - 6 (Sat)
  const delta = (day + 6) % 7; // days since Monday
  const startOfCurrentWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - delta);
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  const fromDate = new Date(startOfCurrentWeek.getTime() - (weeks - 1) * msPerWeek).toISOString();
  // fetch entries since earliest week
  const entries = await getWorkoutHistory({ limit: 10000, offset: 0, fromDate });

  // Prepare map of weekStartISO -> totalVolume
  const map = new Map<string, number>();
  for (let i = 0; i < weeks; i++) {
    const wStart = new Date(startOfCurrentWeek.getTime() - (weeks - 1 - i) * msPerWeek);
    wStart.setHours(0, 0, 0, 0);
    map.set(wStart.toISOString(), 0);
  }

  for (const e of entries) {
    const d = new Date(e.date);
    // compute week start for this entry
    const day = d.getDay();
    const delta = (day + 6) % 7;
    const wStart = new Date(d.getFullYear(), d.getMonth(), d.getDate() - delta);
    wStart.setHours(0, 0, 0, 0);
    const key = wStart.toISOString();
    if (!map.has(key)) continue;
    const current = map.get(key) || 0;
    map.set(key, current + (e.totalVolumeKg || 0));
  }

  const result: { weekStart: string; totalVolumeKg: number }[] = [];
  for (const [k, v] of map.entries()) {
    result.push({ weekStart: k, totalVolumeKg: v });
  }
  // ensure sorted ascending by weekStart
  result.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  return result;
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

// Fetch a single workout entry by id. Since SQLite schema only stores sets as JSON
// and does not persist exerciseId as a column, this helper reads all history and
// returns the matching entry if available.
export async function getWorkoutById(id: string) {
  const all = await getWorkoutHistory();
  return all.find(e => e.id === id) || null;
}

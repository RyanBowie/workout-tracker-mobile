import AsyncStorage from '@react-native-async-storage/async-storage';
import * as storageService from '../src/services/storage/storageService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('storageService (AsyncStorage fallback)', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.setItem as jest.Mock).mockReset();
  });

  test('getWorkoutHistory returns parsed entries from AsyncStorage when SQLite unavailable', async () => {
    const entries = [{ id: '1', templateId: 't1', date: '2023-01-01', sets: [{ kg: 100, reps: 5 }] }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(entries));
    const result = await storageService.getWorkoutHistory();
    expect(result).toEqual(entries);
  });

  test('getWorkoutHistory computes metrics with options', async () => {
    const entries = [{ id: '2', templateId: 't1', date: '2023-01-02', sets: [{ kg: 10, reps: 3 }, { kg: 5, reps: 2 }] }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(entries));
    const res = await storageService.getWorkoutHistory({ limit: 10 });
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({
      id: '2',
      totalVolumeKg: 10 * 3 + 5 * 2,
      totalReps: 3 + 2,
      totalSets: 2,
    });
  });

  test('getWorkoutById returns entry when present', async () => {
    const entries = [{ id: '3', templateId: null, date: '2023-01-03', sets: [] }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(entries));
    const r = await storageService.getWorkoutById('3');
    expect(r).toMatchObject(entries[0]);
  });

  test('getWorkoutById returns null when not found', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([]));
    const r = await storageService.getWorkoutById('nope');
    expect(r).toBeNull();
  });
});

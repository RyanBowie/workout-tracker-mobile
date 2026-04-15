import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'workout_splits_v1';

export async function saveSplits(json: string) {
  await AsyncStorage.setItem(STORAGE_KEY, json);
}

export async function loadSplits() {
  const v = await AsyncStorage.getItem(STORAGE_KEY);
  return v;
}

# Storage Service Usage Example

```typescript
import * as storage from './storageService';

async function example() {
  await storage.init();
  await storage.seedSampleSplits();

  const entry = {
    id: 'entry1',
    templateId: 'ppl_push',
    date: '2024-06-01',
    sets: [
      { kg: 100, reps: 5, timestamp: Date.now(), exerciseId: 'bench_press' }
    ]
  };

  await storage.saveWorkoutEntry(entry);
  const history = await storage.getWorkoutHistory();
  await storage.deleteWorkoutEntry('entry1');
}
```

Decision: saveWorkoutEntryWithSets helper

Context:
- Exercise logging UI needs to save multiple sets including exerciseId and createdAt.
- Existing storageService.saveWorkoutEntry persists entries to SQLite table with columns (id, templateId, date, sets) and falls back to AsyncStorage.

Decision:
- Added a small helper function saveWorkoutEntryWithSets(entry) in storageService. It maps entry.createdAt -> date and delegates to existing saveWorkoutEntry.
- This avoids changing the DB schema and keeps backwards compatibility with existing callers.

Rationale:
- Minimal changes required; preserves existing persistence behavior for SQLite and AsyncStorage.
- Allows UI components to pass exerciseId and createdAt in the object while ensuring persistence.

Note:
- SQLite rows will still only contain id, templateId, date, and sets columns; exerciseId is stored inside the JS object passed to AsyncStorage fallback but not separately in SQLite columns.
- If later querying by exerciseId is required, we should extend the DB schema.

Author: Leela
Date: 2026-04-15

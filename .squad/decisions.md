# Team Decisions

## Content Seed Decision
1. Decision log: content seed

- Chosen shape: sample-splits.json contains top-level "exercises" and "templates". Each template has sessions with exercise ID arrays. This maps to src/models/workout.ts (Exercise objects and WorkoutTemplate references by ID).
- Included extra fields defaultSets/defaultReps in exercises for UI convenience; models don't require them but they are harmless.
- Seeding behavior: storageService.seedSampleSplits() will only write the sample data to AsyncStorage if no prior sample key exists to avoid overwriting user data.
- IDs are stable, descriptive strings (e.g., e_barbell_squat, tmpl_ppl).

## Frontend Templates Decision
1. Decision: Template payload and UI

We will embed template objects from sample-splits.json directly when navigating to the Workout screen via navigation params: navigation.navigate('Workout', { template }). The template includes name and intervals arrays. The Workout screen will render the passed template and not fetch remote data. This keeps the UI simple and works offline.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

---

# Fry seed templates decisions

Date: 2026-04-15

Summary:
- Added concrete exercise metadata (equipment, primary_muscle, exampleSets, description) for existing exercises to support richer Templates UI.
- Introduced new exercises to cover `bench`, `machine`, and `kettlebell` equipment: flat-bench-dumbbell-press, leg-press-machine, kettlebell-swing, seated-machine-shoulder-press.
- Updated templates (PPL, Upper/Lower, Bro Split, Full Body) to include the new exercises and added short template descriptions for UI.

Assumptions:
- Kept existing fields (camelCase) and added snake_case `primary_muscle` to satisfy the requested naming while remaining backward compatible.
- Example set structures are illustrative (sets/reps/weight/rest_seconds) and can be adjusted later to align with app modelling.
- New exercise IDs use kebab-case as requested and are unique.

Notes:
- No exercises were duplicated; edits were in-place to enrich existing entries.
- If a different field naming convention is required (snake_case vs camelCase), we should standardize across the dataset in a follow-up.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

---

# Leela dark theme decision

Palette:
- background: #071021 (deep navy)
- surface: #0D1620 (panel)
- text: #E6EEF3 (off-white)
- muted: #9AA6B2 (muted gray)
- primary (action): #FF7A59 (warm coral)
- accent (highlight): #FFD28B (warm amber)

Rationale: High contrast for readability on dark backgrounds while using a warm coral primary for actions to improve affordance and accessibility.


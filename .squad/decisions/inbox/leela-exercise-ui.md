Exercise Detail screen

Overview
- New screen at src/screens/ExerciseDetail.tsx showing exercise details and allowing recording of sets.

Data passed
- route.params.exercise: exercise object (expects fields id, name, image, primary_muscle, equipment, description, instructions)
- route.params.templateId (optional): id of the workout template to associate the saved entry with

UI
- Displays image, name, primary muscle, equipment, description
- Renders instructions as bullet list (accepts array or newline-separated string)
- Inputs: Weight (KG numeric), Reps (numeric)
- Buttons: Add Set (adds to local unsaved list), Remove (per-set), Save Workout (persists)
- Shows current unsaved sets list before saving

Save format
- Uses src/services/storage/storageService.saveWorkoutEntry
- WorkoutEntry shape saved:
  - id: `${templateId||'manual'}-${exercise.id}-${Date.now()}`
  - templateId: templateId or null
  - date: ISO string (new Date().toISOString())
  - sets: array of { weight: number, reps: number, timestamp: ISO string }

Assumptions
- storageService.saveWorkoutEntry accepts the shape above and persists (already implemented)
- exercise.instructions may be an array or string; both are supported
- exercise.image is a URL; Image uses it directly
- For web compatibility, only cross-platform RN components are used (TouchableOpacity, TextInput)
- The WorkoutScreen passes templateId when navigating to Exercise

UX notes
- Users can add multiple sets locally and remove any before committing
- After successful save, the screen navigates back

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
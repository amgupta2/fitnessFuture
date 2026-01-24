# Exercise Library Dataset

## Source
- **Dataset**: [Kaggle Gym Exercises Dataset](https://www.kaggle.com/datasets/ambarishdeb/gym-exercises-dataset)
- **Total Exercises**: 471
- **Format**: JSON

## Fields
- `Exercise_Name`: Name of the exercise
- `muscle_gp`: Primary muscle group targeted
- `Equipment`: Required equipment
- `Exercise_Image`: Image URL (1)
- `Exercise_Image1`: Image URL (2)
- `Description_URL`: Link to detailed description on bodybuilding.com
- `Rating`: Exercise rating (0-10)

## Usage

### Seeding the Database
To populate the `exerciseLibrary` table, run:

```bash
npx convex run exercises:seedExercises --no-push
```

This will import all 471 exercises into your Convex database.

### Searching Exercises
```typescript
// In your component
const results = useQuery(api.exercises.searchExercises, {
  query: "bench press",
  limit: 10
});
```

## Muscle Groups Included
- Chest
- Shoulders
- Back / Lats
- Biceps / Triceps
- Quadriceps / Hamstrings / Glutes
- Abdominals
- Forearms
- Calves
- And more...

## Equipment Types
- Barbell
- Dumbbell
- Machine
- Cable
- Body Only (Bodyweight)
- Kettlebells
- Bands
- Other

## Notes
- Images are hosted on bodybuilding.com
- Each exercise includes 2 image angles
- Descriptions link to full exercise guides
- Data is normalized for consistent querying


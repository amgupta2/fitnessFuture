"use client";

interface Plateau {
  exerciseName: string;
  sessionsCount: number;
  firstDate: number;
  lastDate: number;
  first1RM: number;
  last1RM: number;
  improvement: number;
}

interface PlateauDetectorProps {
  plateaus: Plateau[];
}

export function PlateauDetector({ plateaus }: PlateauDetectorProps) {
  if (plateaus.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-green-400 text-4xl mb-2">🎯</div>
        <p className="text-gray-300 font-medium">No plateaus detected!</p>
        <p className="text-sm text-gray-500 mt-1">
          You're making consistent progress across all exercises
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-400 mb-4">
        <p>
          Exercises with less than 2.5% improvement over recent sessions may
          need a change in programming.
        </p>
      </div>
      {plateaus.map((plateau) => (
        <div
          key={plateau.exerciseName}
          className="bg-gray-800 rounded-lg p-4 border border-yellow-500/30"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-white">{plateau.exerciseName}</h4>
            <span className="inline-block px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
              Plateau
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Sessions</p>
              <p className="text-white">{plateau.sessionsCount}</p>
            </div>
            <div>
              <p className="text-gray-500">Improvement</p>
              <p className="text-white">{plateau.improvement}%</p>
            </div>
            <div>
              <p className="text-gray-500">First 1RM</p>
              <p className="text-white">{plateau.first1RM} lbs</p>
            </div>
            <div>
              <p className="text-gray-500">Last 1RM</p>
              <p className="text-white">{plateau.last1RM} lbs</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              Period: {new Date(plateau.firstDate).toLocaleDateString()} -{" "}
              {new Date(plateau.lastDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}


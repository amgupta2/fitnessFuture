"use client";

interface PersonalRecord {
  _id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  achievedAt: number;
  recordType: string;
}

interface PRListProps {
  records: PersonalRecord[];
}

export function PRList({ records }: PRListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No personal records yet. Keep pushing!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <div
          key={record._id}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-white">{record.exerciseName}</h4>
              <p className="text-sm text-gray-400 mt-1">
                {record.weight} lbs × {record.reps} reps
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                {record.recordType === "max_weight" ? "Max Weight" : "Volume PR"}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(record.achievedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


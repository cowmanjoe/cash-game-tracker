'use client';

export default function RoomCodeDisplay({ roomCode }: { roomCode: string | null }) {
  if (!roomCode) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Room Code</p>
          <p className="text-3xl font-bold tracking-wider text-blue-600">{roomCode}</p>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Copy Code
        </button>
      </div>
    </div>
  );
}

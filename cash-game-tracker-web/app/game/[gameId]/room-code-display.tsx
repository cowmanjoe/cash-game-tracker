'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

function QRCodeModal({ roomCode, gameUrl }: { roomCode: string, gameUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Show QR Code
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-center">Scan to Join</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={gameUrl} size={256} />
            </div>
            <p className="text-center text-gray-600 mb-2">Room Code: <span className="font-bold text-2xl">{roomCode}</span></p>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function RoomCodeDisplay({ roomCode }: { roomCode: string | null }) {
  if (!roomCode) return null;

  const joinUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/join-game/${roomCode}`;

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
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Copy Code
          </button>
          <QRCodeModal roomCode={roomCode} gameUrl={joinUrl} />
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useParams } from 'react-router-dom';

export default function PlayerGame() {
  const { gameId } = useParams<{ gameId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Player Game</h1>
        <p className="text-gray-600">Game ID: {gameId}</p>
        <p className="text-gray-600 mt-4">
          This page will contain the player game interface. Coming soon...
        </p>
      </div>
    </div>
  );
}

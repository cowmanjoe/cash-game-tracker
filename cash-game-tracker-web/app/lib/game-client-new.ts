'use server'

import { revalidateTag } from "next/cache";
import { ValidationError } from "./validation-error";
import { Game } from "./game";
import { ServerResponse } from "./response";

const baseUrl = 'http://localhost:8080';

export async function addBuyIn(gameId: string, accountId: string, amount: string): Promise<ServerResponse<Game>> {
  const gameResponse = await sendRequest<Game>(`/game/${gameId}/buy-in`, {
    method: 'POST',
    body: JSON.stringify({
      accountId,
      amount
    }),
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!gameResponse.isError) {
    revalidateTag('game');
  }

  return gameResponse;
}

async function sendRequest<R>(path: string, init?: RequestInit): Promise<ServerResponse<R>> {
  const response = await fetch(`${baseUrl}${path}`, init);

  return await response.json();
}
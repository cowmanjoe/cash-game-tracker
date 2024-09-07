'use server'

import { revalidateTag } from "next/cache";
import { Balances, Game } from "./game";
import { ServerResponse } from "./response";

const baseUrl = 'http://localhost:8080';

export async function getGame(id: string): Promise<ServerResponse<Game>> {
  return sendRequest(`/game/${id}`, { next: { tags: ['game'] } })
}

export async function createGame(): Promise<ServerResponse<Game>> {
  return sendRequest(`/game`, { method: 'POST' })
}

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

  revalidateTag('game');

  return gameResponse;
}

export async function addPlayer(gameId: string, accountId: string): Promise<ServerResponse<Game>> {
  const gameResponse = await sendRequest<Game>(`/game/${gameId}/add-player/${accountId}`, { method: 'POST' })

  revalidateTag('game');

  return gameResponse;
}

export async function updateBuyIn(gameId: string, buyInId: string, amount: string): Promise<ServerResponse<Game>> {
  const gameResponse = await sendRequest<Game>(`/game/${gameId}/buy-in/${buyInId}`, { 
    method: 'PUT',
    body: JSON.stringify({ 
      amount
    }),
    headers: {
      'Content-Type': 'application/json'
    },
  });

  revalidateTag('game');

  return gameResponse;
}

export async function getBalances(gameId: string): Promise<ServerResponse<Balances>> {
  return await sendRequest<Balances>(`/game/${gameId}/balances`)
}

async function sendRequest<R>(path: string, init?: RequestInit): Promise<ServerResponse<R>> {
  const response = await fetch(`${baseUrl}${path}`, init);

  return await response.json();
}
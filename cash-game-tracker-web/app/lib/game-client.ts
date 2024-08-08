import { Game } from "./game";
import { revalidateTag } from 'next/cache';

export interface GameClient {
  getGame(id: string): Promise<Game>;
  createGame(): Promise<Game>;
  addBuyIn(gameId: string, accountId: string, amount: string): Promise<Game>;
}

class GameClientImpl implements GameClient {

  constructor(private readonly baseUrl: string) {}

  getGame(id: string): Promise<Game> {
    return this.sendRequest(`/game/${id}`, { next: { tags: ['game'] } })
  }

  async createGame(): Promise<Game> {
    const game = this.sendRequest(`/game`, { method: 'POST', next: { tags: ['game'] } })

    revalidateTag('game');

    return game;
  }

  async addBuyIn(gameId: string, accountId: string, amount: string): Promise<Game> {
    const game = await this.sendRequest(`/game/${gameId}/buy-in`, {
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

    return game;
  }

  private async sendRequest(path: string, init?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${path}`, init);

    if (response.status > 400) {
      throw Error(`Request for ${path} returned error: ${await response.text()}`);
    } else {
      return await response.json();
    }
  }
}

export const gameClient = new GameClientImpl('http://localhost:8080');
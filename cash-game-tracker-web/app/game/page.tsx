import { Game } from "../lib/game";
import { gameClient } from "../lib/game-client";
import { redirect } from 'next/navigation'

export default async function Home() {
  const game: Game = await gameClient.createGame();

  redirect(`/game/${game.id}`);
}
 
import { redirect, RedirectType } from "next/navigation";
import { accountClient } from "../lib/account-client";
import { gameClient } from "../lib/game-client";
import { Game } from "../lib/game";
import { createSession } from "../lib/session";

export default async function NewGame() {
  async function createGame(formData: FormData) {
    'use server';

    const name = formData.get('name');

    if (!name) {
      throw Error("Name was null");
    }
    
    let game: Game | null = null;
    try {
      game = await gameClient.createGame();
      const player = await accountClient.createAccount(name.toString());

      await createSession(player.id);

      game = await gameClient.addPlayer(game.id, player.id);
    } catch (e) {
      console.error(e);
      game = null;
    }

    if (game) {
      redirect(`/game/${game.id}`);
    }
  }

  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-center flex-col">
        <form action={createGame}>
          <div className="flex gap-2 flex-col">
          <input
              className="rounded-lg"
              id="name"
              name="name"
              placeholder="Name"
              required
            />
            
            <button type="submit" className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              Create Game
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
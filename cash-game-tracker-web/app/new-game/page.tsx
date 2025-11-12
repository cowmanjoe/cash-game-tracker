import { redirect, RedirectType } from "next/navigation";
import { Game } from "../lib/game";
import { createSession } from "../lib/session";
import { addPlayer, createGame } from "../lib/game-client";
import { createAccount } from "../lib/account-client";

export default async function NewGamePage() {
  async function submitCreateGameForm(formData: FormData) {
    'use server';

    const name = formData.get('name');

    if (!name) {
      throw Error("Name was null");
    }
    
    const createGameResponse = await createGame();

    if (createGameResponse.isError) {
      throw Error(`Failed to create game: ${createGameResponse.error.type}`);
    }

    const game = createGameResponse.data;

    const createAccountResponse = await createAccount(name.toString());

    if (createAccountResponse.isError) {
      throw Error(`Failed to create account: ${createAccountResponse.error.type}`);
    }

    const account = createAccountResponse.data;

    await createSession(account.id);

    const addPlayerResponse = await addPlayer(game.id, account.id);

    if (addPlayerResponse.isError) {
      throw Error(`Failed to add player to game: ${addPlayerResponse.error.type}`);
    }

    redirect(`/game/${game.id}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form action={submitCreateGameForm}>
          <div className="flex gap-4 flex-col">
            <input
              className="rounded-lg px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="name"
              name="name"
              placeholder="Your Name"
              required
            />

            <button type="submit" className="flex items-center justify-center gap-3 rounded-lg bg-blue-500 px-6 py-4 text-base font-medium text-white transition-colors hover:bg-blue-400 md:text-lg">
              Create Game
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
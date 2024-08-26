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
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-center flex-col">
        <form action={submitCreateGameForm}>
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
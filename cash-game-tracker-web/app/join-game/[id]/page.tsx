import { accountClient } from "@/app/lib/account-client";
import { Game } from "@/app/lib/game";
import { gameClient } from "@/app/lib/game-client";
import { createSession } from "@/app/lib/session";
import { redirect } from "next/navigation";

export default async function JoinGame(props: { params: { id: string } }) {
  const game = await gameClient.getGame(props.params.id);

  if (!game) {
    redirect("/");
  }

  async function joinGame(formData: FormData) {
    'use server';

    const name = formData.get('name');

    if (!name) {
      throw Error("Name was null");
    }

    let updatedGame: Game | null = null;
    try {
      const player = await accountClient.createAccount(name.toString());

      await createSession(player.id);

      updatedGame = await gameClient.addPlayer(game.id, player.id);
    } catch (e) {
      console.error(e);
    }

    if (updatedGame) {
      redirect(`/game/${game.id}`);
    }
  }

  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-center flex-col">
        <form action={joinGame}>
          <div className="flex gap-2 flex-col">
          <input
              className="rounded-lg"
              id="name"
              name="name"
              placeholder="Name"
              required
            />
            
            <button type="submit" className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              Join Game
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
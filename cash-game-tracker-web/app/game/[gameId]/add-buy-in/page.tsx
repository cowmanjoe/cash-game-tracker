import { Game } from "@/app/lib/game";
import { gameClient } from "@/app/lib/game-client";
import { getSession } from "@/app/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function AddBuyInPage(props: { params: { gameId: string } }) {
  let game: Game;
  try {
    game = await gameClient.getGame(props.params.gameId)
  } catch (e) {
    console.error(e);
    notFound();
  }

  const sessionPayload = await getSession();

  if (!sessionPayload || !game.players[sessionPayload.accountId]) {
    redirect(`/join-game/${props.params.gameId}`);
  }

  async function addBuyIn(formData: FormData) {
    'use server';

    const amount = formData.get('amount');
    const accountId = formData.get('accountId')

    if (amount === null || accountId === null) {
      throw Error("Amount or account ID was null");
    }
    console.log(`amount: ${amount}`)

    try {
      await gameClient.addBuyIn(game.id, accountId.toString(), amount.toString());
    } catch (e) {
      console.error(e)
    }
    
    redirect(`/game/${game.id}`)
  }

  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-start flex-col m-6 min-w-80 px-6">
        <div>
          <Link href={`/game/${game.id}`}>
            <div className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              Back
            </div>
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-grow">
          <form action={addBuyIn}>
            <div className="flex flex-col justify-items-center gap-6">
              <select
                className="rounded-lg"
                id="accountId"
                name="accountId"
                value={sessionPayload.accountId}
                required
              >
                {
                  Object.keys(game.players).map(accountId => (
                    <option key={accountId} value={accountId}>{game.players[accountId].name}</option>
                  ))
                }
              </select>
              <input
                className="rounded-lg"
                id="amount"
                name="amount"
                placeholder="Amount"
                required
              />

              <button type="submit" className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
                Add Buy In
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
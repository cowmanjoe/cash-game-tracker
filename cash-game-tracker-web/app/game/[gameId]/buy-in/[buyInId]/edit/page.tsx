'use server'
import { BuyIn, Game } from "@/app/lib/game";
import { getGame, updateBuyIn } from "@/app/lib/game-client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function BuyInEditPage(props: { params: { gameId: string, buyInId: string } }) {
  const gameResponse = await getGame(props.params.gameId)

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`)
    notFound();
  }

  const game = gameResponse.data;

  const buyIn = game.buyIns.find(b => b.id === props.params.buyInId);

  if (!buyIn) {
    console.error(`Buy in ${props.params.buyInId} not found`)
    notFound();
  }

  async function editBuyIn(formData: FormData) {
    'use server';

    const amount = formData.get('amount');

    if (!buyIn || !amount) {
      throw Error("Buy in or amount was missing");
    }

    console.log(`amount: ${amount}`)

    const updateResponse = await updateBuyIn(game.id, buyIn.id, amount.toString());

    if (updateResponse.isError) {
      console.error(`Error while updating buy in: ${updateResponse.error.type}`)
    } else {
      redirect(`/game/${game.id}/buy-in/${buyIn.id}`)
    }
  }

  return (
    <main className="flex justify-center h-screen">
      <div className="flex justify-start flex-col m-6 min-w-80 px-6">
        <Link href={`/game/${game.id}`}>
          <div className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            Back
          </div>
        </Link>
        <form className="flex justify-center flex-col flex-grow" action={editBuyIn}>
          <div className="flex flex-col justify-items-center gap-6">
            <input
              className="rounded-lg"
              id="amount"
              name="amount"
              placeholder="Amount"
              required
            />

            <button type="submit" className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              Edit buy in
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
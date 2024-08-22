import { BuyIn, Game } from "@/app/lib/game";
import { gameClient } from "@/app/lib/game-client";
import { notFound, redirect } from "next/navigation";

export default async function BuyInEditPage(props: { params: { gameId: string, buyInId: string } }) {
  let game: Game;
  let buyIn: BuyIn;
  try {
    game = await gameClient.getGame(props.params.gameId);
    const foundBuyIn = game.buyIns.find(b => b.id === props.params.buyInId);

    if (foundBuyIn) {
      buyIn = foundBuyIn;
    } else {
      throw Error(`Buy in ${props.params.buyInId} not found`);
    }
  } catch (e) {
    console.error(e);
    notFound();
  }

  async function editBuyIn(formData: FormData) {
    'use server';

    const amount = formData.get('amount');

    if (amount === null) {
      throw Error("Amount was null");
    }
    console.log(`amount: ${amount}`)

    try {
      await gameClient.updateBuyIn(game.id, buyIn.id, amount.toString());
    } catch (e) {
      console.error(e)
    }

    redirect(`/game/${game.id}/buy-in/${buyIn.id}`)
  }

  return (
    <main className="flex justify-center h-screen">
      <form className="flex justify-center flex-col" action={editBuyIn}>
        <div className="flex gap-1">
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
    </main>
  )
}
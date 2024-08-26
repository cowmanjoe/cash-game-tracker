import { BuyIn, Game } from "@/app/lib/game";
import { getGame, updateBuyIn } from "@/app/lib/game-client";
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
  
  async function editBuyIn(buyIn: BuyIn, formData: FormData) {
    'use server';

    const amount = formData.get('amount');

    if (amount === null) {
      throw Error("Amount was null");
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
      <form className="flex justify-center flex-col" action={formData => editBuyIn(buyIn, formData)}>
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
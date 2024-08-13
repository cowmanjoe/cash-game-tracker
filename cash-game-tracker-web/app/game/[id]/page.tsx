import { Game } from "@/app/lib/game";
import { gameClient } from "@/app/lib/game-client";
import Link from "next/link";

export default async function Home(props: { params: { id: string } }) {
  const game: Game = await gameClient.getGame(props.params.id)

  console.log(JSON.stringify(game))

  async function addBuyIn(formData: FormData) {
    'use server';
    console.log('addBuyIn')

    const amount = formData.get('amount');

    if (amount === null) {
      throw Error("Amount was null");
    }
    console.log(`amount: ${amount}`)

    try {
      await gameClient.addBuyIn(game.id, 'Account1', amount.toString());
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className="flex justify-center">
      <div className="flex justify-center flex-col">

        <form action={addBuyIn}>
          <div className="flex gap-1">
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
        <div className="p-5">

        </div>
        <div className="flex flex-col gap-1">
          {
            game.buyIns.map(buyIn =>
              <div key={buyIn.id}>
                <Link href={`/game/${game.id}/buy-in/${buyIn.id}`} className="flex justify-between h-10 align-center mx-5">
                  <span className="content-center">
                    {buyIn.accountId}
                  </span>
                  <span className="content-center">
                    {buyIn.amount}
                  </span>
                </Link>
                <hr />
              </div>
            )
          }
        </div>
      </div>
    </main>

  );
}
'use client'

import { BuyIn, Game } from "@/app/lib/game";
import Link from "next/link";
import { useActionState } from "react";
import { editBuyInAction } from "./actions";

export default function EditBuyInForm({ game, buyIn }: { game: Game, buyIn: BuyIn }) {
  const [actionState, formAction] = useActionState(editBuyInAction, {});

  return (
    <main className="flex justify-center h-screen">
      <div className="flex justify-start flex-col m-6 px-6 w-80">
        <Link href={`/game/${game.id}`}>
          <div className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            Back
          </div>
        </Link>
        <div className="flex flex-col justify-center flex-grow">
          <form action={formAction}>
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

              <input id="gameId" name="gameId" value={game.id} type="hidden" />
              <input id="buyInId" name="buyInId" value={buyIn.id} type="hidden" />
            </div>
          </form>
          {actionState.error && <p className="m-2 text-red-600">{actionState.error}</p>}
        </div>
      </div>
    </main>
  )
}
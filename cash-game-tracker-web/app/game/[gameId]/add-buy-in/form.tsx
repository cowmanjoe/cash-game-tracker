'use client'

import { Game } from "@/app/lib/game"
import Link from "next/link"
import { useActionState, useState } from "react";
import { addBuyInAction } from "./actions";

export default function AddBuyInForm({ game, activeAccountId }: { game: Game, activeAccountId: string }) {
  const [isLoading, setLoading] = useState(false);
  const [state, formAction] = useActionState(addBuyInAction, { game });

  async function submitForm(formData: FormData) {
    setLoading(true);
    await formAction(formData)
    setLoading(false);
  }

  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-start flex-col m-6 min-w-80 px-6 max-w-64">
        <Link href={`/game/${game.id}`}>
          <div className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            Back
          </div>
        </Link>

        <div className="flex flex-col justify-center flex-grow">
          <form action={submitForm}>
            <div className="flex flex-col justify-items-center gap-6">
              <select
                className="rounded-lg"
                id="accountId"
                name="accountId"
                defaultValue={activeAccountId}
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

              <button type="submit" disabled={isLoading} className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
                Add Buy In
              </button>
            </div>
          </form>
          {state.error && <p className="m-2 text-red-600">{state.error}</p>}
        </div>
      </div>
    </main>
  )
}
'use client'

import { Game } from "@/app/lib/game"
import Link from "next/link"
import { useActionState } from "react";
import { addBuyInAction } from "./actions";

export default function AddBuyInForm({ game, activeAccountId }: { game: Game, activeAccountId: string }) {
  const [state, formAction, isPending] = useActionState(addBuyInAction, { game });

  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-start flex-col m-6 min-w-80 px-6 max-w-64">
        <Link href={`/game/${game.id}`} className={isPending ? 'pointer-events-none opacity-50' : ''}>
          <div className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            Back
          </div>
        </Link>

        <div className="flex flex-col justify-center flex-grow">
          <form action={formAction}>
            <div className="flex flex-col justify-items-center gap-6">
              <select
                className="rounded-lg"
                id="accountId"
                name="accountId"
                defaultValue={activeAccountId}
                disabled={isPending}
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
                disabled={isPending}
                required
              />

              <button type="submit" disabled={isPending} className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add Buy In'
                )}
              </button>
            </div>
          </form>
          {state.error && <p className="m-2 text-red-600">{state.error}</p>}
        </div>
      </div>
    </main>
  )
}
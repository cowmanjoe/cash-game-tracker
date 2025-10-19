'use client'

import { Game } from "@/app/lib/game"
import Link from "next/link"
import { useActionState, useState } from "react";
import { addPaymentAction } from "./actions";

export default function AddPaymentForm({
  game,
  activeAccountId,
  currentBalance
}: {
  game: Game,
  activeAccountId: string,
  currentBalance: number
}) {
  const [isLoading, setLoading] = useState(false);
  const [state, formAction] = useActionState(addPaymentAction, { game });

  // Smart defaults based on current balance
  const defaultSide = currentBalance < 0 ? 'PAYER' : currentBalance > 0 ? 'RECIPIENT' : 'PAYER';
  const defaultAmount = currentBalance !== 0 ? Math.abs(currentBalance).toFixed(2) : '';

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

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Payment Side</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="side"
                      value="PAYER"
                      defaultChecked={defaultSide === 'PAYER'}
                      required
                    />
                    <span className="text-sm">I am paying the house</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="side"
                      value="RECIPIENT"
                      defaultChecked={defaultSide === 'RECIPIENT'}
                      required
                    />
                    <span className="text-sm">I am receiving from the house</span>
                  </label>
                </div>
              </div>

              <input
                className="rounded-lg"
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Amount"
                defaultValue={defaultAmount}
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Record Payment
              </button>
            </div>
          </form>
          {state.error && <p className="m-2 text-red-600">{state.error}</p>}
        </div>
      </div>
    </main>
  )
}

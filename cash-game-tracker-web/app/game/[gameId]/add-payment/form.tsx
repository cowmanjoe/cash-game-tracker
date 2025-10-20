'use client'

import { Game, PaymentSide, Balance } from "@/app/lib/game"
import Link from "next/link"
import { useActionState, useState } from "react";
import { addPaymentAction } from "./actions";

export default function AddPaymentForm({
  game,
  activeAccountId,
  balances
}: {
  game: Game,
  activeAccountId: string,
  balances: Balance[]
}) {
  const [state, formAction, isPending] = useActionState(addPaymentAction, { game });
  const [selectedAccountId, setSelectedAccountId] = useState(activeAccountId);

  // Find the selected player's balance
  const selectedBalance = balances.find(b => b.accountId === selectedAccountId);
  const outstanding = selectedBalance ? parseFloat(selectedBalance.outstanding) : 0;

  // Smart defaults based on outstanding balance
  const defaultSide = outstanding < 0 ? PaymentSide.PAYER : outstanding > 0 ? PaymentSide.RECIPIENT : PaymentSide.PAYER;
  const defaultAmount = outstanding !== 0 ? Math.abs(outstanding).toFixed(2) : '';

  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-start flex-col m-6 min-w-80 px-6 max-w-64">
        <Link href={`/game/${game.id}`} className={isPending ? 'pointer-events-none opacity-50' : ''}>
          <div className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            Back
          </div>
        </Link>

        <div className="flex flex-col justify-center flex-grow">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Record Payment</h2>
          <form action={formAction}>
            <div className="flex flex-col justify-items-center gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="accountId" className="text-sm font-medium text-gray-700">Player</label>
                <select
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  id="accountId"
                  name="accountId"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  disabled={isPending}
                  required
                >
                  {
                    Object.keys(game.players).map(accountId => (
                      <option key={accountId} value={accountId}>{game.players[accountId].name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-700">Payment Direction</label>
                <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                    <input
                      type="radio"
                      name="side"
                      value={PaymentSide.PAYER}
                      key={`payer-${selectedAccountId}`}
                      defaultChecked={defaultSide === PaymentSide.PAYER}
                      disabled={isPending}
                      className="mt-1"
                      required
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Player paid the house</span>
                      <span className="text-xs text-gray-600">Reduces debt (if negative balance)</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                    <input
                      type="radio"
                      name="side"
                      value={PaymentSide.RECIPIENT}
                      key={`recipient-${selectedAccountId}`}
                      defaultChecked={defaultSide === PaymentSide.RECIPIENT}
                      disabled={isPending}
                      className="mt-1"
                      required
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Player received from the house</span>
                      <span className="text-xs text-gray-600">Settles what the house owes (if positive balance)</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount ($)
                  {outstanding !== 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Outstanding: ${Math.abs(outstanding).toFixed(2)} {outstanding < 0 ? 'owed' : 'to receive'})
                    </span>
                  )}
                </label>
                <input
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100000"
                  placeholder="0.00"
                  key={`amount-${selectedAccountId}`}
                  defaultValue={defaultAmount}
                  disabled={isPending}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Recording...
                  </>
                ) : (
                  'Record Payment'
                )}
              </button>
            </div>
          </form>
          {state.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

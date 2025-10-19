'use client'

import { Payment, Game, PaymentSide } from "@/app/lib/game";
import Link from "next/link";
import { useActionState } from "react";
import { editPaymentAction } from "./actions";

export default function EditPaymentForm({ game, payment }: { game: Game, payment: Payment }) {
  const [actionState, formAction, isPending] = useActionState(editPaymentAction, {});

  return (
    <main className="flex justify-center min-h-screen bg-gray-50">
      <div className="flex justify-start flex-col m-6 px-6 w-80 max-w-md">
        <Link href={`/game/${game.id}/payment/${payment.id}`} className={isPending ? 'pointer-events-none opacity-50' : ''}>
          <div className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-400 mb-6">
            ← Back
          </div>
        </Link>
        <div className="flex flex-col justify-center flex-grow">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Edit Payment</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">Player</p>
              <p className="text-lg font-medium text-gray-900">{game.players[payment.accountId].name}</p>
            </div>

            <form action={formAction}>
              <div className="flex flex-col justify-items-center gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-gray-700">Payment Direction</label>
                  <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg">
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                      <input
                        type="radio"
                        name="side"
                        value={PaymentSide.PAYER}
                        defaultChecked={payment.side === PaymentSide.PAYER}
                        disabled={isPending}
                        className="mt-1"
                        required
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">Paid the house</span>
                        <span className="text-xs text-gray-600">Player paid money to the house</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                      <input
                        type="radio"
                        name="side"
                        value={PaymentSide.RECIPIENT}
                        defaultChecked={payment.side === PaymentSide.RECIPIENT}
                        disabled={isPending}
                        className="mt-1"
                        required
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">Received from the house</span>
                        <span className="text-xs text-gray-600">Player received money from the house</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    Amount ($)
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
                    defaultValue={payment.amount}
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
                      Updating...
                    </>
                  ) : (
                    'Update Payment'
                  )}
                </button>

                <input id="gameId" name="gameId" value={game.id} type="hidden" />
                <input id="paymentId" name="paymentId" value={payment.id} type="hidden" />
              </div>
            </form>
            {actionState.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{actionState.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

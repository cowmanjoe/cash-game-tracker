'use client'

import { Game } from "@/app/lib/game"
import { gameClient } from "@/app/lib/game-client";
import { addBuyIn } from "@/app/lib/game-client-new";
import { ValidationError } from "@/app/lib/validation-error";
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { addBuyInAction } from "./actions";

export default function AddBuyInForm({ game, activeAccountId }: { game: Game, activeAccountId: string }) {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter()
  const [state, formAction] = useActionState(addBuyInAction, { game });

  console.log(JSON.stringify(state));

  // async function addBuyIn2(formData: FormData) {
  //   if (!game) {
  //     return;
  //   }

  //   setLoading(true);

  //   const amount = formData.get('amount');
  //   const accountId = formData.get('accountId')

  //   if (amount === null || accountId === null) {
  //     throw Error("Amount or account ID was null");
  //   }
  //   console.log(`amount: ${amount}`) 

  //   try {
  //     await gameClient.addBuyIn(game.id, accountId.toString(), amount.toString());
  //     router.push(`/game/${game.id}`)
  //   } catch (e) {
  //     if (e instanceof ValidationError) {
  //       setError(e.message);
  //       setLoading(false);
  //     } else {
  //       setError('Unknown error occurred');
  //       console.error(e)
  //     }
  //   }
  // }

  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-start flex-col m-6 min-w-80 px-6">
        <div>
          <Link href={`/game/${game.id}`}>
            <div className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              Back
            </div>
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-grow">
          <form action={formAction}>
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
          {state.error && <p>{state.error}</p>}
        </div>
      </div>
    </main>
  )
}
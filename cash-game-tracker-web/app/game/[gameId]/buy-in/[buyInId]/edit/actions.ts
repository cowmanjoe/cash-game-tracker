import { Game } from "@/app/lib/game";
import { addBuyIn, updateBuyIn } from "@/app/lib/game-client";
import { redirect } from "next/navigation";

export interface ActionState {
  error?: string;
}

export async function editBuyInAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const amount = formData.get('amount');
  const buyInId = formData.get('buyInId');
  const gameId = formData.get('gameId');

  if (!amount || !buyInId || !gameId) {
    throw Error("Amount, buy in ID or game ID was null");
  }
  console.log(`amount: ${amount}`)

  const updateResponse = await updateBuyIn(gameId.toString(), buyInId.toString(), amount.toString());

  if (updateResponse.isError) {
    return { error: updateResponse.error.message || 'Unknown error occurred' }
  } else {
    redirect(`/game/${gameId.toString()}/buy-in/${buyInId.toString()}`)
  }
}
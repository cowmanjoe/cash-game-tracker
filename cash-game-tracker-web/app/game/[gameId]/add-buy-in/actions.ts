import { Game } from "@/app/lib/game";
import { addBuyIn } from "@/app/lib/game-client";
import { redirect } from "next/navigation";

export interface ActionState {
  error?: string;
  game: Game;
}

export async function addBuyInAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const amount = formData.get('amount');
  const accountId = formData.get('accountId')

  if (amount === null || accountId === null) {
    throw Error("Amount or account ID was null");
  }
  console.log(`amount: ${amount}`)

  const response = await addBuyIn(state.game.id, accountId.toString(), amount.toString());

  if (response.isError) {
    return { error: response.error.message || 'Unknown error occurred', game: state.game };
  } else {
    redirect(`/game/${response.data.id}`);
  }
}
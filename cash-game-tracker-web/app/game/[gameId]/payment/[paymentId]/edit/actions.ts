import { updatePayment } from "@/app/lib/game-client";
import { redirect } from "next/navigation";

export interface ActionState {
  error?: string;
}

export async function editPaymentAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const amount = formData.get('amount');
  const paymentId = formData.get('paymentId');
  const gameId = formData.get('gameId');

  if (!amount || !paymentId || !gameId) {
    throw Error("Amount, payment ID or game ID was null");
  }
  console.log(`amount: ${amount}`)

  const updateResponse = await updatePayment(gameId.toString(), paymentId.toString(), amount.toString());

  if (updateResponse.isError) {
    return { error: updateResponse.error.message || 'Unknown error occurred' }
  } else {
    redirect(`/game/${gameId.toString()}/payment/${paymentId.toString()}`)
  }
}

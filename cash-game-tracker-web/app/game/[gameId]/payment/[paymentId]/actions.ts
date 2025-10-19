'use server'

import { deletePayment } from "@/app/lib/game-client";
import { redirect } from "next/navigation";

export interface ActionState {
  error?: string;
}

export async function deletePaymentAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const paymentId = formData.get('paymentId');
  const gameId = formData.get('gameId');

  if (!paymentId || !gameId) {
    throw Error("Payment ID or game ID was null");
  }

  const deleteResponse = await deletePayment(gameId.toString(), paymentId.toString());

  if (deleteResponse.isError) {
    const errorMessage = deleteResponse.error.message || 'Failed to cancel payment. Please try again.';
    return { error: errorMessage }
  } else {
    redirect(`/game/${gameId}`)
  }
}

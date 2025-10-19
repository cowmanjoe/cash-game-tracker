'use server'

import { deletePayment } from "@/app/lib/game-client";
import { redirect } from "next/navigation";

export interface ActionState {
  error?: string;
}

export async function deletePaymentAction({ gameId, paymentId }: {
  gameId: string,
  paymentId: string
}): Promise<ActionState> {
  if (!paymentId || !gameId) {
    throw Error("Payment ID or game ID was null");
  }

  const deleteResponse = await deletePayment(gameId, paymentId);

  if (deleteResponse.isError) {
    return { error: deleteResponse.error.message || 'Unknown error occurred' }
  } else {
    redirect(`/game/${gameId}`)
  }
}

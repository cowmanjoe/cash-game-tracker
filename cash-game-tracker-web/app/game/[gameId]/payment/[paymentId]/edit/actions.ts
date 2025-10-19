import { updatePayment } from "@/app/lib/game-client";
import { redirect } from "next/navigation";

export interface ActionState {
  error?: string;
}

export async function editPaymentAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const amount = formData.get('amount');
  const side = formData.get('side');
  const paymentId = formData.get('paymentId');
  const gameId = formData.get('gameId');

  if (!amount || !side || !paymentId || !gameId) {
    throw Error("Amount, side, payment ID or game ID was null");
  }

  const amountValue = parseFloat(amount.toString());
  if (isNaN(amountValue)) {
    return { error: 'Please enter a valid amount' };
  }

  if (amountValue <= 0) {
    return { error: 'Payment amount must be greater than $0.00' };
  }

  if (amountValue > 100000) {
    return { error: 'Payment amount cannot exceed $100,000.00' };
  }

  const sideValue = side.toString();
  if (sideValue !== 'PAYER' && sideValue !== 'RECIPIENT') {
    return { error: 'Invalid payment side' };
  }

  console.log(`amount: ${amount}, side: ${side}`)

  const updateResponse = await updatePayment(gameId.toString(), paymentId.toString(), amount.toString(), sideValue);

  if (updateResponse.isError) {
    const errorMessage = updateResponse.error.message || 'Failed to update payment. Please try again.';
    return { error: errorMessage }
  } else {
    redirect(`/game/${gameId.toString()}/payment/${paymentId.toString()}`)
  }
}

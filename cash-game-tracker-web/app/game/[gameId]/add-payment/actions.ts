import { Game } from "@/app/lib/game";
import { addPayment } from "@/app/lib/game-client";
import { redirect } from "next/navigation";

export interface ActionState {
  error?: string;
  game: Game;
}

export async function addPaymentAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const amount = formData.get('amount');
  const accountId = formData.get('accountId');
  const side = formData.get('side');

  if (amount === null || accountId === null || side === null) {
    throw Error("Amount, account ID, or side was null");
  }

  if (side !== 'PAYER' && side !== 'RECIPIENT') {
    return { error: 'Please select whether you are paying or receiving from the house', game: state.game };
  }

  const amountValue = parseFloat(amount.toString());
  if (isNaN(amountValue)) {
    return { error: 'Please enter a valid amount', game: state.game };
  }

  if (amountValue <= 0) {
    return { error: 'Payment amount must be greater than $0.00', game: state.game };
  }

  if (amountValue > 100000) {
    return { error: 'Payment amount cannot exceed $100,000.00', game: state.game };
  }

  console.log(`amount: ${amount}, side: ${side}`);

  const response = await addPayment(
    state.game.id,
    accountId.toString(),
    amount.toString(),
    side as 'PAYER' | 'RECIPIENT'
  );

  if (response.isError) {
    const errorMessage = response.error.message || 'Failed to record payment. Please try again.';
    return { error: errorMessage, game: state.game };
  } else {
    redirect(`/game/${response.data.id}`);
  }
}

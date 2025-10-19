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
    return { error: 'Invalid payment side', game: state.game };
  }

  const amountValue = parseFloat(amount.toString());
  if (isNaN(amountValue) || amountValue <= 0) {
    return { error: 'Amount must be greater than 0', game: state.game };
  }

  console.log(`amount: ${amount}, side: ${side}`);

  const response = await addPayment(
    state.game.id,
    accountId.toString(),
    amount.toString(),
    side as 'PAYER' | 'RECIPIENT'
  );

  if (response.isError) {
    return { error: response.error.message || 'Unknown error occurred', game: state.game };
  } else {
    redirect(`/game/${response.data.id}`);
  }
}

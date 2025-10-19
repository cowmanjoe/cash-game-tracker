import { getBalances, getGame } from "@/app/lib/game-client";
import { getSession } from "@/app/lib/session";
import { notFound, redirect } from "next/navigation";
import AddPaymentForm from "./form";

export default async function AddPaymentPage(props: { params: { gameId: string } }) {
  const gameResponse = await getGame(props.params.gameId);
  const balancesResponse = await getBalances(props.params.gameId);

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`);
    notFound();
  }

  if (balancesResponse.isError) {
    console.error(`Received error: ${balancesResponse.error.type}`);
    notFound();
  }

  const game = gameResponse.data;
  const balances = balancesResponse.data;

  const sessionPayload = await getSession();

  if (!sessionPayload || !game.players[sessionPayload.accountId]) {
    redirect(`/join-game/${props.params.gameId}`);
  }

  // Find current user's balance
  const userBalance = balances.balances.find(b => b.accountId === sessionPayload.accountId);
  const balanceValue = userBalance ? parseFloat(userBalance.chipBalance) : 0;

  return (
    <AddPaymentForm
      game={game}
      activeAccountId={sessionPayload.accountId}
      currentBalance={balanceValue}
    />
  )
}

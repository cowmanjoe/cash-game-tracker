import { getGame } from "@/app/lib/game-client";
import { notFound, redirect } from "next/navigation";
import CashOutForm from "../form";
import { getSession } from "@/app/lib/session";

export default async function EditCashOutPage({ params }: { params: { gameId: string, accountId: string } }) {
  const gameResponse = await getGame(params.gameId)

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`)
    notFound();
  }

  const game = gameResponse.data;

  const sessionPayload = await getSession();

  if (!sessionPayload || !game.players[sessionPayload.accountId]) {
    redirect(`/join-game/${params.gameId}`);
  }

  const existingCashOut = game.cashOuts[params.accountId];
  const existingAmount = existingCashOut ? existingCashOut.amount : undefined;

  return (
    <CashOutForm game={game} activeAccountId={params.accountId} existingAmount={existingAmount}/>
  )
}

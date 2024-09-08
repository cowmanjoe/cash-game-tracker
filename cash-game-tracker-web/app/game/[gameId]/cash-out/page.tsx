import { getGame, updateBuyIn } from "@/app/lib/game-client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CashOutForm from "./form";
import { getSession } from "@/app/lib/session";

export default async function CashOutPage({ params }: { params: { gameId: string } }) {
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

  return (
    <CashOutForm game={game} activeAccountId={sessionPayload.accountId}/>
  )
}
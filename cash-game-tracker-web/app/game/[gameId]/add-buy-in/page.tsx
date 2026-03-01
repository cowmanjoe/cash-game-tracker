import { Game } from "@/app/lib/game";
import { getSession } from "@/app/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AddBuyInForm from "./form";
import { getGame } from "@/app/lib/game-client";

export default async function AddBuyInPage(props: { params: Promise<{ gameId: string }> }) {
  const params = await props.params;
  const gameResponse = await getGame(params.gameId);

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`);
    notFound();
  }

  const game = gameResponse.data;

  const sessionPayload = await getSession();

  if (!sessionPayload || !game.players[sessionPayload.accountId]) {
    redirect(`/join-game/${params.gameId}`);
  }

  return (
    <AddBuyInForm game={game} activeAccountId={sessionPayload.accountId}/>
  )
}
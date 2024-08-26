import { Game } from "@/app/lib/game";
import { getSession } from "@/app/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AddBuyInForm from "./form";
import { getGame } from "@/app/lib/game-client";

export default async function AddBuyInPage(props: { params: { gameId: string } }) {
  const gameResponse = await getGame(props.params.gameId);

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`);
    notFound();
  }

  const game = gameResponse.data;

  const sessionPayload = await getSession();

  if (!sessionPayload || !game.players[sessionPayload.accountId]) {
    redirect(`/join-game/${props.params.gameId}`);
  }

  return (
    <AddBuyInForm game={game} activeAccountId={sessionPayload.accountId}/>
  )
}
import { Game } from "@/app/lib/game";
import { gameClient } from "@/app/lib/game-client";
import { getSession } from "@/app/lib/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AddBuyInForm from "./form";

export default async function AddBuyInPage(props: { params: { gameId: string } }) {
  let game: Game;
  try {
    game = await gameClient.getGame(props.params.gameId)
  } catch (e) {
    console.error(e);
    notFound();
  }

  const sessionPayload = await getSession();

  if (!sessionPayload || !game.players[sessionPayload.accountId]) {
    redirect(`/join-game/${props.params.gameId}`);
  }

  return (
    <AddBuyInForm game={game} activeAccountId={sessionPayload.accountId}/>
  )
}
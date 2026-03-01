import { getGame, updateBuyIn } from "@/app/lib/game-client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import EditBuyInForm from "./form";

export default async function EditBuyInPage(props: { params: Promise<{ gameId: string, buyInId: string }> }) {
  const params = await props.params;
  const gameResponse = await getGame(params.gameId)

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`)
    notFound();
  }

  const game = gameResponse.data;

  const buyIn = game.buyIns.find(b => b.id === params.buyInId);

  if (!buyIn) {
    console.error(`Buy in ${params.buyInId} not found`)
    notFound();
  }

  return (
    <EditBuyInForm game={game} buyIn={buyIn}/>
  )
}
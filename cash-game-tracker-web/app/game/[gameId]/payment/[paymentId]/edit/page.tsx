import { getGame } from "@/app/lib/game-client";
import { notFound } from "next/navigation";
import EditPaymentForm from "./form";

export default async function EditPaymentPage(props: { params: { gameId: string, paymentId: string } }) {
  const gameResponse = await getGame(props.params.gameId)

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`)
    notFound();
  }

  const game = gameResponse.data;

  const payment = game.payments.find(p => p.id === props.params.paymentId);

  if (!payment) {
    console.error(`Payment ${props.params.paymentId} not found`)
    notFound();
  }

  return (
    <EditPaymentForm game={game} payment={payment}/>
  )
}

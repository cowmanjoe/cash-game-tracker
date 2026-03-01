import { getGame } from "@/app/lib/game-client";
import { notFound } from "next/navigation";
import EditPaymentForm from "./form";

export default async function EditPaymentPage(props: { params: Promise<{ gameId: string, paymentId: string }> }) {
  const params = await props.params;
  const gameResponse = await getGame(params.gameId)

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`)
    notFound();
  }

  const game = gameResponse.data;

  const payment = game.payments.find(p => p.id === params.paymentId);

  if (!payment) {
    console.error(`Payment ${params.paymentId} not found`)
    notFound();
  }

  return (
    <EditPaymentForm game={game} payment={payment}/>
  )
}

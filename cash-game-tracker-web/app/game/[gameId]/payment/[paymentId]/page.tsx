import { Payment, Game } from "@/app/lib/game";
import { getGame } from "@/app/lib/game-client";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeletePaymentButton from "./delete-button";

const DAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thur',
  'Fri',
  'Sat'
]

export default async function PaymentPage(props: { params: { gameId: string, paymentId: string } }) {
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

  const time = new Date(payment.time);

  return (
    <main className="flex justify-center">
      <div className="flex flex-col md:w-96 w-full p-12">
        <div className="flex justify-between p-2">
          <Link href={`/game/${game.id}`}>
            <div className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              Back
            </div>
          </Link>

          <div className="flex gap-2">
            <Link href={`/game/${game.id}/payment/${payment.id}/edit`}>
              <div className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
                Edit
              </div>
            </Link>

            <DeletePaymentButton
              gameId={game.id}
              paymentId={payment.id}
              amount={payment.amount}
              side={payment.side}
            />
          </div>
        </div>
        <div className="py-8">
          <p className="text-2xl p-5">{game.players[payment.accountId].name}</p>
          <p className="text-xl p-3 text-gray-600">PAYMENT ({payment.side})</p>
          <p className={`text-5xl p-3 font-semibold ${payment.side === 'PAYER' ? 'text-red-600' : 'text-green-600'}`}>${payment.amount}</p>
          <p className="flex justify-end">{DAYS[time.getDay()]} {time.toISOString().slice(11, 16)}</p>
        </div>
      </div>
    </main>

  );
}

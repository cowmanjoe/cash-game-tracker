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
    <main className="flex justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col md:w-96 w-full p-6 md:p-12">
        <div className="flex justify-between mb-6">
          <Link href={`/game/${game.id}`}>
            <div className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-400">
              ← Back
            </div>
          </Link>

          <div className="flex gap-2">
            <Link href={`/game/${game.id}/payment/${payment.id}/edit`}>
              <div className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-400">
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

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{game.players[payment.accountId].name}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <span className={`text-2xl ${payment.side === 'PAYER' ? 'text-red-600' : 'text-green-600'}`}>
                {payment.side === 'PAYER' ? '↑' : '↓'}
              </span>
              <p className="text-lg">
                PAYMENT ({payment.side === 'PAYER' ? 'Paying House' : 'Receiving from House'})
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Amount</p>
              <p className={`text-5xl font-bold ${payment.side === 'PAYER' ? 'text-red-600' : 'text-green-600'}`}>
                ${payment.amount}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Date & Time</p>
              <p className="text-lg text-gray-900">
                {DAYS[time.getDay()]}, {time.toLocaleDateString()} at {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Payment ID</p>
              <p className="text-sm text-gray-500 font-mono">{payment.id}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

  );
}

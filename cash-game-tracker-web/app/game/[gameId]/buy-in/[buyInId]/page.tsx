import { BuyIn, Game } from "@/app/lib/game";
import { getGame } from "@/app/lib/game-client";
import Link from "next/link";
import { notFound } from "next/navigation";

const DAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thur',
  'Fri',
  'Sat'
]

export default async function BuyInPage(props: { params: { gameId: string, buyInId: string } }) {
  const gameResponse = await getGame(props.params.gameId)

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`)
    notFound();
  }

  const game = gameResponse.data;

  const buyIn = game.buyIns.find(b => b.id === props.params.buyInId);

  if (!buyIn) {
    console.error(`Buy in ${props.params.buyInId} not found`)
    notFound();
  }

  const time = new Date(buyIn.time);

  return (
    <main className="flex justify-center">
      <div className="flex flex-col md:w-96 w-full p-12">
        <div className="flex justify-between p-2">
          <Link href={`/game/${game.id}`}>
            <div className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              Back
            </div>
          </Link>

          <Link href={`/game/${game.id}/buy-in/${buyIn.id}/edit`}>
            <div className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              Edit
            </div>
          </Link>
        </div>
        <div className="py-8">
          <p className="text-2xl p-5">{game.players[buyIn.accountId].name}</p>
          <p className="text-5xl p-3">${buyIn.amount}</p>
          <p className="flex justify-end">{DAYS[time.getDay()]} {time.toISOString().slice(11, 16)}</p>
        </div>
      </div>
    </main>

  );
}
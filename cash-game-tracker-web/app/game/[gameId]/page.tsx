import { getGame, getTransfers } from "@/app/lib/game-client";
import { getSession } from "@/app/lib/session";
import Link from "next/link";
import TransferTable from "../transfer-table";
import { notFound, redirect } from "next/navigation";

export default async function GamePage({ params }: { params: { gameId: string } }) {
  const gameResponse = await getGame(params.gameId)
  const transfersResponse = await getTransfers(params.gameId);

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`)
    notFound();
  }

  if (transfersResponse.isError) {
    console.error(`Received error: ${transfersResponse.error.type}`)
    notFound();
  }

  const game = gameResponse.data
  const transactions = transfersResponse.data.transfers;

  const sessionPayload = await getSession();

  if (!sessionPayload || !game.players[sessionPayload.accountId]) {
    console.log(`sessionPayload=${sessionPayload}`);
    console.log(`accountId=${sessionPayload?.accountId}`)

    redirect(`/join-game/${params.gameId}`);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <TransferTable game={game} transfers={transactions}/>
      </div>
      <div className="mt-4 flex space-x-4">
        <Link href={`/game/${game.id}/add-buy-in`} className="inline-flex items-center justify-center px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
          + Add Buy In
        </Link>
        <Link href={`/game/${game.id}/cash-out`} className="inline-flex items-center justify-center px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
          $ Cash Out
        </Link>
        <Link href={`/game/${game.id}/add-payment`} className="inline-flex items-center justify-center px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
          Record Payment
        </Link>
      </div>

    </div>
  );
};

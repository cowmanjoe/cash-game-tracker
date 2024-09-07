import { Game } from "@/app/lib/game";
import { getGame } from "@/app/lib/game-client";
import { decrypt, getSession } from "@/app/lib/session";
import { Liu_Jian_Mao_Cao } from "next/font/google";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TiPlus } from "react-icons/ti"

export default async function GamePage(props: { params: { gameId: string } }) {
  const gameResponse = await getGame(props.params.gameId)

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`)
    notFound();
  }

  const game = gameResponse.data;

  console.log(JSON.stringify(game))

  const sessionPayload = await getSession();

  if (!sessionPayload || !game.players[sessionPayload.accountId]) {
    console.log(`sessionPayload=${sessionPayload}`);
    console.log(`accountId=${sessionPayload?.accountId}`)

    redirect(`/join-game/${props.params.gameId}`);
  }

  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-start flex-col m-6 min-w-80">
        <div className="flex flex-col gap-1">
          {
            game.buyIns.map(buyIn =>
              <div key={buyIn.id}>
                <Link href={`/game/${game.id}/buy-in/${buyIn.id}`} className="flex justify-between h-10 align-center mx-5">
                  <span className="content-center">
                    {game.players[buyIn.accountId].name}
                  </span>
                  <span className="content-center">
                    {buyIn.amount}
                  </span>
                </Link>
                <hr />
              </div>
            )
          }
        </div>

        <div className="flex justify-center sticky bottom-16 right-4">
          <Link href={`/game/${game.id}/add-buy-in`}>
            <div className="flex w-12 h-12 justify-center gap-5 rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              <div className="flex flex-col justify-center">
                <TiPlus />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>

  );
}
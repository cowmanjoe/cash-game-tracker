import { Game } from "@/app/lib/game";
import { gameClient } from "@/app/lib/game-client";
import { decrypt, getSession } from "@/app/lib/session";
import { Liu_Jian_Mao_Cao } from "next/font/google";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TiPlus } from "react-icons/ti"

export default async function GamePage(props: { params: { gameId: string } }) {
  let game: Game;
  try {
    game = await gameClient.getGame(props.params.gameId)
  } catch (e) {
    console.error(e);
    notFound();
  }

  console.log(JSON.stringify(game))

  const sessionPayload = await getSession();

  if (!sessionPayload || !game.players[sessionPayload.accountId]) {
    redirect(`/join-game/${props.params.gameId}`);
  }

  async function addBuyIn(formData: FormData) {
    'use server';

    if (!sessionPayload) {
      redirect('/');
    }

    console.log(`addBuyIn from ${sessionPayload?.accountId}`)

    const amount = formData.get('amount');

    if (amount === null) {
      throw Error("Amount was null");
    }
    console.log(`amount: ${amount}`)

    try {
      await gameClient.addBuyIn(game.id, sessionPayload.accountId, amount.toString());
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className="flex justify-center">
      <div className="flex justify-start flex-col min-h-screen m-6 min-w-80">
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
        <div className="flex justify-end flex-grow flex-col m-10">
          <div className="flex justify-end">
            <Link href={`/game/${game.id}/add-buy-in`}>
              <div className="flex w-12 h-12 justify-center gap-5 rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
                <div className="flex flex-col justify-center">
                  <TiPlus />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>

  );
}
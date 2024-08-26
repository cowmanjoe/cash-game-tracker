import { createAccount, getAccount } from "@/app/lib/account-client";
import { Game } from "@/app/lib/game";
import { addPlayer, getGame } from "@/app/lib/game-client";
import { createSession } from "@/app/lib/session";
import { notFound, redirect } from "next/navigation";

export default async function JoinGamePage(props: { params: { id: string } }) {
  const gameResponse = await getGame(props.params.id)

  if (gameResponse.isError) {
    console.error(`Received error: ${gameResponse.error.type}`)
    notFound();
  }

  const game = gameResponse.data;

  async function joinGameAsNewPlayer(formData: FormData) {
    'use server';

    const name = formData.get('name');

    if (!name) {
      throw Error("Name was null");
    }

    const createAccountResponse = await createAccount(name.toString());

    if (createAccountResponse.isError) {
      throw Error(`Failed to create account: ${createAccountResponse.error.type}`)
    }

    const player = createAccountResponse.data;

    await createSession(player.id);

    const addPlayerResponse = await addPlayer(game.id, player.id);

    if (addPlayerResponse.isError) {
      console.error(`Got an error while adding player: ${addPlayerResponse.error.type}`)
    } else {
      redirect(`/game/${game.id}`);

    }
  }

  async function joinGame(formData: FormData) {
    'use server';

    const accountId = formData.get('accountId');

    if (!accountId) {
      throw Error("Name was null");
    }

    const accountResponse = await getAccount(accountId.toString());

    if (accountResponse.isError) {
      throw Error(`Failed to create account: ${accountResponse.error.type}`)
    }

    const player = accountResponse.data;

    await createSession(player.id);

    redirect(`/game/${game.id}`);
  }

  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-center flex-col gap-2">
        <form action={joinGameAsNewPlayer}>
          <div className="flex gap-2 flex-col">
            <input
              className="rounded-lg"
              id="name"
              name="name"
              placeholder="Name"
              required
            />

            <button type="submit" className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              Join Game As New User
            </button>
          </div>
        </form>
        {
          Object.values(game.players).map(account =>
            <form action={joinGame}>
              <input type="hidden" name="accountId" value={account.id}/>
              <button type="submit" key={account.id} className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
                Join Game As {account.name}
              </button>
            </form>
          )
        }
      </div>
    </main>
  )
}
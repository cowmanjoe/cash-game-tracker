import { redirect } from "next/navigation";

export default async function JoinGamePage() {
  async function submitJoinGameForm(formData: FormData) {
    'use server';

    const gameId = formData.get('gameId');

    if (!gameId) {
      throw Error("Game ID was null");
    }

    redirect(`/join-game/${gameId}`);
  }

  return (
    <main className="flex justify-center min-h-screen">
      <div className="flex justify-center flex-col">
        <form action={submitJoinGameForm}>
          <div className="flex gap-2 flex-col">
            <input
              className="rounded-lg"
              id="gameId"
              name="gameId"
              placeholder="Game ID"
              required
            />

            <button type="submit" className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              Join Game
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

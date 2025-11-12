import { redirect } from "next/navigation";

export default async function JoinGamePage() {
  async function submitJoinGameForm(formData: FormData) {
    'use server';

    const gameIdOrCode = formData.get('gameId');

    if (!gameIdOrCode) {
      throw Error("Game ID or room code was null");
    }

    // Normalize: if it looks like a room code (4 letters), uppercase it
    const normalized = gameIdOrCode.toString().length === 4 && /^[a-zA-Z]+$/.test(gameIdOrCode.toString())
      ? gameIdOrCode.toString().toUpperCase()
      : gameIdOrCode.toString();

    redirect(`/join-game/${normalized}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form action={submitJoinGameForm}>
          <div className="flex gap-4 flex-col">
            <input
              className="rounded-lg px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="gameId"
              name="gameId"
              placeholder="Room Code or Game ID"
              required
            />

            <button type="submit" className="flex items-center justify-center gap-3 rounded-lg bg-blue-500 px-6 py-4 text-base font-medium text-white transition-colors hover:bg-blue-400 md:text-lg">
              Join Game
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

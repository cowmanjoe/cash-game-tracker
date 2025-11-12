import Link from "next/link";

function Button(props: { href: string, label: string, icon: string, description: string }) {
  return (
    <Link href={props.href} className="flex flex-col items-start gap-2 rounded-lg bg-blue-500 px-6 py-4 text-white transition-colors hover:bg-blue-400">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{props.icon}</span>
        <span className="text-base font-medium md:text-lg">{props.label}</span>
      </div>
      <p className="text-sm text-blue-100 md:text-base">{props.description}</p>
    </Link>
  )
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
          Cash Game Tracker
        </h1>
        <p className="mt-4 text-lg text-gray-600 md:text-xl">
          Track buy-ins, cash-outs, and player balances
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button
          href="/new-game"
          label="Host Game"
          icon="➕"
          description="Start a new cash game session"
        />
        <Button
          href="/join-game"
          label="Join Game"
          icon="🔗"
          description="Join an existing game with a game ID"
        />
      </div>
    </main>
  );
}
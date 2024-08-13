import Link from "next/link";

function Button(props: { href: string, label: string }) {
  return (
    <Link href={props.href} className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
      <span>{props.label}</span>
    </Link>
  )
}

export default function Home() {
  return (
    <main className="flex min-h-screen justify-center">
      <div className="flex flex-col gap-2 justify-center">
        <Button href="/new-game" label="Host Game" />
        <Button href="/join-game" label="Join Game" />
      </div>
    </main>
  );
}
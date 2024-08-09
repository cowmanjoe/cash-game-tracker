import Link from "next/link";

function Button(props: { href: string, label: string }) {
  return (
    <Link href={props.href} className="flex items-center gap-5 rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base self-center">
      <span>{props.label}</span>
    </Link>
  )
}

function DummyButton(props: { href: string, label: string }) {
  return (
    <div className="self-center">
      {props.label}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen">
      <div className="flex flex-col gap-2 self-center flex-grow">
        <Button href="/game" label="Host Game" />
        <Button href="/join-game" label="Join Game" />
      </div>
    </main>
  );
}
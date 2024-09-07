import Link from "next/link";


export default function GameLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { gameId: string }
}>) {
  return (
    <main className="bg-gray-100 min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="space-x-4">
            <Link href={`/game/${params.gameId}`}>
              <button className="hover:bg-blue-700 px-3 py-2 rounded transition-colors duration-200">Transactions</button>
            </Link>
            <Link href={`/game/${params.gameId}/balances`}>
            <button className="hover:bg-blue-700 px-3 py-2 rounded transition-colors duration-200">Balances</button>
            </Link>
          </div>
        </div>
      </nav>

      {children}

    </main>
  );
}

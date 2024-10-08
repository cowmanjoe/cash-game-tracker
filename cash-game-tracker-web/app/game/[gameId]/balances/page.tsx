import { getBalances } from "@/app/lib/game-client";
import { notFound } from "next/navigation";

export default async function BalancesPage(props: { params: { gameId: string } }) {
  const balancesResponse = await getBalances(props.params.gameId)

  if (balancesResponse.isError) {
    console.error(`Received error: ${balancesResponse.error.type}`)
    notFound();
  }

  const balances = balancesResponse.data.balances;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {balances.map((user) => (
              <li key={user.accountId} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xl font-medium text-gray-600">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                  <div className={`flex items-center ${Number(user.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    $
                    <span className="text-lg font-semibold">
                      {Number(user.balance).toFixed(2)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
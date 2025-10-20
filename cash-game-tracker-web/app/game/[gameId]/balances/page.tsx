import { getBalances } from "@/app/lib/game-client";
import { SettlementStatus } from "@/app/lib/game";
import { notFound } from "next/navigation";

export default async function BalancesPage(props: { params: { gameId: string } }) {
  const balancesResponse = await getBalances(props.params.gameId)

  if (balancesResponse.isError) {
    console.error(`Received error: ${balancesResponse.error.type}`)
    notFound();
  }

  const balances = balancesResponse.data.balances;
  const house = balancesResponse.data.house;

  const getStatusBadge = (status: SettlementStatus) => {
    switch (status) {
      case SettlementStatus.SETTLED:
        return <span className="text-green-600 font-medium">✓ SETTLED</span>;
      case SettlementStatus.UNSETTLED:
        return <span className="text-yellow-600 font-medium">⚠️ UNSETTLED</span>;
      case SettlementStatus.OVERPAID:
        return <span className="text-red-600 font-medium">🚨 OVERPAID</span>;
      default:
        return null;
    }
  };

  const getChipBalanceLabel = (chipBalance: number) => {
    if (chipBalance < 0) return "(owes)";
    if (chipBalance > 0) return "(owed)";
    return "";
  };

  const getPaymentBalanceLabel = (chipBalance: number) => {
    if (chipBalance < 0) return "Paid:";
    if (chipBalance > 0) return "Received:";
    return "Payment:";
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {balances.map((user) => {
              const chipBalance = Number(user.chipBalance);
              const paymentBalance = Number(user.paymentBalance);
              const outstanding = Number(user.outstanding);

              return (
                <li key={user.accountId} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-3">
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
                  </div>

                  <div className="ml-14 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Chip Balance: <span className="text-gray-500">{getChipBalanceLabel(chipBalance)}</span>
                      </span>
                      <span className={`font-medium ${chipBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${chipBalance.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">{getPaymentBalanceLabel(chipBalance)}</span>
                      <span className={`font-medium ${paymentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {paymentBalance >= 0 ? '+' : ''}${paymentBalance.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-1 mt-2"></div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Outstanding:</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${outstanding >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${outstanding.toFixed(2)}
                        </span>
                        {getStatusBadge(user.status)}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}

            {/* House Balance */}
            <li className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-xl">🏠</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-bold text-blue-900">{house.name}</div>
                  </div>
                </div>
              </div>

              <div className="ml-14 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount to Receive:</span>
                  <span className={`font-medium ${Number(house.chipBalance) > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    ${Number(house.chipBalance).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Amount to Pay:</span>
                  <span className={`font-medium ${Number(house.paymentBalance) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    ${Number(house.paymentBalance).toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-1 mt-2"></div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Net Outstanding:</span>
                  <span className={`font-semibold ${Number(house.outstanding) > 0 ? 'text-green-600' : Number(house.outstanding) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    ${Number(house.outstanding).toFixed(2)}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
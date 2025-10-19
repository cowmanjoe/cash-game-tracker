'use client';

import { useRouter } from "next/navigation";
import { Game, Transfer } from "../lib/game";

export default function TransferTable({ game, transfers: transactions }: { game: Game, transfers: Transfer[]}) {
  const router = useRouter();

  function getTransferUrl(transfer: Transfer) {
    switch (transfer.type) {
      case "BUY_IN":
        return `/game/${game.id}/buy-in/${transfer.id}`;
      case "CASH_OUT":
        return `/game/${game.id}/cash-out/${transfer.accountId}`;
      case "PAYMENT":
        return `/game/${game.id}/payment/${transfer.id}`;
      default:
        throw Error(`Unexpected transfer type: ${transfer.type}`);
    }
  }

  function getTransferTypeDisplay(transfer: Transfer) {
    if (transfer.type === "PAYMENT" && transfer.side) {
      return `PAYMENT (${transfer.side})`;
    }
    return transfer.type;
  }

  function getAmountColor(transfer: Transfer) {
    if (transfer.type === "PAYMENT") {
      return transfer.side === "PAYER" ? "text-red-600" : "text-green-600";
    }
    return "text-gray-900";
  }

  function getRowHoverClass() {
    return "hover:bg-gray-50 cursor-pointer";
  }

  return (
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-200">
        {
          transactions.map((transfer, i) => (
            <tr key={i} onClick={() => router.push(getTransferUrl(transfer))} className={getRowHoverClass()}>
              <td className="px-6 py-4 whitespace-nowrap">{getTransferTypeDisplay(transfer)}</td>
              <td className={`px-6 py-4 whitespace-nowrap font-semibold ${getAmountColor(transfer)}`}>${transfer.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap">{game.players[transfer.accountId].name}</td>
            </tr>
          ))}

      </tbody>
    </table>
  )
}
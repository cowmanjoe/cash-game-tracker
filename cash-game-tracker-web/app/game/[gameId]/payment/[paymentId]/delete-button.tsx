'use client'

import { useState } from "react";
import { deletePaymentAction } from "./actions";

export default function DeletePaymentButton({ gameId, paymentId, amount, side }: {
  gameId: string,
  paymentId: string,
  amount: string,
  side: 'PAYER' | 'RECIPIENT'
}) {
  const [error, setError] = useState<string | undefined>();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel this payment?\n\nAmount: $${amount}\nSide: ${side}\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      const result = await deletePaymentAction({ gameId, paymentId });
      if (result?.error) {
        setError(result.error);
      }
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        className="flex items-center gap-5 rounded-lg bg-red-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-400 md:text-base"
      >
        Cancel
      </button>

      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}

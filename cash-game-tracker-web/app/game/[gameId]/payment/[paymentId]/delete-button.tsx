'use client'

import { useActionState } from "react";
import { deletePaymentAction } from "./actions";

export default function DeletePaymentButton({ gameId, paymentId, amount, side }: {
  gameId: string,
  paymentId: string,
  amount: string,
  side: 'PAYER' | 'RECIPIENT'
}) {
  const [state, formAction, isPending] = useActionState(deletePaymentAction, {});

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = window.confirm(
      `Are you sure you want to cancel this payment?\n\nAmount: $${amount}\nSide: ${side}\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      const formData = new FormData();
      formData.set('gameId', gameId);
      formData.set('paymentId', paymentId);
      formAction(formData);
    }
  };

  return (
    <form onSubmit={handleDelete}>
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deleting...
          </>
        ) : (
          'Cancel'
        )}
      </button>

      {state.error && <p className="mt-2 text-red-600 text-sm">{state.error}</p>}
    </form>
  );
}

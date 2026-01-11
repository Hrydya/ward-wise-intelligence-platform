// Points service was removed — stubbed to avoid accidental usage.

export function getPointsState() {
  return { confirmed: 0, pending: 0, transactions: [], monthUsedKwh: 0 };
}

export function getTransactions() { return []; }
export function awardPoints() { return null; }
export function confirmTransaction() { return false; }
export function redeemPoints() { return { ok: false, error: 'Points service disabled' }; }

export default { getPointsState, getTransactions, awardPoints, confirmTransaction, redeemPoints }; 

/* Local Clean Air Credits service (client-only MVP but robust):
 - Stores balance, monthly redeemed, transactions and awarded action ids in localStorage
 - Enforces monthly cap, converts 15 CAC -> 1 kWh
 - Prevents duplicate awards when caller provides an action id
*/

const BALANCE_KEY = 'cac_balance';
const MONTHLY_KEY = 'cac_monthly_redeemed';
const TX_KEY = 'cac_transactions';
const AWARDED_ACTIONS_KEY = 'cac_awarded_actions';

export const CAC_PER_KWH = 15;
export const MONTHLY_CAP_CAC = 150; // 10 kWh max

function nowMonthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch(e) { return fallback; }
}

function setJSON(key: string, v: any) { localStorage.setItem(key, JSON.stringify(v)); }

export function getBalance(): number {
  // Ensure new users start with 0 CAC (avoid any accidental demo/default values).
  // If balance key is missing, initialize it explicitly to 0.
  const raw = localStorage.getItem(BALANCE_KEY);
  if (raw === null) {
    // setBalance will sanitize and dispatch storage events.
    setBalance(0);
    return 0;
  }
  return Number(raw ?? 0);
}

export function setBalance(n: number) {
  // sanitize: keep non-negative integer
  const v = Math.max(0, Math.floor(Number(n) || 0));
  localStorage.setItem(BALANCE_KEY, String(v));
  try { window.dispatchEvent(new StorageEvent('storage', { key: BALANCE_KEY, newValue: String(v) })); } catch(e) {}
  return v;
}

export type Transaction = {
  id: string;
  type: 'award' | 'redeem';
  amount: number; // CAC amount (positive)
  note?: string;
  timestamp: string; // ISO
}

export function getTransactions(): Transaction[] {
  return getJSON<Transaction[]>(TX_KEY, []);
}

function pushTransaction(tx: Transaction) {
  const txs = getTransactions();
  txs.unshift(tx);
  setJSON(TX_KEY, txs);
}

export function getMonthlyRedeemed(): number {
  const store = getJSON<Record<string, number>>(MONTHLY_KEY, {});
  return Number(store[nowMonthKey()] ?? 0);
}

function addMonthlyRedeemed(n: number) {
  const store = getJSON<Record<string, number>>(MONTHLY_KEY, {});
  const key = nowMonthKey();
  store[key] = (Number(store[key] ?? 0) + n);
  setJSON(MONTHLY_KEY, store);
  try { window.dispatchEvent(new StorageEvent('storage', { key: MONTHLY_KEY, newValue: JSON.stringify(store[key]) })); } catch(e) {}
}

export function canRedeemKwh(kwh = 1): boolean {
  const needed = kwh * CAC_PER_KWH;
  return getBalance() >= needed && (getMonthlyRedeemed() + needed) <= MONTHLY_CAP_CAC;
}

export function redeemForKwh(kwh = 1) {
  const needed = kwh * CAC_PER_KWH;
  if (!canRedeemKwh(kwh)) {
    return { ok: false, error: 'insufficient balance or monthly cap reached' };
  }
  setBalance(getBalance() - needed);
  addMonthlyRedeemed(needed);
  const tx: Transaction = { id: `redeem_${Date.now()}`, type: 'redeem', amount: needed, note: `${needed} CAC → ${kwh} kWh`, timestamp: new Date().toISOString() };
  pushTransaction(tx);
  return { ok: true, cacSpent: needed };
}

// awardCAC prevents duplicate awards when provided an action id.
// opts: { id?: string, note?: string }
export function awardCAC(amount: number, opts?: { id?: string; note?: string }) {
  if (!amount || amount <= 0) return { ok: false, error: 'invalid amount' };
  const actions = getJSON<Record<string, boolean>>(AWARDED_ACTIONS_KEY, {});
  if (opts?.id) {
    if (actions[opts.id]) return { ok: false, error: 'already awarded' };
    actions[opts.id] = true;
    setJSON(AWARDED_ACTIONS_KEY, actions);
  }
  const b = setBalance(getBalance() + amount);
  const tx: Transaction = { id: `award_${Date.now()}`, type: 'award', amount, note: opts?.note, timestamp: new Date().toISOString() };
  pushTransaction(tx);
  return { ok: true, newBalance: b };
}

export function hasAwardedAction(id: string) {
  const actions = getJSON<Record<string, boolean>>(AWARDED_ACTIONS_KEY, {});
  return Boolean(actions[id]);
}

// Run simple migration(s) to clear demo-seeded state.
function runMigrations() {
  try {
    const raw = localStorage.getItem(BALANCE_KEY);
    // If a demo balance (5 CAC) exists but there are no transactions or awarded actions,
    // assume this is a pre-seeded demo value and reset to 0 so new users start with 0 CAC.
    if (raw !== null && Number(raw) === 5) {
      const txs = getTransactions();
      const actions = getJSON<Record<string, boolean>>(AWARDED_ACTIONS_KEY, {});
      if ((txs?.length ?? 0) === 0 && Object.keys(actions ?? {}).length === 0) {
        setBalance(0);
      }
    }
  } catch (e) {
    // non-fatal
  }
}

runMigrations();

export default { getBalance, setBalance, awardCAC, getMonthlyRedeemed, canRedeemKwh, redeemForKwh, getTransactions, hasAwardedAction };


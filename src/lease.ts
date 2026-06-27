// Pure lease math, solvers, and deal evaluation. No UI/DOM here.

export interface LeaseInputs {
  msrp: number;
  sellingPrice: number;
  downPayment: number;
  tradeRebate: number;
  residualPct: number;
  term: number;
  moneyFactor: number;
  acquisitionFee: number;
  upfrontFees: number;
  dispositionFee: number;
  taxRate: number;
}

export type SolveTarget =
  | 'payment'
  | 'sellingPrice'
  | 'downPayment'
  | 'moneyFactor'
  | 'residualPct'
  | 'term';

// Preloaded with the 2026 Toyota Grand Highlander XLE 4WD advertised lease
// (Total SRP $48,113, net cap $42,298, residual $33,679, $459/mo, $3,999 DAS).
export const DEFAULTS: LeaseInputs = {
  msrp: 48113,
  sellingPrice: 45088, // net cap $42,298 + $2,790 cap-cost reduction
  downPayment: 2790,
  tradeRebate: 0,
  residualPct: 70, // $33,679 / $48,113
  term: 36,
  moneyFactor: 0.00289, // implied by $459 base payment (~6.94% APR)
  acquisitionFee: 0, // $750 acq fee is paid at signing below, not financed
  upfrontFees: 750, // acquisition fee, part of due-at-signing
  dispositionFee: 350, // due at lease end
  taxRate: 0, // ad excludes tax, title, license
};

export interface LeaseResult {
  residual: number;
  adjCap: number;
  dep: number;
  fin: number;
  base: number;
  tax: number;
  payment: number;
}

export const MF_TO_APR = 2400;

export function compute(p: LeaseInputs): LeaseResult {
  const residual = (p.msrp * p.residualPct) / 100;
  const adjCap = p.sellingPrice + p.acquisitionFee - p.downPayment - p.tradeRebate;
  const dep = (adjCap - residual) / p.term;
  const fin = (adjCap + residual) * p.moneyFactor;
  const base = dep + fin;
  const tax = base * (p.taxRate / 100);
  const payment = base + tax;
  return { residual, adjCap, dep, fin, base, tax, payment };
}

// Inverse solvers: given a target monthly payment (incl. tax), solve one variable.
export function solve(target: Exclude<SolveTarget, 'payment'>, p: LeaseInputs, pay: number): number {
  const residual = (p.msrp * p.residualPct) / 100;
  const base = pay / (1 + p.taxRate / 100); // base payment before tax
  const k = 1 / p.term + p.moneyFactor; // coefficient on adjCap
  const j = p.moneyFactor - 1 / p.term; // coefficient on residual
  const adjCap = p.sellingPrice + p.acquisitionFee - p.downPayment - p.tradeRebate;

  switch (target) {
    case 'sellingPrice': {
      const a = (base - residual * j) / k;
      return a - p.acquisitionFee + p.downPayment + p.tradeRebate;
    }
    case 'downPayment': {
      const a = (base - residual * j) / k;
      return p.sellingPrice + p.acquisitionFee - p.tradeRebate - a;
    }
    case 'residualPct': {
      const R = (base - adjCap * k) / j;
      return (R / p.msrp) * 100;
    }
    case 'moneyFactor':
      return (base - (adjCap - residual) / p.term) / (adjCap + residual);
    case 'term':
      return (adjCap - residual) / (base - (adjCap + residual) * p.moneyFactor);
  }
}

export interface DerivedDeal {
  inputs: LeaseInputs;
  result: LeaseResult;
  computedField: SolveTarget | null;
}

// Resolve the active deal: forward mode just computes; solve mode back-solves the
// chosen variable from a fixed target payment, then recomputes everything.
export function deriveDeal(
  base: LeaseInputs,
  solveFor: SolveTarget,
  targetPayment: number,
): DerivedDeal {
  if (solveFor === 'payment') {
    return { inputs: base, result: compute(base), computedField: null };
  }
  const solved = solve(solveFor, base, targetPayment);
  const inputs: LeaseInputs = { ...base, [solveFor]: solved };
  return { inputs, result: compute(inputs), computedField: solveFor };
}

// ---- Deal evaluation -------------------------------------------------------

export type Rating = 'good' | 'ok' | 'bad';

export interface VerdictNote {
  label: string;
  text: string;
}

export interface Verdict {
  rating: Rating;
  label: string;
  notes: VerdictNote[];
  onePct: number;
  paymentOnlyPct: number;
  apr: number;
  resPct: number;
  driveoff: number;
}

// Benchmarks: 1% rule tiers from leaseguide.com / Leasehackr; money-factor and
// residual standards from Edmunds, truelane.com, carwhere.com (2026).
export function evaluate(p: LeaseInputs, r: LeaseResult): Verdict {
  const driveoff = p.downPayment + p.tradeRebate + p.upfrontFees;
  const onePctMonthly = r.base + driveoff / p.term;
  const onePct = (onePctMonthly / p.msrp) * 100;
  const paymentOnlyPct = (r.base / p.msrp) * 100;
  const apr = p.moneyFactor * MF_TO_APR;
  const resPct = (r.residual / p.msrp) * 100;
  const notes: VerdictNote[] = [];
  let points = 0;

  let oneLabel: string;
  if (onePct < 1.12) {
    points++;
    oneLabel = 'outstanding';
  } else if (onePct < 1.3) {
    points++;
    oneLabel = 'very good';
  } else if (onePct < 1.45) oneLabel = 'average';
  else if (onePct < 1.6) oneLabel = 'not great';
  else oneLabel = 'poor';
  const dual =
    driveoff > 0.5
      ? ` (${paymentOnlyPct.toFixed(2)}% on the advertised payment alone, before adding ${fmtMoney(
          driveoff,
        )} drive-off)`
      : '';
  notes.push({
    label: '1% rule',
    text: `${onePct.toFixed(
      2,
    )}% of MSRP/mo — pre-tax payment + drive-off ÷ term${dual} — ${oneLabel}. Rough screen vs MSRP; bench <1.12% outstanding, <1.30% very good, <1.45% average.`,
  });

  let mfLabel: string;
  if (p.moneyFactor < 0.0005) {
    points++;
    mfLabel = 'exceptional (subvented)';
  } else if (p.moneyFactor <= 0.00125) {
    points++;
    mfLabel = 'very good';
  } else if (p.moneyFactor <= 0.0025) mfLabel = 'average';
  else if (p.moneyFactor <= 0.003) mfLabel = 'high — ask for the buy rate';
  else mfLabel = 'expensive — push back';
  notes.push({
    label: 'Money factor',
    text: `${p.moneyFactor.toFixed(5)} ≈ ${apr.toFixed(
      2,
    )}% APR — ${mfLabel}. Bench (Tier-1): <0.00125 very good, >0.00250 high.`,
  });

  let resLabel: string;
  if (resPct >= 60) {
    points++;
    resLabel = 'excellent';
  } else if (resPct >= 55) {
    points++;
    resLabel = 'strong';
  } else if (resPct >= 50) resLabel = 'typical';
  else resLabel = 'weak (heavy depreciation)';
  notes.push({
    label: 'Residual',
    text: `${resPct.toFixed(0)}% of MSRP at ${p.term} mo — ${resLabel}. Bench: >55% is strong for a 36-mo lease.`,
  });

  if (p.downPayment > 0) {
    notes.push({
      label: 'Down payment',
      text: `${fmtMoney(
        p.downPayment,
      )} is at risk if the car is totaled/stolen early (gap won't refund it). Many advise $0 down and rolling it into the payment.`,
    });
  }

  let rating: Rating;
  let label: string;
  if (points >= 3) {
    rating = 'good';
    label = 'Strong lease value';
  } else if (points === 2) {
    rating = 'ok';
    label = 'Competitive / decent';
  } else {
    rating = 'bad';
    label = 'Below-average value';
  }

  return { rating, label, notes, onePct, paymentOnlyPct, apr, resPct, driveoff };
}

// ---- Sensitivity ("what each lever needs") ---------------------------------

export interface SensitivityRow {
  key: Exclude<SolveTarget, 'payment'>;
  label: string;
  value: number;
  display: string;
  delta: number;
  deltaDisplay: string | null;
  valid: boolean;
}

export function sensitivity(p: LeaseInputs, targetPayment: number): SensitivityRow[] {
  const sell = solve('sellingPrice', p, targetPayment);
  const down = solve('downPayment', p, targetPayment);
  const mf = solve('moneyFactor', p, targetPayment);
  const res = solve('residualPct', p, targetPayment);
  const term = solve('term', p, targetPayment);

  const moneyDelta = (d: number) => (d > 0 ? '+' : '−') + fmtMoney(Math.abs(d));

  return [
    {
      key: 'sellingPrice',
      label: 'Selling price (cap cost)',
      value: sell,
      display: fmtMoney(sell),
      delta: sell - p.sellingPrice,
      deltaDisplay: Number.isFinite(sell) ? moneyDelta(sell - p.sellingPrice) : null,
      valid: Number.isFinite(sell),
    },
    {
      key: 'downPayment',
      label: 'Down payment',
      value: down,
      display: fmtMoney(down),
      delta: down - p.downPayment,
      deltaDisplay: Number.isFinite(down) ? moneyDelta(down - p.downPayment) : null,
      valid: Number.isFinite(down),
    },
    {
      key: 'moneyFactor',
      label: 'Money factor',
      value: mf,
      display:
        Number.isFinite(mf) && mf >= 0
          ? `${mf.toFixed(5)} (${(mf * MF_TO_APR).toFixed(2)}% APR)`
          : '—',
      delta: mf - p.moneyFactor,
      deltaDisplay:
        Number.isFinite(mf) && mf >= 0
          ? `${mf - p.moneyFactor > 0 ? '+' : '−'}${Math.abs(mf - p.moneyFactor).toFixed(5)}`
          : null,
      valid: Number.isFinite(mf) && mf >= 0,
    },
    {
      key: 'residualPct',
      label: 'Residual %',
      value: res,
      display: Number.isFinite(res) ? `${res.toFixed(1)}%` : '—',
      delta: res - p.residualPct,
      deltaDisplay: Number.isFinite(res)
        ? `${res - p.residualPct > 0 ? '+' : '−'}${Math.abs(res - p.residualPct).toFixed(1)} pt`
        : null,
      valid: Number.isFinite(res),
    },
    {
      key: 'term',
      label: 'Term',
      value: term,
      display: Number.isFinite(term) && term > 0 ? `${term.toFixed(1)} mo` : '—',
      delta: term - p.term,
      deltaDisplay:
        Number.isFinite(term) && term > 0
          ? `${term - p.term > 0 ? '+' : '−'}${Math.abs(term - p.term).toFixed(1)} mo`
          : null,
      valid: Number.isFinite(term) && term > 0,
    },
  ];
}

// ---- Formatters ------------------------------------------------------------

export function fmtMoney(n: number): string {
  return Number.isFinite(n)
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : '—';
}

export function fmtMoney2(n: number): string {
  return Number.isFinite(n)
    ? n.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '—';
}

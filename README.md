# Lease Calculator

A small React + Vite + TypeScript app (MUI UI) to evaluate car leases. Enter what
you know, pick a variable to **solve for**, and everything else updates live so
you can tell whether a lease is a good value.

## Run it

```bash
npm install
npm run dev      # start the dev server (Vite prints the local URL)
```

Other scripts:

```bash
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
npm run typecheck
```

> The original single-file proof-of-concept is preserved at `poc/index.html`.

## Project layout

```
src/
  lease.ts                 # pure math: compute, solvers, evaluation, sensitivity
  theme.ts                 # MUI dark theme + shared palette
  App.tsx                  # state + layout
  components/
    NumberField.tsx        # numeric input with $/% adornments + computed state
    InputsCard.tsx         # deal-terms form
    ResultsCard.tsx        # payment, breakdown, totals
    VerdictPanel.tsx       # rule-of-thumb verdict
    SensitivityCard.tsx    # "what each lever needs" table
```

## What it does

- **Solve for any variable.** Monthly payment, selling price, down payment, money
  factor / APR, residual %, or term. When solving for anything other than the
  payment, you set a **target monthly payment** and the chosen variable is
  back-solved from the rest (non-destructively).
- **Live breakdown** of each payment into depreciation, finance (rent), and tax.
- **Money factor ⇄ APR** stay in sync (`APR = money factor × 2400`); residual can
  be entered as a **% or a $ amount** (each shows the other).
- **Value verdict** using common rules of thumb (the 1% rule, financing cost,
  residual strength, and a down-payment risk note).
- **What-if sensitivity:** for a target payment, see what each single lever would
  independently need to be.

## The math

```
residual      = MSRP × residual%
adjusted cap  = selling price + acquisition fee − down payment − (trade + rebates)
depreciation  = (adjusted cap − residual) / term
finance (rent)= (adjusted cap + residual) × money factor
payment       = (depreciation + finance) × (1 + tax rate)   # monthly-tax model
```

## Caveats

Tax handling varies by state, and acquisition/disposition fees and capitalization
vary by lender. The 1% rule is a rough screen pegged to MSRP. Verify the specifics
for your deal. Not financial advice.

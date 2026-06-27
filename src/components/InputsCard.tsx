import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {
  type LeaseInputs,
  type SolveTarget,
  MF_TO_APR,
  fmtMoney,
} from '../lease';
import { NumberField } from './NumberField';
import { palette } from '../theme';

const SOLVE_OPTIONS: { value: SolveTarget; label: string }[] = [
  { value: 'payment', label: 'Monthly payment' },
  { value: 'sellingPrice', label: 'Selling price' },
  { value: 'downPayment', label: 'Down payment' },
  { value: 'moneyFactor', label: 'Money factor / APR' },
  { value: 'residualPct', label: 'Residual %' },
  { value: 'term', label: 'Term (months)' },
];

interface Props {
  inputs: LeaseInputs;
  computedField: SolveTarget | null;
  onChange: <K extends keyof LeaseInputs>(key: K, value: number) => void;
  solveFor: SolveTarget;
  onSolveForChange: (s: SolveTarget) => void;
  targetPayment: number;
  onTargetPaymentChange: (n: number) => void;
  onReset: () => void;
}

const Row = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
    {children}
  </Box>
);

export function InputsCard({
  inputs,
  computedField,
  onChange,
  solveFor,
  onSolveForChange,
  targetPayment,
  onTargetPaymentChange,
  onReset,
}: Props) {
  const isComputed = (field: SolveTarget) => computedField === field;
  const residualValue = (inputs.msrp * inputs.residualPct) / 100;
  const apr = inputs.moneyFactor * MF_TO_APR;
  const discount = inputs.msrp - inputs.sellingPrice;

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography
        variant="overline"
        sx={{ color: palette.muted, letterSpacing: '0.08em', fontWeight: 600 }}
      >
        Deal terms
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Solve for"
          size="small"
          value={solveFor}
          onChange={(e) => onSolveForChange(e.target.value as SolveTarget)}
          sx={{ minWidth: 200 }}
        >
          {SOLVE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" color="inherit" onClick={onReset} sx={{ color: palette.muted }}>
          Reset
        </Button>
      </Box>

      {solveFor !== 'payment' && (
        <Box sx={{ mb: 2 }}>
          <NumberField
            label="Target monthly payment (incl. tax)"
            value={targetPayment}
            onChange={onTargetPaymentChange}
            prefix="$"
            step={5}
            helper="Held fixed while the computed field is back-solved."
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <NumberField
          label="MSRP (sticker price)"
          value={inputs.msrp}
          onChange={(n) => onChange('msrp', n)}
          prefix="$"
          step={100}
        />
        <NumberField
          label="Negotiated selling price (cap cost)"
          value={inputs.sellingPrice}
          onChange={(n) => onChange('sellingPrice', n)}
          prefix="$"
          step={100}
          computed={isComputed('sellingPrice')}
          helper={
            Number.isFinite(discount)
              ? `${fmtMoney(discount)} off MSRP (${((discount / inputs.msrp) * 100).toFixed(1)}%)`
              : undefined
          }
        />

        <Row>
          <NumberField
            label="Down payment / cap reduction"
            value={inputs.downPayment}
            onChange={(n) => onChange('downPayment', n)}
            prefix="$"
            step={100}
            computed={isComputed('downPayment')}
          />
          <NumberField
            label="Trade-in + rebates"
            value={inputs.tradeRebate}
            onChange={(n) => onChange('tradeRebate', n)}
            prefix="$"
            step={100}
          />
        </Row>

        <Row>
          <NumberField
            label="Residual value (% of MSRP)"
            value={inputs.residualPct}
            onChange={(n) => onChange('residualPct', n)}
            suffix="%"
            step={0.5}
            computed={isComputed('residualPct')}
            helper={`= ${fmtMoney(residualValue)} at lease end`}
          />
          <NumberField
            label="Residual value ($)"
            value={residualValue}
            onChange={(n) =>
              inputs.msrp > 0 && onChange('residualPct', (n / inputs.msrp) * 100)
            }
            prefix="$"
            step={100}
            computed={isComputed('residualPct')}
            helper={`= ${((residualValue / inputs.msrp) * 100).toFixed(1)}% of MSRP`}
          />
        </Row>

        <Row>
          <NumberField
            label="Lease term"
            value={inputs.term}
            onChange={(n) => onChange('term', n)}
            suffix="mo"
            step={1}
            computed={isComputed('term')}
          />
          <NumberField
            label="Sales tax rate (on monthly payment)"
            value={inputs.taxRate}
            onChange={(n) => onChange('taxRate', n)}
            suffix="%"
            step={0.1}
          />
        </Row>

        <Row>
          <NumberField
            label="Money factor"
            value={inputs.moneyFactor}
            onChange={(n) => onChange('moneyFactor', n)}
            step={0.0001}
            computed={isComputed('moneyFactor')}
            helper={`≈ ${apr.toFixed(2)}% APR`}
          />
          <NumberField
            label="Equivalent APR"
            value={apr}
            onChange={(n) => onChange('moneyFactor', n / MF_TO_APR)}
            suffix="%"
            step={0.1}
            computed={isComputed('moneyFactor')}
            helper="APR = money factor × 2400"
          />
        </Row>

        <Row>
          <NumberField
            label="Acquisition fee (financed)"
            value={inputs.acquisitionFee}
            onChange={(n) => onChange('acquisitionFee', n)}
            prefix="$"
            step={25}
          />
          <NumberField
            label="Upfront fees (due at signing)"
            value={inputs.upfrontFees}
            onChange={(n) => onChange('upfrontFees', n)}
            prefix="$"
            step={25}
          />
        </Row>

        <NumberField
          label="Disposition fee (due at lease end)"
          value={inputs.dispositionFee}
          onChange={(n) => onChange('dispositionFee', n)}
          prefix="$"
          step={25}
          helper="Charged when you return the car (waived if you buy/re-lease)."
        />
      </Box>
    </Paper>
  );
}

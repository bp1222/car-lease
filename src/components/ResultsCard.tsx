import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { type LeaseInputs, type LeaseResult, type Verdict, fmtMoney, fmtMoney2 } from '../lease';
import { VerdictPanel } from './VerdictPanel';
import { palette } from '../theme';

interface Props {
  inputs: LeaseInputs;
  result: LeaseResult;
  verdict: Verdict;
}

function StatRow({ label, value, total }: { label: string; value: string; total?: boolean }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        py: 1,
        borderBottom: `1px solid ${palette.border}`,
        fontWeight: total ? 800 : 400,
        fontSize: total ? 15 : 14,
      }}
    >
      <Typography component="span" sx={{ fontWeight: 'inherit', fontSize: 'inherit' }}>
        {label}
      </Typography>
      <Typography
        component="span"
        sx={{ fontWeight: total ? 800 : 600, fontSize: 'inherit', fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: palette.muted, fontSize: 12 }}>
      <Box sx={{ width: 10, height: 10, borderRadius: '3px', backgroundColor: color }} />
      {label} <Box component="b" sx={{ color: palette.text }}>{value}</Box>
    </Box>
  );
}

export function ResultsCard({ inputs, result, verdict }: Props) {
  const r = result;
  const disposition = inputs.dispositionFee || 0;
  const dueAtSigning = inputs.downPayment + inputs.upfrontFees + r.payment;
  const totalFinance = r.fin * inputs.term;
  const totalLease =
    r.payment * inputs.term +
    inputs.downPayment +
    inputs.tradeRebate +
    inputs.upfrontFees +
    disposition;
  const effectiveMonthly = totalLease / inputs.term;

  const totalBase = Math.max(r.dep + r.fin + r.tax, 0.0001);
  const pct = (x: number) => `${(x / totalBase) * 100}%`;

  const paymentStr = Number.isFinite(r.payment)
    ? r.payment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—';

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography
        variant="overline"
        sx={{ color: palette.muted, letterSpacing: '0.08em', fontWeight: 600 }}
      >
        Results
      </Typography>

      <Box
        sx={{
          textAlign: 'center',
          py: 2,
          mt: 1,
          mb: 2,
          borderRadius: 2,
          border: `1px solid ${palette.border}`,
          backgroundColor: palette.panel2,
        }}
      >
        <Typography sx={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          ${paymentStr}
          <Box component="span" sx={{ fontSize: 20, color: palette.muted, fontWeight: 600 }}>
            /mo
          </Box>
        </Typography>
        <Typography variant="body2" sx={{ color: palette.muted }}>
          base {fmtMoney2(r.base)} + tax {fmtMoney2(r.tax)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', height: 14, borderRadius: '7px', overflow: 'hidden', mb: 1, backgroundColor: palette.panel2 }}>
        <Box sx={{ width: pct(r.dep), backgroundColor: palette.dep }} />
        <Box sx={{ width: pct(r.fin), backgroundColor: palette.fin }} />
        <Box sx={{ width: pct(r.tax), backgroundColor: palette.tax }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
        <Legend color={palette.dep} label="Depreciation" value={fmtMoney2(r.dep)} />
        <Legend color={palette.fin} label="Finance" value={fmtMoney2(r.fin)} />
        <Legend color={palette.tax} label="Tax" value={fmtMoney2(r.tax)} />
      </Box>

      <Box>
        <StatRow label="Adjusted cap cost" value={fmtMoney(r.adjCap)} />
        <StatRow
          label="Residual value"
          value={`${fmtMoney(r.residual)}  (${((r.residual / inputs.msrp) * 100).toFixed(0)}%)`}
        />
        <StatRow label="Monthly depreciation" value={fmtMoney2(r.dep)} />
        <StatRow label="Monthly finance (rent)" value={fmtMoney2(r.fin)} />
        <StatRow label="Monthly tax" value={fmtMoney2(r.tax)} />
        <StatRow label="Due at signing" value={fmtMoney(dueAtSigning)} />
        <StatRow label="Disposition fee (lease end)" value={fmtMoney(disposition)} />
        <StatRow label="Total finance charges" value={fmtMoney(totalFinance)} />
        <StatRow label="Total lease cost" value={fmtMoney(totalLease)} total />
        <StatRow label="Effective monthly cost" value={fmtMoney2(effectiveMonthly)} />
      </Box>

      <VerdictPanel verdict={verdict} />
    </Paper>
  );
}

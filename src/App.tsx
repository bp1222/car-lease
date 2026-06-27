import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import {
  type LeaseInputs,
  type SolveTarget,
  DEFAULTS,
  compute,
  deriveDeal,
  evaluate,
} from './lease';
import { InputsCard } from './components/InputsCard';
import { ResultsCard } from './components/ResultsCard';
import { SensitivityCard } from './components/SensitivityCard';
import { palette } from './theme';

const defaultPayment = Math.round(compute(DEFAULTS).payment);

export function App() {
  const [inputs, setInputs] = useState<LeaseInputs>(DEFAULTS);
  const [solveFor, setSolveFor] = useState<SolveTarget>('payment');
  const [targetPayment, setTargetPayment] = useState(defaultPayment);
  const [sensTarget, setSensTarget] = useState(defaultPayment);

  const derived = useMemo(
    () => deriveDeal(inputs, solveFor, targetPayment),
    [inputs, solveFor, targetPayment],
  );
  const verdict = useMemo(
    () => evaluate(derived.inputs, derived.result),
    [derived],
  );

  const handleChange = <K extends keyof LeaseInputs>(key: K, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const handleSolveForChange = (s: SolveTarget) => {
    // Persist the currently back-solved value into the inputs so switching the
    // solve target keeps the field values (and target payment) as they are.
    setInputs(derived.inputs);
    if (s !== 'payment') setTargetPayment(Math.round(derived.result.payment));
    setSolveFor(s);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setSolveFor('payment');
    setTargetPayment(defaultPayment);
    setSensTarget(defaultPayment);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, pb: 10 }}>
      <Typography variant="h1" sx={{ mb: 0.5 }}>
        Lease Calculator
      </Typography>
      <Typography variant="body2" sx={{ color: palette.muted, mb: 3 }}>
        Enter what you know, pick a variable to <em>solve for</em>, and the rest update live.
        Preloaded with the advertised 2026 Toyota Grand Highlander XLE 4WD lease ($459/mo, $3,999 due
        at signing).
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <InputsCard
          inputs={derived.inputs}
          computedField={derived.computedField}
          onChange={handleChange}
          solveFor={solveFor}
          onSolveForChange={handleSolveForChange}
          targetPayment={targetPayment}
          onTargetPaymentChange={setTargetPayment}
          onReset={handleReset}
        />
        <ResultsCard inputs={derived.inputs} result={derived.result} verdict={verdict} />
      </Box>

      <SensitivityCard inputs={derived.inputs} target={sensTarget} onTargetChange={setSensTarget} />

      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: palette.muted, mt: 3 }}>
        Money factor → APR: ×2400 · Monthly-tax model (most US states). The 1% rule is a rough
        screen vs MSRP — verify residual, money factor, fees, and your state's tax method. Not
        financial advice. See{' '}
        <Link href="https://www.leaseguide.com/post/the-one-percent-rule" target="_blank" rel="noopener">
          leaseguide.com
        </Link>
        .
      </Typography>
    </Container>
  );
}

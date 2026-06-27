import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { type LeaseInputs, sensitivity } from '../lease';
import { NumberField } from './NumberField';
import { palette } from '../theme';

interface Props {
  inputs: LeaseInputs;
  target: number;
  onTargetChange: (n: number) => void;
}

export function SensitivityCard({ inputs, target, onTargetChange }: Props) {
  const rows = sensitivity(inputs, target);

  return (
    <Paper sx={{ p: 2.5, mt: 2.5 }}>
      <Typography
        variant="overline"
        sx={{ color: palette.muted, letterSpacing: '0.08em', fontWeight: 600 }}
      >
        What-if — what each lever needs to hit a target payment
      </Typography>

      <Box sx={{ maxWidth: 220, my: 2 }}>
        <NumberField
          label="Target monthly payment (incl. tax)"
          value={target}
          onChange={onTargetChange}
          prefix="$"
          step={5}
        />
      </Box>

      <Typography variant="body2" sx={{ color: palette.muted, mb: 1.5 }}>
        Each row is an <em>independent</em> scenario: holding everything else constant, this is what
        that single variable would need to be to reach the target. You can only pull one lever at a
        time — the math derives one unknown from the rest.
      </Typography>

      <Box>
        {rows.map((row) => (
          <Box
            key={row.key}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              py: 1,
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            <Typography component="span" variant="body2">
              {row.label}
            </Typography>
            <Typography component="span" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {row.display}
              {row.deltaDisplay && (
                <Box component="span" sx={{ color: palette.muted, ml: 1, fontWeight: 400 }}>
                  ({row.deltaDisplay})
                </Box>
              )}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

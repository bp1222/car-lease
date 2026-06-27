import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import type { Verdict } from '../lease';
import { palette } from '../theme';

const CHIP_COLOR: Record<Verdict['rating'], string> = {
  good: palette.good,
  ok: palette.warn,
  bad: palette.bad,
};

export function VerdictPanel({ verdict }: { verdict: Verdict }) {
  return (
    <Box
      sx={{
        mt: 2.5,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${palette.border}`,
        backgroundColor: palette.panel2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography sx={{ fontWeight: 800 }}>Verdict</Typography>
        <Chip
          label={verdict.label}
          size="small"
          sx={{
            fontWeight: 700,
            color: CHIP_COLOR[verdict.rating],
            backgroundColor: `${CHIP_COLOR[verdict.rating]}26`,
          }}
        />
      </Box>
      <Box component="ul" sx={{ m: 0, pl: 2.25, color: palette.muted }}>
        {verdict.notes.map((n, i) => (
          <Typography component="li" variant="body2" key={i} sx={{ my: 0.5 }}>
            <Box component="span" sx={{ color: palette.text, fontWeight: 700 }}>
              {n.label}:
            </Box>{' '}
            {n.text}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

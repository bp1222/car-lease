import { useEffect, useRef, useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { palette } from '../theme';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  helper?: string;
  computed?: boolean;
}

function forEdit(n: number): string {
  if (!Number.isFinite(n)) return '';
  // Trim binary float noise (e.g. 70.00000001 -> 70, 0.002890 -> 0.00289).
  return String(parseFloat(n.toFixed(6)));
}

export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step,
  helper,
  computed = false,
}: NumberFieldProps) {
  const [text, setText] = useState(() => forEdit(value));
  const focused = useRef(false);

  // Sync external updates (solve / reset / linked fields) unless the user is typing.
  useEffect(() => {
    if (!focused.current && parseFloat(text) !== value) {
      setText(forEdit(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <TextField
      label={computed ? `${label} (computed)` : label}
      value={text}
      type="number"
      size="small"
      fullWidth
      helperText={helper}
      slotProps={{
        input: {
          readOnly: computed,
          startAdornment: prefix ? (
            <InputAdornment position="start">{prefix}</InputAdornment>
          ) : undefined,
          endAdornment: suffix ? (
            <InputAdornment position="end">{suffix}</InputAdornment>
          ) : undefined,
        },
        htmlInput: { step },
      }}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        setText(forEdit(value));
      }}
      onChange={(e) => {
        setText(e.target.value);
        const n = parseFloat(e.target.value);
        if (Number.isFinite(n)) onChange(n);
      }}
      sx={{
        '& .MuiFormHelperText-root': { color: palette.muted, marginLeft: 0 },
        ...(computed && {
          '& .MuiInputBase-root': {
            color: palette.accent2,
            fontWeight: 700,
            '& fieldset': { borderColor: `${palette.accent2} !important` },
            backgroundColor: 'rgba(56,211,159,0.08)',
          },
        }),
      }}
    />
  );
}

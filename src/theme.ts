import { createTheme } from '@mui/material/styles';

// Colors carried over from the POC's dark palette.
export const palette = {
  bg: '#0f1117',
  panel: '#171a23',
  panel2: '#1e222e',
  border: '#2a2f3d',
  text: '#e7e9ee',
  muted: '#9aa3b2',
  accent: '#5b8cff',
  accent2: '#38d39f',
  dep: '#5b8cff',
  fin: '#ffb454',
  tax: '#c678dd',
  good: '#38d39f',
  warn: '#ffb454',
  bad: '#ff6b6b',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: palette.bg, paper: palette.panel },
    primary: { main: palette.accent },
    secondary: { main: palette.accent2 },
    success: { main: palette.good },
    warning: { main: palette.warn },
    error: { main: palette.bad },
    text: { primary: palette.text, secondary: palette.muted },
    divider: palette.border,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', border: `1px solid ${palette.border}` },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: palette.panel2 },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `radial-gradient(1200px 600px at 80% -10%, #1b2030 0%, ${palette.bg} 55%)`,
          minHeight: '100vh',
        },
        'input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button':
          { WebkitAppearance: 'none', margin: 0 },
        'input[type=number]': { MozAppearance: 'textfield' },
      },
    },
  },
});

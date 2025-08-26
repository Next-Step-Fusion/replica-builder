// ORDER MATTERS
import './tailwind.css';
//
import '@mantine/notifications/styles.css';

//---
import { DEFAULT_THEME, createTheme, mergeMantineTheme } from '@mantine/core';

export const themeOverride = createTheme({
  primaryShade: 5,
  cursorType: 'pointer',
  fontFamily: 'Inter, sans-serif',
  focusRing: 'auto'
});

// This way we can use the theme object and it will contain all the default values and custom overrides
export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);

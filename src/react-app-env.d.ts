/// <reference types="react-scripts" />

import theme from "./theme/jssTheme";

declare global {
  type Theme = typeof theme;
}

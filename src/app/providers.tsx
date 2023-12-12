"use client";

import { ThemeProvider } from "next-themes";
type ThemeProviderProps = Parameters<typeof ThemeProvider>[0];

export function Provider({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider {...props}>
      {children}
    </ThemeProvider>
  );
}

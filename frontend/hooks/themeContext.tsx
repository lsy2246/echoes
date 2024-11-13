// service/theme/themeContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { ThemeService } from 'service/themeService';

const ThemeContext = createContext<ThemeService | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeService = ThemeService.getInstance();
  
  return (
    <ThemeContext.Provider value={themeService}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeService {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
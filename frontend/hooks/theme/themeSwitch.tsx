// components/theme/themeSwitch.tsx
import React from 'react';

interface ThemeSwitchProps {
  currentTheme: string;
  availableThemes: string[];
  onThemeChange: (themeName: string) => void;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  currentTheme,
  availableThemes,
  onThemeChange
}) => {
  return (
    <select 
      value={currentTheme}
      onChange={(e) => onThemeChange(e.target.value)}
    >
      {availableThemes.map(theme => (
        <option key={theme} value={theme}>
          {theme}
        </option>
      ))}
    </select>
  );
};

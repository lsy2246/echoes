import { ExtensionService } from 'services/extensionService';
import { ThemeService } from 'services/themeService';
import { createServiceContext } from './createServiceContext';
import { ReactNode } from 'react';

export const {
  ExtensionProvider,
  useExtension
} = createServiceContext('Extension', () => ExtensionService.getInstance());

export const {
    ThemeProvider,
    useTheme
} = createServiceContext("Theme", () => ThemeService.getInstance());

export const ServiceProvider = ({ children }: { children: ReactNode })=>(
        <ExtensionProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </ExtensionProvider>
);
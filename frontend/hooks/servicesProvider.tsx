import { CapabilityService } from "services/capabilityService";
import { ThemeService } from "services/themeService";
import { createServiceContext } from "./createServiceContext";
import { ReactNode } from "react";

export const { ExtensionProvider, useExtension } = createServiceContext(
  "Extension",
  () => CapabilityService.getInstance(),
);

export const { ThemeProvider, useTheme } = createServiceContext("Theme", () =>
  ThemeService.getInstance(),
);

// File path:hooks/servicesProvider.tsx
/**
 * ServiceProvider 组件用于提供扩展和主题上下文给其子组件。
 *
 * @param children - 要渲染的子组件。
 */
export const ServiceProvider = ({ children }: { children: ReactNode }) => (
  <ExtensionProvider>
    <ThemeProvider>{children}</ThemeProvider>
  </ExtensionProvider>
);

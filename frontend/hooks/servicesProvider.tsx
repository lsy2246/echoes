import { CapabilityService } from "services/capabilityService";
import { ThemeService } from "services/themeService";
import { ApiService } from "services/apiService";
import { createServiceContext } from "hooks/createServiceContext";
import { ReactNode } from "react";

export const { CapabilityProvider, useCapability } = createServiceContext(
  "Capability", () => CapabilityService.getInstance(),
);

export const { ThemeProvider, useTheme } = createServiceContext(
  "Theme", () => ThemeService.getInstance(),
);

export const { ApiProvider, useApi } = createServiceContext(
  "Api", () => ThemeService.getInstance(),
);


// File path:hooks/servicesProvider.tsx
/**
 * ServiceProvider 组件用于提供扩展和主题上下文给其子组件。
 *
 * @param children - 要渲染的子组件。
 */
export const ServiceProvider = ({ children }: { children: ReactNode }) => (
  <ApiProvider>
    <CapabilityProvider>
      <ThemeProvider>
      {children}
      </ThemeProvider>
    </CapabilityProvider>
  </ApiProvider>
);

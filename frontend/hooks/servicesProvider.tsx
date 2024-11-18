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

export const ServiceProvider = ({ children }: { children: ReactNode }) => (
  <ApiProvider>
    <CapabilityProvider>
      <ThemeProvider>
      {children}
      </ThemeProvider>
    </CapabilityProvider>
  </ApiProvider>
);

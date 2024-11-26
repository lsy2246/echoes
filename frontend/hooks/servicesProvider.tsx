import { CapabilityService } from "core/capability";
import { ApiService } from "core/api";
import { RouteManager } from "core/route";
import { createServiceContext } from "hooks/createServiceContext";
import { ReactNode } from "react";

export const { CapabilityProvider, useCapability } = createServiceContext(
  "Capability",
  () => CapabilityService.getInstance(),
);

export const { RouteProvider, useRoute } = createServiceContext("Route", () =>
  RouteManager.getInstance(),
);

export const { ApiProvider, useApi } = createServiceContext("Api", () =>
  ApiService.getInstance(),
);

export const BaseProvider = ({ children }: { children: ReactNode }) => (
  <ApiProvider>
    <CapabilityProvider>
      <RouteProvider>{children}</RouteProvider>
    </CapabilityProvider>
  </ApiProvider>
);

import { CapabilityService } from "core/capability";
import { HttpClient } from "core/http";
import { RouteManager } from "core/route";
import { createServiceContext } from "hooks/createServiceContext";
import { ReactNode } from "react";
import { StyleProvider } from "hooks/stylesProvider";

export const { CapabilityProvider, useCapability } = createServiceContext(
  "Capability",
  () => CapabilityService.getInstance(),
);

export const { RouteProvider, useRoute } = createServiceContext("Route", () =>
  RouteManager.getInstance(),
);

export const { HttpProvider, useHttp } = createServiceContext("Http", () =>
  HttpClient.getInstance(),
);

export const BaseProvider = ({ children }: { children: ReactNode }) => (
  <HttpProvider>
    <CapabilityProvider>
      <StyleProvider>
        <RouteProvider>{children}</RouteProvider>
      </StyleProvider>
    </CapabilityProvider>
  </HttpProvider>
);

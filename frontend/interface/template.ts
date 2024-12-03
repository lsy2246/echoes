import { HttpClient } from "core/http";
import { CapabilityService } from "core/capability";
import { Serializable } from "interface/serializableType";

export class Template {
  constructor(
    public config: {
      layout?: string;
      styles?: string[];
      scripts?: string[];
      description?: string;
    },
    public element: (services: {
      http: HttpClient;
      capability: CapabilityService;
      args: Serializable;
    }) => React.ReactNode,
  ) {}

  render(services: {
    http: HttpClient;
    capability: CapabilityService;
    args: Serializable;
  }) {
    return this.element(services);
  }
}

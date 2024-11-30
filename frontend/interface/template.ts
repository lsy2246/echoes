import { HttpClient } from 'core/http';
import { CapabilityService } from 'core/capability';

export class Template {
  constructor(
    public name: string,
    public config: {
      layout?: string;
      styles?: string[];
      scripts?: string[];
    },
    public element: (services: {
      http: HttpClient;
      capability: CapabilityService;
    }) => React.ReactNode,
    public description?: string,
  ) {}

  render(services: {
    http: HttpClient;
    capability: CapabilityService;
  }) {
    return this.element(services);
  }
}
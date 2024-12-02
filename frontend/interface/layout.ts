import { HttpClient } from 'core/http';
import { CapabilityService } from 'core/capability';
import { Serializable } from 'interface/serializableType';

export class Layout {
  private http: HttpClient;
  private capability: CapabilityService;

  constructor(
    public element: (props: {
      children: React.ReactNode;
      args?: Serializable;
    }) => React.ReactNode,
    services?: {
      http?: HttpClient;
      capability?: CapabilityService;
    }
  ) {
    this.http = services?.http || HttpClient.getInstance();
    this.capability = services?.capability || CapabilityService.getInstance();
  }

  render(props: {
    children: React.ReactNode;
    args?: Serializable;
  }) {
    return this.element(props);
  }
}
import { HttpClient } from "core/http";
import { CapabilityService } from "core/capability";
import { Serializable } from "interface/serializableType";
import { Layout } from "./layout";

export class Template {
  private http: HttpClient;
  private capability: CapabilityService;

  constructor(
    public config: {
      layout?: Layout;
      styles?: string[];
      scripts?: string[];
      description?: string;
    },
    public element: (props: {
      http: HttpClient;
      args: Serializable;
    }) => React.ReactNode,
    services?: {
      http?: HttpClient;
      capability?: CapabilityService;
    },
  ) {
    this.http = services?.http || HttpClient.getInstance();
    this.capability = services?.capability || CapabilityService.getInstance();
  }

  render(args: Serializable) {
    const content = this.element({
      http: this.http,
      args,
    });

    if (this.config.layout) {
      return this.config.layout.render({
        children: content,
        args,
      });
    }

    return content;
  }
}

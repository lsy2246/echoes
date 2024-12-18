import { HttpClient } from "core/http";
import { Serializable } from "interface/serializableType";
import React from "react";

export class Template {
  private readonly http: HttpClient;

  constructor(
    public element: (props: {
      http: HttpClient;
      args: Serializable;
    }) => React.ReactNode,
    services?: {
      http?: HttpClient;
    },
  ) {
    this.http = services?.http || HttpClient.getInstance();
  }

  render(args: Serializable) {
    return this.element({
      http: this.http,
      args,
    });
  }
}

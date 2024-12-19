import { HttpClient } from "core/http";
import { Serializable } from "interface/serializableType";
import React, { memo } from "react";

export class Template {
  private readonly http: HttpClient;
  private readonly MemoizedElement: React.MemoExoticComponent<
    (props: { http: HttpClient; args: Serializable }) => React.ReactNode
  >;

  constructor(
    element: (props: { http: HttpClient; args: Serializable }) => React.ReactNode,
    services?: {
      http?: HttpClient;
    }
  ) {
    this.http = services?.http || HttpClient.getInstance();
    this.MemoizedElement = memo(element);
  }

  render(args: Serializable) {
    return React.createElement(this.MemoizedElement, {
      http: this.http,
      args,
    });
  }
}

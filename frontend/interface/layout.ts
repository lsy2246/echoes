import { HttpClient } from "core/http";
import { Serializable } from "interface/serializableType";
import React, { createElement, memo } from "react";

export class Layout {
  private readonly http: HttpClient;
  private readonly MemoizedElement: React.MemoExoticComponent<
    (props: {
      children: React.ReactNode;
      args?: Serializable;
      http: HttpClient;
    }) => React.ReactNode
  >;

  constructor(
    public element: (props: {
      children: React.ReactNode;
      args?: Serializable;
      http: HttpClient;
    }) => React.ReactNode,
    services?: {
      http?: HttpClient;
    },
  ) {
    this.http = services?.http || HttpClient.getInstance();
    this.MemoizedElement = memo(element);
  }

  render(props: { children: React.ReactNode; args?: Serializable }) {
    return createElement(this.MemoizedElement, {
      ...props,
      http: this.http,
    });
  }
}

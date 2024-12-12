import { HttpClient } from "core/http";
import { CapabilityService } from "core/capability";
import { Serializable } from "interface/serializableType";
import { createElement, memo } from "react";

export class Layout {
  private http: HttpClient;
  private capability: CapabilityService;
  private readonly MemoizedElement: React.MemoExoticComponent<
    (props: {
      children: React.ReactNode;
      args?: Serializable;
      onTouchStart?: (e: TouchEvent) => void;
      onTouchEnd?: (e: TouchEvent) => void;
    }) => React.ReactNode
  >;

  constructor(
    public element: (props: {
      children: React.ReactNode;
      args?: Serializable;
      onTouchStart?: (e: TouchEvent) => void;
      onTouchEnd?: (e: TouchEvent) => void;
    }) => React.ReactNode,
    services?: {
      http?: HttpClient;
      capability?: CapabilityService;
    },
  ) {
    this.http = services?.http || HttpClient.getInstance();
    this.capability = services?.capability || CapabilityService.getInstance();
    this.MemoizedElement = memo(element);
  }

  render(props: {
    children: React.ReactNode;
    args?: Serializable;
    onTouchStart?: (e: TouchEvent) => void;
    onTouchEnd?: (e: TouchEvent) => void;
  }) {
    return createElement(this.MemoizedElement, {
      ...props,
      onTouchStart: props.onTouchStart,
      onTouchEnd: props.onTouchEnd,
    });
  }
}

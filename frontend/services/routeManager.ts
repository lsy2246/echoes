import React from 'react'; // Import React
import { useEffect } from 'react';
import {  LoaderFunction, RouteObject } from 'react-router-dom';

export class RouteManager {
  private static instance: RouteManager;
  private routes: RouteObject[] = [];

  private constructor() {}

  public static getInstance(): RouteManager {
    if (!RouteManager.instance) {
      RouteManager.instance = new RouteManager();
    }
    return RouteManager.instance;
  }

  private register(path:string, element: React.ReactNode) {
    this.routes.push({
      path,
      element,
    });
  }


  private createRouteElement(path: string,element:React.ReactNode,loader?:LoaderFunction) {
    this.routes.push({
      path,
      element,
      loader?: loader
    })
  }

  public getRoutes(): RouteObject[] {
    return this.routes;
  }

  public addRoute(path: string, templateName: string): void {
    this.routes.push({
      path,
      element: this.createRouteElement(templateName),
    });
  }
}
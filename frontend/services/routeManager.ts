import React from 'react'; // Import React
import { LoaderFunction, RouteObject } from 'react-router-dom';

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


  private createRouteElement(path: string,element:React.ReactNode,loader?:LoaderFunction,children?:RouteObject[]) {
    this.routes.push({
      path,
      element,
      loader,
      children,
    })
  }

  private getRoutes(): RouteObject[] {
    return this.routes;
  }

}
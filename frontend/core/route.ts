import { ReactNode } from "react"; // Import React
import { LoaderFunction } from "react-router-dom";

interface RouteElement {
  element: ReactNode;
  loader?: LoaderFunction;
  children?: RouteElement[];
}

export class RouteManager {
  private static instance: RouteManager;
  private routes = new Map<string, RouteElement>();
  private routesCache = new Map<string, string>();

  private constructor() {}

  public static getInstance(): RouteManager {
    if (!RouteManager.instance) {
      RouteManager.instance = new RouteManager();
    }
    return RouteManager.instance;
  }

  private createRouteElement(path: string, element: RouteElement) {
    this.routes.set(path, element);
  }

  private getRoutes(path: string): RouteElement | undefined {
    return this.routes.get(path);
  }
  private getRoutesCache(path: string): string | undefined {
    return this.routesCache.get(path);
  }
}

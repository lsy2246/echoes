import { CapabilityService } from "core/capability";
import { HttpClient } from "core/http";
import { RouteManager } from "core/route";
import { createServiceContext } from "hooks/createServiceContext";

export default class ServerHub{
    private static instance: ServerHub;
    public http:HttpClient;
    public route:RouteManager;
    public capability:CapabilityService;


    private constructor(http:HttpClient,route:RouteManager,capability:CapabilityService){
        this.http=http;
        this.route=route;
        this.capability=capability;  
    }

    public static getInstance(): ServerHub {
        if (!this.instance) {
          this.instance = new ServerHub(
            HttpClient.getInstance(),
            RouteManager.getInstance(),
            CapabilityService.getInstance(),
          );
        }
        return this.instance;
      }

}

export const { HubProvider, useHub } = createServiceContext("Hub", () =>
  ServerHub.getInstance(),
);

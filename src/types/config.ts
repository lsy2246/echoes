export type Json = 
  | null
  | number
  | string
  | boolean
  | { [key: string]: Json }
  | Json[];

export type Config = Record<string, {
  title: string;
  description?: string;
  value: Json;
}>; 
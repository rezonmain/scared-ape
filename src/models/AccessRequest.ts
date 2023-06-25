import { Entity } from "./Entity.js";

export interface AccessRequest extends Entity {
  email: string;
  whitelisted: boolean;
}

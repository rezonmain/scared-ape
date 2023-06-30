import type { UserRole } from "../constants/userRole.js";
import type { Entity } from "./Entity.js";

export interface User extends Entity {
  email: string;
  role: UserRole; // default "scout"
  whitelist: boolean;
  cuid: string;
}

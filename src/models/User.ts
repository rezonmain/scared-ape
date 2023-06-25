import { UserRole } from "../constants/userRole.js";
import { Entity } from "./Entity.js";

export interface User extends Entity {
  email: string;
  role: UserRole; // default "scout"
}

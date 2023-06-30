import type { User } from "../../../models/User.js";

class UserDto implements User {
  constructor(private opts: User) {}
  get id() {
    return this.opts.id;
  }
  get email() {
    return this.opts.email;
  }
  get whitelist() {
    return this.opts.whitelist ? true : false;
  }
  get role() {
    return this.opts.role;
  }
  get cuid() {
    return this.opts.cuid;
  }
}

export { UserDto };

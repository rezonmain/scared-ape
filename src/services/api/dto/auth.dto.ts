import type { User } from "../../../models/User.js";
interface IChallengeSent {
  email: string;
}

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

  get dto() {
    return {
      id: this.id,
      email: this.email,
      whitelist: this.whitelist,
      role: this.role,
      cuid: this.cuid,
    };
  }
}

class ChallengeSentDto implements IChallengeSent {
  constructor(private opts: IChallengeSent) {}
  get email() {
    return this.opts.email;
  }

  get dto() {
    return {
      email: this.email,
    };
  }
}

export { UserDto, ChallengeSentDto };

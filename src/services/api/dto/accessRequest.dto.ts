import type { AccessRequest } from "../../../models/AccessRequest.js";

class AccessRequestDto implements AccessRequest {
  id: bigint | number;
  email: string;
  whitelisted: boolean;
  createdAt: Date;
  constructor(accessRequest: AccessRequest) {
    this.id = accessRequest.id;
    this.createdAt = accessRequest.createdAt;
    this.email = accessRequest.email;
    this.whitelisted = accessRequest.whitelisted;
  }

  get dto(): AccessRequest {
    return {
      id: this.id,
      createdAt: this.createdAt,
      email: this.email,
      whitelisted: this.whitelisted,
    };
  }
}

export { AccessRequestDto };

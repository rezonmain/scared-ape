import type { Instanciable } from "../types/Constructor.js";

export type ScaredApeErrorCodes = keyof typeof ErrorHelper.errors;
export class ErrorHelper {
  static instanceOf<T extends Instanciable>(
    error: unknown,
    instance: Instanciable
  ): InstanceType<T> | false {
    return error instanceof instance ? (error as InstanceType<T>) : false;
  }

  static errors = {
    // general
    general_001: () => "Something went wrong",
    general_002: () => "Too many requests",

    // auth
    auth_001: () => "Cannot find user",
    auth_002: () => "User is not whitelisted",
    auth_003: () => "Invalid email",
    auth_004: () => "Invalid email login, please try logging in again",
    auth_005: (challengeLifetime) =>
      `You email login has expired, it is valid for ${challengeLifetime} minutes. Please try logging in again`,

    // access request
    access_request_001: () => "You've already requested access",
    access_request_002: () => "No access request found",
    access_request_003: () => "Whitelisted query param must be a boolean",
  } as const;

  static message(code: ScaredApeErrorCodes, ...args: unknown[]): string {
    // @ts-expect-error Find a way to type this
    return ErrorHelper.errors[code](...args);
  }
}

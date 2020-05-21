/**
 * Version for the JSON as payload
 * shared thorught the push notifications
 * and QR Code
 */
export const VERSION = 1;

/**
 * The name of each operation that can be
 * send thorugh push notifications
 */
export enum ApiOp {
  PAIRING_INVITE,
  PAIRING_RESPONSE,
  AGENDA_SEND,
  DELETE_CHILD,
  PAIRING_REINVITE
}

export class ApiBase {
  v = VERSION;
}

export class SignMessage extends ApiBase {
  sign: string;
}
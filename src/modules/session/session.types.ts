export interface IRSCreateEntity {
  userId: number;
  jti: string;
  expiresAt: Date;
}

export interface IRSRotateEntity extends Omit<IRSCreateEntity, "jti"> {
  oldJti: string;
  newJti: string;
}

export interface IRotateSession extends Omit<IRSRotateEntity, "expiresAt"> {}

// src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
    sub: number;
    email: string;
    iat?: number;
    exp?: number;
}

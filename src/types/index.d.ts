export interface JwtPayloadBase {
    id: string;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayloadBase;
        }
    }
}

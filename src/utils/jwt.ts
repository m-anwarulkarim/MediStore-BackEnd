import jwt, { type SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms"; // ✅ এইটা লাগবে

export type JwtPayload = {
    sub: string;
    role: string;
};

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// ✅ expires টাইপ ঠিক করে দিলাম
const ACCESS_EXPIRES: StringValue | number =
    (process.env.JWT_ACCESS_EXPIRES as StringValue) || "15d";

const REFRESH_EXPIRES: StringValue | number =
    (process.env.JWT_REFRESH_EXPIRES as StringValue) || "30d";

if (!ACCESS_SECRET || !REFRESH_SECRET) {
    throw new Error(
        "JWT secrets missing. Set JWT_ACCESS_SECRET & JWT_REFRESH_SECRET in .env",
    );
}

export const signAccessToken = (payload: JwtPayload) => {
    const options: SignOptions = { expiresIn: ACCESS_EXPIRES };
    return jwt.sign(payload, ACCESS_SECRET, options);
};

export const signRefreshToken = (payload: JwtPayload) => {
    const options: SignOptions = { expiresIn: REFRESH_EXPIRES };
    return jwt.sign(payload, REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
};

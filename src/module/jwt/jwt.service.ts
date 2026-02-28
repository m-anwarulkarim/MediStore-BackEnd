import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { USER_STATUS } from "../../generated/prisma/enums";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { getBetterAuthSession } from "./session";

type LoginInput = {
    email: string;
    password: string;
};

class HttpError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}

const sanitizeUser = (user: any) => {
    // password বা sensitive field remove
    const { password, ...rest } = user ?? {};
    return rest;
};

const login = async (payload: LoginInput) => {
    const email = payload?.email?.trim()?.toLowerCase();
    const password = payload?.password;

    if (!email || !password) {
        throw new HttpError(400, "Email and password are required");
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new HttpError(401, "Invalid email or password");
    }

    if (user.status !== USER_STATUS.ACTIVE) {
        throw new HttpError(403, "Account is not active");
    }

    // user.password field তোমার schema তে থাকতে হবে (hashed)
    const hashed = (user as any).password;
    if (!hashed) {
        throw new HttpError(400, "User password is not set");
    }

    const ok = await bcrypt.compare(password, hashed);
    if (!ok) {
        throw new HttpError(401, "Invalid email or password");
    }

    const accessToken = signAccessToken({
        sub: user.id,
        role: user.role,
    });

    const refreshToken = signRefreshToken({
        sub: user.id,
        role: user.role,
    });

    return {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
    };
};

const refresh = async (refreshToken?: string) => {
    if (!refreshToken) throw new HttpError(401, "Refresh token required");

    const payload = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new HttpError(401, "User not found");
    if (user.status !== USER_STATUS.ACTIVE) throw new HttpError(403, "Account is not active");

    const accessToken = signAccessToken({
        sub: user.id,
        role: user.role,
    });

    return { accessToken };
};

const fromSession = async (req: any) => {
    // ✅ 1) better-auth session validate (cookie-based)
    const session = await getBetterAuthSession(req);

    // better-auth session shape সাধারণত session.user.id / session.userId এর মতো হয়
    const sessionUserId =
        (session as any)?.user?.id || (session as any)?.userId || (session as any)?.user?.userId;

    if (!sessionUserId) {
        throw new HttpError(401, "No active session");
    }

    // ✅ 2) DB user load
    const user = await prisma.user.findUnique({
        where: { id: sessionUserId },
    });

    if (!user) {
        throw new HttpError(401, "User not found");
    }

    if (user.status !== USER_STATUS.ACTIVE) {
        throw new HttpError(403, "Account is not active");
    }

    // ✅ 3) Issue JWT access token
    const accessToken = signAccessToken({
        sub: user.id,
        role: user.role,
    });

    return {
        user: sanitizeUser(user),
        accessToken,
    };
};
export const jwtService = {
    login,
    refresh,
    fromSession
};

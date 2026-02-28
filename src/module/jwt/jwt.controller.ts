import type { Request, Response } from "express";
import { jwtService } from "./jwt.service";
const login = async (req: Request, res: Response) => {
    try {
        const result = await jwtService.login(req.body);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: result.user,
            accessToken: result.accessToken,
            // refreshToken চাইলে client এ না দিয়ে cookie তে সেট করাই better
            // refreshToken: result.refreshToken,
        });
    } catch (error: any) {
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Login failed",
        });
    }
};

const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body as { refreshToken?: string };

        const result = await jwtService.refresh(refreshToken);

        return res.status(200).json({
            success: true,
            message: "Token refreshed",
            accessToken: result.accessToken,
        });
    } catch (error: any) {
        return res.status(error.statusCode || 401).json({
            success: false,
            message: error.message || "Refresh failed",
        });
    }
};

const logout = async (_req: Request, res: Response) => {
    // Option A (simple): frontend localStorage clear করবে
    return res.status(200).json({
        success: true,
        message: "Logged out (client should clear tokens)",
    });
};
const fromSession = async (req: Request, res: Response) => {
    try {
        const result = await jwtService.fromSession(req);

        return res.status(200).json({
            success: true,
            message: "JWT issued from session",
            user: result.user,
            accessToken: result.accessToken,
        });
    } catch (error: any) {
        return res.status(error.statusCode || 401).json({
            success: false,
            message: error.message || "Unauthorized",
        });
    }
};

export const jwtController = {
    login,
    refresh,
    logout, fromSession
};
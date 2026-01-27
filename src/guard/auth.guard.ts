import type { NextFunction, Request, Response } from "express";
import { ROLE, USER_STATUS } from "../../generated/prisma/enums";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

const authGuard = (...allowedRoles: ROLE[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Retrieve active session from Better Auth
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      // Check if valid session exists with authenticated user
      if (!session || !session.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - Please login",
        });
      }

      // Fetch complete user data from database to verify current status and role
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      console.log(user);

      // Verify user account is active (not banned, suspended, or deleted)
      if (user?.status !== USER_STATUS.ACTIVE) {
        return res.status(403).json({
          success: false,
          message: "Account is not active",
        });
      }

      // Enforce role-based access control if specific roles are required
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }

      // Attach authenticated user to request object for downstream use
      req.user = user as any;
      next();
    } catch (error) {
      console.error("Auth Guard Error:", error);
      return res.status(500).json({
        success: false,
        message: "Authentication failed",
      });
    }
  };
};

export default authGuard;

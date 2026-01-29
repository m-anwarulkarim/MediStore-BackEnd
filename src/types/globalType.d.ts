import type { User } from "../generated/prisma/client";

global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};

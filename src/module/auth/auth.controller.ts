import type { Request, Response } from "express";
import { userService } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUser();
    res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in createUser:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const userController = {
  createUser,
};

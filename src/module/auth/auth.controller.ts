import type { Request, Response } from "express";
import { userService } from "./auth.service";

const viewAllUsers = async (req: Request, res: Response) => {
  try {
    const data = await userService.viewAllUsers();

    if (data.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: data,
    });
  } catch (error: any) {
    console.error("Error in viewAllUsers controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

const viewSingleUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    const data = await userService.viewSingleUser(id as string);

    if (!data) {
      return res.status(404).json({
        success: true,
        message: "No users found",
        data: data,
      });
    }
    console.log(data);
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: data,
    });
  } catch (error: any) {
    console.error("Error in viewAllUsers controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};
export const userController = {
  viewAllUsers,
  viewSingleUser,
};

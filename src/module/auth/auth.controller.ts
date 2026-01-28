import type { Request, Response } from "express";
import { userService } from "./auth.service";
import { ROLE, USER_STATUS } from "../../../generated/prisma/enums";
// 1.getAllUsers 2.getCurrentUser 3.updateUser

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const data = await userService.getAllUsers();

    if (req.user?.role !== ROLE.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "You can only retrieve your own account",
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
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
// ===================================================
const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    // console.log(user);
    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await userService.getCurrentUser(user.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current user retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getCurrentUser controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve current user",
    });
  }
};
// ========================================

const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(id);

    //1. Validate required fields
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "User ID & status are required",
      });
    }

    // 2.Validate status is a valid enum value
    if (!Object.values(USER_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        validStatuses: Object.values(USER_STATUS),
      });
    }

    //3. Only allow if user is ADMIN or updating their own account
    if (req.user?.role !== ROLE.ADMIN && req.user?.id !== id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own account",
      });
    }

    // Update user
    const data = await userService.updatedUser(id as string, status);
    //4.  Check if user was found and updated
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Users Updated successfully",
      data: data,
    });
  } catch (error: any) {
    console.error("Error in updatedUser controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to Updated users",
      error: error.message,
    });
  }
};

export const userController = {
  getAllUsers,
  getCurrentUser,
  updateUser,
};

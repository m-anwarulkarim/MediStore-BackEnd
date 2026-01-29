import { USER_STATUS } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

// 1. getAllUsers  2. getCurrentUser  3. updatedUser  4. deleteUser

// ==============================
// Fetch all users from database
// ==============================
const getAllUsers = async () => {
  try {
    // Retrieve all user records
    const users = await prisma.user.findMany();

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users from database");
  }
};

// ==============================
// Fetch a single user by ID
// ==============================
const getCurrentUser = async (id: string) => {
  try {
    // Find user by unique ID
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users from database");
  }
};

// ==============================
// Update user status by ID
// ==============================
const updatedUser = async (id: string, status: USER_STATUS) => {
  try {
    // Update user record with new status
    const result = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
    return result;
  } catch (error) {
    console.error("Error Updating users:", error);
    throw new Error("Failed to Update users from database");
  }
};

// ==============================
// Soft delete user (set status to SUSPENDED)
// ==============================
const deleteUser = async (userId: string) => {
  // First check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Instead of removing record, mark user as SUSPENDED
  return prisma.user.update({
    where: { id: userId },
    data: {
      status: USER_STATUS.SUSPENDED,
    },
  });
};

export const userService = {
  getAllUsers,
  getCurrentUser,
  updatedUser,
  deleteUser,
};

import { USER_STATUS } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const viewAllUsers = async () => {
  try {
    const users = await prisma.user.findMany();

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users from database");
  }
};
// ==============================
const getCurrentUser = async (id: string) => {
  try {
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
// =================================
const updatedUser = async (id: string, status: USER_STATUS) => {
  try {
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

export const userService = {
  viewAllUsers,
  getCurrentUser,
  updatedUser,
};

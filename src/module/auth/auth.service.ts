import { prisma } from "../../lib/prisma";

// Fetch all users
const createUser = async () => {
  try {
    const result = await prisma.user.findMany();
    return result;
  } catch (error) {
    console.error("Error in userService.createUser:", error);
    throw new Error("Failed to fetch users");
  }
};

export const userService = {
  createUser,
};

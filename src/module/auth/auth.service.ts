import { ROLE, USER_STATUS } from "../../generated/prisma/enums";
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

const updateUserRoleAndInitSellerProfile = async (id: string, role: ROLE) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id } });

    if (!user) throw new Error("User not found");
    if (user.status !== USER_STATUS.ACTIVE)
      throw new Error("User is not active");

    // 1) Update role
    const updatedUser = await tx.user.update({
      where: { id },
      data: { role },
    });

    // 2) Auto-create seller profile only when upgrading to SELLER
    if (role === ROLE.SELLER) {
      const existingProfile = await tx.sellerProfile.findUnique({
        where: { userId: id },
      });

      if (!existingProfile) {
        await tx.sellerProfile.create({
          data: {
            userId: id,
            shopName: user.name ? `${user.name}'s Shop` : "My Shop",
            shopDescription: "",
          },
        });
      }
    }

    return updatedUser;
  });
};

export const userService = {
  getAllUsers,
  getCurrentUser,
  updatedUser,
  deleteUser,
  updateUserRoleAndInitSellerProfile,
};

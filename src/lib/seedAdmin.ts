import { prisma } from "./prisma";
import { ROLE, USER_STATUS } from "../../generated/prisma/enums";
import { auth } from "./auth";

const seedAdmin = async () => {
  if (!process.env.ADMIN_PASS) {
    throw new Error("ADMIN_PASS environment variable is required");
  }

  const adminData = {
    name: process.env.ADMIN_NAME as string,
    email: process.env.ADMIN_EMAIL as string,
    password: process.env.ADMIN_PASS as string,
    role: ROLE.ADMIN,
    status: USER_STATUS.ACTIVE,
    emailVerified: true,
  };

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (!existingAdmin) {
      // Create new admin
      await auth.api.signUpEmail({
        body: {
          name: adminData.name,
          email: adminData.email,
          password: adminData.password,
        },
      });
      console.log(" Admin user created");
    }

    //  Update  necessary fields
    await prisma.user.update({
      where: { email: adminData.email },
      data: {
        role: adminData.role,
        status: adminData.status,
        emailVerified: adminData.emailVerified,
        name: adminData.name,
      },
    });

    console.log(" Admin user updated with correct role and status");
  } catch (error) {
    console.error(" Failed to seed admin:", error);
    throw error;
  }
};

seedAdmin()
  .catch((error) => {
    console.error("Fatal error during seeding:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

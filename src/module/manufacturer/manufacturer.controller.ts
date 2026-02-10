import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const getAllManufacturers = async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.medicine.findMany({
      where: { isActive: true },
      select: { manufacturer: true },
      distinct: ["manufacturer"],
    });

    const data = rows
      .map((r) => r.manufacturer)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      message: "Manufacturers fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("Get manufacturers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch manufacturers",
    });
  }
};

export const manufacturerController = {
  getAllManufacturers,
};

import { prisma } from "../../lib/prisma";
import { slugify } from "../../ui/slugify";

const createMedicine = async (
  name: string,
  description: string,
  manufacturer: string,
  price: number,
  userId: string,
  categoryId: string,
) => {
  console.log("createMedicine");
  const result = await prisma.medicine.create({
    data: {
      name: name,
      slug: slugify(name),
      description: description,
      manufacturer: manufacturer,
      price: price,
      sellerId: userId,
      categoryId: categoryId,
    },
  });
};

export const medicineService = {
  createMedicine,
};

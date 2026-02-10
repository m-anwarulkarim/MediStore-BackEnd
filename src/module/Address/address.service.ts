import { prisma } from "../../lib/prisma";
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from "../../types/address";
const cleanOpt = (v: unknown) => {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length ? s : undefined;
};

const createAddress = async (input: CreateAddressInput) => {
  const {
    userId,
    fullName,
    phone,
    country = "Bangladesh",
    city,
    state,
    area,
    postalCode,
    addressLine,
    label,
    isDefault = false,
  } = input;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  //  only valid strings will survive
  const data: any = {
    userId,
    fullName,
    country,
    isDefault,
    phone: cleanOpt(phone),
    city: cleanOpt(city),
    state: cleanOpt(state), //  state=String হলে এখানে undefined হয়ে যাবে
    area: cleanOpt(area),
    postalCode: cleanOpt(postalCode),
    addressLine: cleanOpt(addressLine),
    label: cleanOpt(label),
  };

  //  remove undefined keys
  for (const k of Object.keys(data)) {
    if (data[k] === undefined) delete data[k];
  }

  const address = await prisma.address.create({ data });
  return address;
};
const updateAddress = async (input: UpdateAddressInput) => {
  const { id, userId, isDefault, ...rest } = input;

  const existingAddress = await prisma.address.findUnique({ where: { id } });
  if (!existingAddress) throw new Error("Address not found");
  if (existingAddress.userId !== userId)
    throw new Error("Unauthorized to update this address");

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const data: any = {};
  for (const [k, v] of Object.entries(rest)) {
    const cleaned = cleanOpt(v);
    if (cleaned !== undefined) data[k] = cleaned;
  }
  if (isDefault !== undefined) data.isDefault = isDefault;

  return prisma.address.update({ where: { id }, data });
};

const deleteAddress = async (addressId: string, userId: string) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) throw new Error("Address not found");
  if (address.userId !== userId)
    throw new Error("Unauthorized to delete this address");

  const deleted = await prisma.address.delete({
    where: { id: addressId },
  });

  return deleted;
};

const getAllAddresses = async () => {
  const addresses = await prisma.address.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  return addresses;
};

const getMyAddresses = async (userId: string) => {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return addresses;
};

const getMyAddressById = async (userId: string, addressId: string) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) throw new Error("Address not found");
  if (address.userId !== userId)
    throw new Error("Address not found or access denied");

  return address;
};

export const addressService = {
  createAddress,
  updateAddress,
  deleteAddress,
  getAllAddresses,
  getMyAddresses,
  getMyAddressById,
};

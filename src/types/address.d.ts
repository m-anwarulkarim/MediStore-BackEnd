export type CreateAddressInput = {
  userId: string;
  fullName: string;
  country?: string;
  isDefault?: boolean;

  phone?: string;
  city?: string;
  state?: string;
  area?: string;
  postalCode?: string;
  addressLine?: string;
  label?: string;
};

export type UpdateAddressInput = {
  id: string;
  userId: string;

  fullName?: string;
  phone?: string;
  country?: string;
  city?: string;
  state?: string;
  area?: string;
  postalCode?: string;
  addressLine?: string;
  label?: string;
  isDefault?: boolean;
};

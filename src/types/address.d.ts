// service type
export interface CreateAddressInput {
  userId: string;
  fullName: string;
  phone: string;
  country?: string;
  city: string;
  state: string;
  area?: string;
  postalCode: string;
  addressLine: string;
  label?: string;
  isDefault?: boolean;
}
export interface UpdateAddressInput {
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
}

export interface CreateSellerProfileInput {
  userId: string;
  shopName: string;
  shopDescription?: string;
  licenseNumber?: string;
}

export interface CreateSellerProfilePayload {
  shopName: string;
  shopDescription?: string;
  licenseNumber?: string;
}

export interface UpdateSellerProfilePayload {
  shopName?: string;
  shopDescription?: string;
  shopLogo?: string;
  licenseNumber?: string;
}

export interface UpdateSellerProfileInput {
  userId: string;
  shopName?: string;
  shopDescription?: string;
  shopLogo?: string;
  licenseNumber?: string;
}

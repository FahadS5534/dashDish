export interface Address {
  id: number;
  label: string;
  street: string;
  city: string;
  zipCode: string;
  instructions?: string;
  isDefault: boolean;
  endpointRef?: string;
}

export interface AddressRequest {
  label: string;
  street: string;
  city: string;
  zipCode: string;
  instructions?: string;
}

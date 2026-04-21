export interface Tenant {
  id: string;
  name: string;
  businessType: string;
  planId: string;
  planExpiry: string;
  domain: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

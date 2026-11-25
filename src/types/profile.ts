export interface UserProfile {
  id: number; // sempre 1
  name: string;
  email: string;
  storeName: string;
  photoUri: string | null;
  biometricEnabled: number; // 0 ou 1
  cnpj: string; // só dígitos ('' se não informado)
  legalName: string; // razão social
  address: string;
  phone: string; // só dígitos
}

export interface SaveProfileInput {
  name: string;
  email: string;
  storeName: string;
  photoUri: string | null;
  cnpj: string;
  legalName: string;
  address: string;
  phone: string;
}

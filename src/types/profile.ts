export interface UserProfile {
  id: number; // sempre 1
  name: string;
  email: string;
  storeName: string;
  photoUri: string | null;
  biometricEnabled: number; // 0 ou 1
}

export interface SaveProfileInput {
  name: string;
  email: string;
  storeName: string;
  photoUri: string | null;
}

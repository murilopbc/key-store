import { getDatabase } from './database';
import { UserProfile, SaveProfileInput } from '../types/profile';

/** O perfil é um registro único (id sempre 1): "se existe atualiza, senão insere". */
export async function getProfile(): Promise<UserProfile | null> {
  const db = await getDatabase();
  return db.getFirstAsync<UserProfile>('SELECT * FROM profile WHERE id = 1');
}

export async function saveProfile(input: SaveProfileInput): Promise<void> {
  const db = await getDatabase();
  const existing = await getProfile();

  if (existing) {
    await db.runAsync(
      `UPDATE profile
       SET name = ?, email = ?, storeName = ?, photoUri = ?,
           cnpj = ?, legalName = ?, address = ?, phone = ?
       WHERE id = 1`,
      input.name,
      input.email,
      input.storeName,
      input.photoUri,
      input.cnpj,
      input.legalName,
      input.address,
      input.phone,
    );
  } else {
    await db.runAsync(
      `INSERT INTO profile
         (id, name, email, storeName, photoUri, biometricEnabled, cnpj, legalName, address, phone)
       VALUES (1, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      input.name,
      input.email,
      input.storeName,
      input.photoUri,
      input.cnpj,
      input.legalName,
      input.address,
      input.phone,
    );
  }
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO profile (id, name, email, storeName, photoUri, biometricEnabled)
     VALUES (1, '', '', '', NULL, 0)`,
  );
  await db.runAsync(
    'UPDATE profile SET biometricEnabled = ? WHERE id = 1',
    enabled ? 1 : 0,
  );
}

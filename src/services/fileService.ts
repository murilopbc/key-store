import { File, Paths } from 'expo-file-system';

/**
 * A foto da câmera fica no cache (o SO pode apagar). Copiamos para o
 * diretório de documentos, que é permanente, e devolvemos o uri novo.
 */
export function savePhotoPermanently(tempUri: string, prefix: string): string {
  const destino = new File(Paths.document, `${prefix}-${Date.now()}.jpg`);
  new File(tempUri).copy(destino);
  return destino.uri;
}

export function deletePhoto(uri: string | null): void {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // arquivo já não existe: nada a fazer
  }
}

import { useState, useCallback } from 'react';
import { fetchCompanyByCnpj, CnpjLookupError } from '../services/brasilApi';
import { isValidCnpj } from '../utils/cnpj';
import { CompanyInfo } from '../types/company';

/** Decide a consulta de CNPJ: valida antes de chamar a API, controla loading e erro. */
export function useCnpjLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (cnpj: string): Promise<CompanyInfo | null> => {
    setError(null);
    if (!isValidCnpj(cnpj)) {
      setError('CNPJ inválido. Confira os 14 dígitos.');
      return null;
    }
    try {
      setLoading(true);
      return await fetchCompanyByCnpj(cnpj);
    } catch (e) {
      setError(e instanceof CnpjLookupError ? e.message : 'Não foi possível consultar o CNPJ.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { lookup, loading, error, clearError };
}

import { CompanyInfo } from '../types/company';
import { onlyDigits } from '../utils/cnpj';

/**
 * Integração com API externa: BrasilAPI (https://brasilapi.com.br).
 * Gratuita, sem chave de acesso. Consulta os dados públicos de um CNPJ na Receita Federal.
 */
const BASE_URL = 'https://brasilapi.com.br/api';
const TIMEOUT_MS = 10000;
// A BrasilAPI fica atrás do Cloudflare, que recusa alguns User-Agents genéricos (403/429).
// Identificar o app explicitamente evita depender do padrão de cada plataforma.
const HEADERS = { Accept: 'application/json', 'User-Agent': 'LojaDeChaves/1.0' };

export type CnpjLookupErrorKind = 'not_found' | 'invalid' | 'rate_limit' | 'offline' | 'unknown';

export class CnpjLookupError extends Error {
  constructor(public kind: CnpjLookupErrorKind, message: string) {
    super(message);
    this.name = 'CnpjLookupError';
  }
}

/** Formato (parcial) da resposta da BrasilAPI: só os campos que o app usa. */
interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  descricao_tipo_de_logradouro: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  ddd_telefone_1: string | null;
  descricao_situacao_cadastral: string | null;
}

function buildAddress(data: BrasilApiCnpjResponse): string {
  const type = data.descricao_tipo_de_logradouro?.trim() ?? '';
  const name = data.logradouro?.trim() ?? '';
  // às vezes a Receita já inclui o tipo no nome ("RUA RUA X" / "QUADRA SAUN QUADRA 5")
  const nameHasType = type && name.toUpperCase().includes(type.toUpperCase());
  const street = (nameHasType ? name : `${type} ${name}`).trim();
  const cep = data.cep ? onlyDigits(data.cep) : '';
  const parts = [
    [street, data.numero].filter(Boolean).join(', '),
    data.complemento,
    data.bairro,
    [data.municipio, data.uf].filter(Boolean).join('/'),
    cep.length === 8 ? `CEP ${cep.slice(0, 5)}-${cep.slice(5)}` : '',
  ];
  return parts.map((p) => (p ?? '').trim()).filter(Boolean).join(' - ');
}

function toCompanyInfo(data: BrasilApiCnpjResponse): CompanyInfo {
  return {
    cnpj: onlyDigits(data.cnpj),
    legalName: data.razao_social?.trim() ?? '',
    tradeName: data.nome_fantasia?.trim() ?? '',
    address: buildAddress(data),
    phone: onlyDigits(data.ddd_telefone_1 ?? ''),
    status: data.descricao_situacao_cadastral?.trim() ?? '',
  };
}

export async function fetchCompanyByCnpj(cnpj: string): Promise<CompanyInfo> {
  const digits = onlyDigits(cnpj);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/cnpj/v1/${digits}`, {
      headers: HEADERS,
      signal: controller.signal,
    });
  } catch {
    // sem internet, DNS falhou ou estourou o tempo limite
    throw new CnpjLookupError('offline', 'Sem conexão com a BrasilAPI. Verifique a internet ou preencha os dados à mão.');
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 404) {
    throw new CnpjLookupError('not_found', 'CNPJ não encontrado na Receita Federal.');
  }
  if (response.status === 400) {
    throw new CnpjLookupError('invalid', 'A BrasilAPI considerou este CNPJ inválido.');
  }
  if (response.status === 429) {
    throw new CnpjLookupError('rate_limit', 'Muitas consultas seguidas. Aguarde um minuto e tente de novo.');
  }
  if (!response.ok) {
    throw new CnpjLookupError('unknown', `A BrasilAPI respondeu com erro (${response.status}). Tente mais tarde.`);
  }

  return toCompanyInfo((await response.json()) as BrasilApiCnpjResponse);
}

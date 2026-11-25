/** Dados da empresa que o app usa, já traduzidos da resposta da BrasilAPI. */
export interface CompanyInfo {
  cnpj: string; // só dígitos
  legalName: string; // razão social
  tradeName: string; // nome fantasia (pode vir vazio)
  address: string; // endereço montado em uma linha
  phone: string; // DDD + número, só dígitos (pode vir vazio)
  status: string; // situação cadastral: ATIVA, BAIXADA, INAPTA...
}

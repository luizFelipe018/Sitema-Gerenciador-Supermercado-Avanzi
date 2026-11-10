export interface Product {
  codigo: string
  descricao: string
  ean: string | null
  descricao_departamento: string | null
  departamento: number | string | null
  secao: number | string | null
  grupo: number | string | null
  familia: string | null
  status: string | null
  ncm: string | null
  estoque_atual: number | null
  pmz: number | null
  custo: number | null
  preco_venda: number | null
  preco_oferta: number | null
  preco_venda_kg: number | null
  preco_oferta_kg: number | null
  validade: string | null
  data_cadastro: string | null
  data_alteracao: string | null
  qtde_vendida_mes: number | null
  vendas_media: number | null
  participa_cotacao: number | boolean | null
  quantidade_kg_l: number | null
  descricao_kglt: string | null
  marca: string | null
  ultima_alteracao_preco: string | null
  data_ultima_entrada: string | null
  aceita_troca: number | boolean | null
}

export interface ProductInput {
  codigo: string
  descricao: string
  ean?: string | null
  descricao_departamento?: string | null
  departamento?: number | string | null
  secao?: number | string | null
  grupo?: number | string | null
  familia?: string | null
  status?: string | null
  ncm?: string | null
  estoque_atual?: number | null
  pmz?: number | null
  custo?: number | null
  preco_venda?: number | null
  preco_oferta?: number | null
  preco_venda_kg?: number | null
  preco_oferta_kg?: number | null
  validade?: string | null
  data_cadastro?: string | null
  quantidade_kg_l?: number | null
  descricao_kglt?: string | null
  marca?: string | null
}

export interface User {
  id: number
  nome: string
  usuario: string
  senha: string
  cargo: Cargo
  created_at?: string
}

export type Cargo = 'administrador' | 'gerente' | 'atendente'

export interface UserPublic {
  id: number
  nome: string
  usuario: string
  cargo: string
}

export interface JwtUserPayload {
  id: number
  usuario: string
  nome?: string
  cargo: Cargo
  iat?: number
  exp?: number
}

export interface AuthResponse {
  user: UserPublic
  token: string
}

export type TipoPlaca = 'pequena' | 'grande'

export interface RegistroPlaca {
  id: number
  usuario: string
  descricao: string
  codigo: string | null
  ean: string | null
  preco: number
  preco_info: string | null
  quantidade_kg_l: number
  descricao_kglt: string | null
  config: string | null
  marca: string | null
  ordem: number
  tipo_placa: TipoPlaca | string
  criado_em?: string
}

export interface PlacaInput {
  descricao: string
  codigo: string | null
  ean: string | null
  preco: number
  preco_info?: string | null
  quantidade_kg_l?: number
  descricao_kglt?: string | null
  config?: string | null
  marca?: string | null
  tipo_placa?: TipoPlaca
}

export interface LogPlaca {
  id: number
  descricao: string
  codigo: string | null
  ean: string | null
  preco: number | null
  tipo_placa: TipoPlaca | string
  impressa: number | boolean
  impressa_em: string | null
  criado_em?: string
}

export interface ListaPreco {
  id: number
  nome: string
  finalizada?: number | boolean
  lista_pai_id?: number | null
  data_oferta?: string | null
  criado_em?: string
}

export interface ListaPrecoItem {
  id: number
  lista_id: number
  codigo?: string | null
  ean?: string | null
  descricao: string
  preco: number
  ordem: number
}

export interface DashboardData {
  totalProdutos: number
  semEan: number
  semImagem: number
  naoVerificados: number
  porDepto: DepartamentoCount[]
  placasMes: PlacasMesCount
  impressasMes: ImpressasMesCount
  placasDias: PlacaDia[]
  topProdutos: TopProduto[]
  listasMes: number
}

export interface DepartamentoCount {
  depto: string
  total: number
}

export interface PlacasMesCount {
  pequena: number
  grande: number
  total: number
}

export interface ImpressasMesCount {
  impressas: number
  geradas: number
}

export interface PlacaDia {
  dia: string
  total: number
}

export interface TopProduto {
  descricao: string
  tipo_placa: string
  total: number
}

export interface Configuracao {
  chave: string
  valor: string
}

export interface ImagemVerificacao {
  codigo: string
  status: string
  observacao?: string | null
}

export interface EstoquePlaca {
  id: number
  nome: string
  preco: number
  quantidade: number
  localizacao: string
  created_at?: string
  updated_at?: string
}

export interface MovimentoEstoquePlaca {
  id: number
  placa_id: number | null
  nome: string
  preco: number
  tipo: 'entrada' | 'saida' | 'transferencia'
  quantidade: number
  localizacao_origem: string | null
  localizacao_destino: string | null
  observacao: string | null
  created_at?: string
}

export interface Novidade {
  id: number
  ean: string | null
  descricao: string
  preco: number
  loja: string | null
  quantidade_kg_l: number | null
  descricao_kglt: string | null
  preco_kg: number | null
  status: 'novidades' | 'ja_tem' | 'para_chegar' | 'nao_fazer'
  created_by: string | null
  created_at?: string
  updated_at?: string
}

export interface CardapioSemanal {
  id: number
  data_inicio: string
  dia_semana: number
  tipo_arroz: string | null
  tipo_feijao: string | null
  carnes: string | null
  guarnicoes: string | null
  massas: string | null
  created_at?: string
  updated_at?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiError {
  error: string
}

export interface PlacaParsedItem {
  descricao: string
  codigo: string | null
  ean: string | null
  preco: number
  tipo_placa: TipoPlaca
  quantidade_kg_l?: number
  descricao_kglt?: string | null
  marca?: string | null
  preco_info?: string | null
  preco_original_str?: string | null
  ja_tem_placa?: boolean
}

export interface ImportPlacasResult {
  ok: boolean
  importadas: number
  grupos: { tipo: string; total: number; logIds: number[] }[]
  itens: PlacaParsedItem[]
  erros?: { linha: number; texto: string; erro: string }[]
}

export interface PlacaSalva {
  descricao: string
  codigo: string
  ean: string
  preco: number
  preco_info: string
  quantidade_kg_l: number
  descricao_kglt: string
  config: string
  marca: string
}

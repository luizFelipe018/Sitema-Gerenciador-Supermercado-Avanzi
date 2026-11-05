import { PlacaSalva } from './index'

declare global {
  interface Window {
    API: string
    authHeaders: () => { Authorization: string }
    PERMISSOES: Record<string, boolean>
    fecharModais: () => void
    carregarConteudo: (url: string) => Promise<void>
    abrirPagina: (url: string) => Promise<void>
    iniciarTema: () => void
    alternarTema: () => void
    _ultimasPlacasGeradas: number[]
    placasSalvas: PlacaSalva[]
    paginaPlacas: number
    paginaPlacasAmarela: number
    paginaPlacasGrande: number
    fetchTodasPlacasSalvas: (tipo: string) => void
    renderizarPlacas: (tipo: string) => void
    renderizarPlacasAmarela: () => void
    renderizarPlacasGrande: () => void
    salvarERenderizar: (tipo: string) => void
    abrirBuscaNome: (tipo: string) => void
    imprimirTudo: () => void
  }
}

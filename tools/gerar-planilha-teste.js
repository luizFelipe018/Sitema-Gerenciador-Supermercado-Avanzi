// Gera uma planilha de teste no formato esperado pelo importador.
// Uso: node tools/gerar-planilha-teste.js [saida.xlsx]
const XLSX = require('xlsx')
const path = require('path')

const saida = path.resolve(process.argv[2] || 'produtos-teste.xlsx')

const cabecalho = [
    'Código', 'Descrição', 'EAN', 'Departamento', 'Seção', 'Grupo', 'Família', 'Status', 'NCM',
    'Estoque Atual', 'PMZ', 'Custo', 'Preço Venda', 'Preço Oferta', 'Preço Venda KG',
    'Preço Oferta KG', 'Validade', 'Data Cadastro', 'Data Alteração', 'Qtd Vendida Mês',
    'Vendas Média', 'Participa Cotação', 'Quantidade KG/L', 'Descrição KG/LT', 'Marca',
    'Última Alteração Preço', 'Última Entrada', 'Aceita Troca'
]

const linhas = [
    // 28 campos: Código, Descrição, EAN, Depto, Seção, Grupo, Família, Status, NCM, Estoque,
    // PMZ, Custo, PreçoVenda, PreçoOferta, PreçoVendaKG, PreçoOfertaKG, Validade, DataCadastro,
    // DataAlteracao, QtdVendida, VendasMédia, ParticipaCotação, QtdKG/L, DescriçãoKG/LT, Marca,
    // UltimaAlteracaoPreco, UltimaEntrada, AceitaTroca
    ['TESTE001', 'ARROZ TIO JOAO 5KG', '7891234567890', '1', '1', '1', 'CEREJAIS', '0 - LIBERADO PARA VENDA', '1006.30', '120,5', '2,50', '18,00', '29,90', '24,90', '5,99', '4,99', '180', '01/03/2024', '15/09/2025', '350,75', '12,5', '1', '1,000', 'QUILO', '1524 - AMBEV', '20/01/2026', '10/02/2026', '1'],
    ['TESTE002', 'FEIJAO CARIOCA 1KG', '', '1', '1', '1', 'CEREJAIS', '0 - LIBERADO PARA VENDA', '0713.33', '80', '3,10', '7,90', '9,99', '', '', '', '365', '01/03/2024', '15/09/2025', '200', '8', '0', '1,000', 'QUILO', 'AMBEV', '20/01/2026', '', '0'],
    ['TESTE003', 'LEITE INTEGRAL 1L', '7890000000003', '2', '2', '3', 'LATICINIOS', '0 - LIBERADO PARA VENDA', '0401.20', '95,25', '4,20', '4,50', '5,79', '', '', '', '20', '', '15/09/2025', '90,1', '5', '1', '1,000', 'LITRO', 'ITAMBÉ', '', '', '1']
]

// Linha 1: título / logo   |   Linha 2: vazia   |   Linha 3: cabeçalhos
const aoa = [
    ['RELATÓRIO DE PRODUTOS - SUPER AVANZI'],
    [],
    cabecalho,
    ...linhas
]

const wb = XLSX.utils.book_new()
const ws = XLSX.utils.aoa_to_sheet(aoa)
XLSX.utils.book_append_sheet(wb, ws, 'Produtos')
XLSX.writeFile(wb, saida)

console.log('Planilha de teste criada em ' + saida)

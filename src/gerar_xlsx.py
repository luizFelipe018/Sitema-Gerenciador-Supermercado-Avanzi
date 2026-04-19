import sys
import json
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from datetime import datetime

json_path = sys.argv[1]
xlsx_path = sys.argv[2]

with open(json_path, 'r', encoding='utf-8') as f:
    dados = json.load(f)

lista = dados['lista']
itens = dados['itens']

wb = Workbook()
ws = wb.active
ws.title = 'Planilha1'

# ── Estilos ───────────────────────────────────────────
fonte_cabecalho = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
fonte_dados     = Font(name='Calibri', size=11)
fonte_rodape    = Font(name='Calibri', size=10, italic=True, color='666666')

fill_cabecalho  = PatternFill('solid', fgColor='B51515')
fill_par        = PatternFill('solid', fgColor='F9F9F9')
fill_impar      = PatternFill('solid', fgColor='FFFFFF')

borda_fina = Side(style='thin', color='E5E7EB')
borda = Border(
    left=Side(style='thin', color='E5E7EB'),
    right=Side(style='thin', color='E5E7EB'),
    top=Side(style='thin', color='E5E7EB'),
    bottom=Side(style='thin', color='E5E7EB')
)

alinha_centro  = Alignment(horizontal='center', vertical='center')
alinha_esq     = Alignment(horizontal='left',   vertical='center')
alinha_dir     = Alignment(horizontal='right',  vertical='center')

# ── Cabeçalho ─────────────────────────────────────────
cabecalhos = ['CODIGO', 'DESCRICAO', 'EAN', 'PRECO']
for col, titulo in enumerate(cabecalhos, 1):
    cell = ws.cell(row=1, column=col, value=titulo)
    cell.font      = fonte_cabecalho
    cell.fill      = fill_cabecalho
    cell.alignment = alinha_centro
    cell.border    = borda

# ── Dados ─────────────────────────────────────────────
for i, item in enumerate(itens):
    row  = i + 2
    fill = fill_par if i % 2 == 0 else fill_impar

    preco_val = item.get('preco', 0)
    try:
        preco_str = f"{float(preco_val):.2f}".replace('.', ',')
    except:
        preco_str = str(preco_val)

    valores = [
        item.get('codigo', ''),
        item.get('descricao', ''),
        item.get('ean', ''),
        preco_str
    ]
    alinhamentos = [alinha_centro, alinha_esq, alinha_centro, alinha_dir]

    for col, (val, alin) in enumerate(zip(valores, alinhamentos), 1):
        cell = ws.cell(row=row, column=col, value=val if val else '')
        cell.font      = fonte_dados
        cell.fill      = fill
        cell.alignment = alin
        cell.border    = borda
        # EAN como texto para não perder zeros à esquerda
        if col == 3 and val:
            cell.number_format = '@'

# ── Rodapé ────────────────────────────────────────────
rodape_row = len(itens) + 3
agora = datetime.now().strftime('%d/%m/%Y, %H:%M:%S')
cell = ws.cell(row=rodape_row, column=1, value=f'Gerado em: {agora}')
cell.font      = fonte_rodape
cell.alignment = alinha_esq
ws.merge_cells(f'A{rodape_row}:D{rodape_row}')

# ── Largura das colunas ───────────────────────────────
ws.column_dimensions['A'].width = 14   # CODIGO
ws.column_dimensions['B'].width = 45   # DESCRICAO
ws.column_dimensions['C'].width = 18   # EAN
ws.column_dimensions['D'].width = 12   # PRECO

# ── Altura da linha de cabeçalho ──────────────────────
ws.row_dimensions[1].height = 20

wb.save(xlsx_path)
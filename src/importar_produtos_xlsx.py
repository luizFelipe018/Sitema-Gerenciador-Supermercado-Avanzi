import sys
import json
import openpyxl
from datetime import datetime

xlsx_path = sys.argv[1]

def to_decimal(val):
    if val is None or val == '' or val == '-':
        return 0
    try:
        s = str(val).strip()
        if ',' in s:
            s = s.replace('.', '').replace(',', '.')
        return float(s)
    except:
        return 0

def to_date(val):
    if not val or val == '0':
        return None
    try:
        return datetime.strptime(str(val).strip(), '%d/%m/%Y').strftime('%Y-%m-%d')
    except:
        return None

def to_bool(val):
    if not val:
        return 0
    return 1 if str(val).lower() in ('true', 'sim', 's', '1') else 0

def limpar_marca(val):
    if not val:
        return None
    # Remove código numérico do início "1524 - AMBEV" -> "AMBEV"
    s = str(val).strip()
    if ' - ' in s:
        parts = s.split(' - ', 1)
        if parts[0].strip().isdigit():
            return parts[1].strip()
    return s

wb = openpyxl.load_workbook(xlsx_path)
ws = wb.active

produtos = []
header_row = 3  # Cabeçalhos estão na linha 3
data_start = 4  # Dados começam na linha 4

for row_idx, row in enumerate(ws.iter_rows(min_row=data_start, values_only=True)):
    if not row[0]:
        continue
    codigo = str(row[0]).strip()
    if not codigo or codigo == 'Código':
        continue

    produto = {
        'codigo':               codigo,
        'descricao':            str(row[1]).strip() if row[1] else None,
        'ean':                  str(row[2]).strip() if row[2] else None,
        'departamento':         str(row[3]).strip() if row[3] else None,
        'secao':                str(row[4]).strip() if row[4] else None,
        'grupo':                str(row[5]).strip() if row[5] else None,
        'familia':              str(row[6]).strip() if row[6] else None,
        'status':               str(row[7]).strip() if row[7] else None,
        'ncm':                  str(row[8]).strip() if row[8] else None,
        'estoque_atual':        to_decimal(row[9]),
        'pmz':                  to_decimal(row[10]),
        'custo':                to_decimal(row[11]),
        'preco_venda':          to_decimal(row[12]),
        'preco_oferta':         to_decimal(row[13]),
        'preco_venda_kg':       to_decimal(row[14]),
        'preco_oferta_kg':      to_decimal(row[15]),
        'validade':             str(row[16]).strip() if row[16] else None,
        'data_cadastro':        to_date(row[17]),
        'data_alteracao':       to_date(row[18]),
        'qtde_vendida_mes':     to_decimal(row[19]),
        'vendas_media':         to_decimal(row[20]),
        'participa_cotacao':    to_bool(row[21]),
        'quantidade_kg_l':      to_decimal(row[22]),
        'descricao_kglt':       str(row[23]).strip() if row[23] else None,
        'marca':                limpar_marca(row[24]),
        'ultima_alteracao_preco': to_date(row[25]),
        'data_ultima_entrada':  to_date(row[26]),
        'aceita_troca':         to_bool(row[27]),
    }
    produtos.append(produto)

print(json.dumps({'total': len(produtos), 'produtos': produtos}, ensure_ascii=False))
# -*- coding: utf-8 -*-
# -*- coding: utf-8 -*-
import sys
import json
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from docx import Document

docx_path = sys.argv[1]
doc = Document(docx_path)

def limpar(texto):
    # Remove caracteres especiais corrompidos e normaliza espaços
    texto = texto.replace('\xa0', ' ')  # non-breaking space
    texto = ' '.join(texto.split())
    return texto.strip()

def celulas_linha(row):
    return [limpar(cell.text) for cell in row.cells]

# Encontra a maior tabela
tabela = max(doc.tables, key=lambda t: len(t.rows) * len(t.columns)) if doc.tables else None

if not tabela:
    print(json.dumps({'erro': 'Nenhuma tabela encontrada'}))
    sys.exit(1)

# Lê todas as linhas
linhas = [celulas_linha(row) for row in tabela.rows]

# Debug: mostra estrutura
import sys as _sys
for i, linha in enumerate(linhas):
    print(f"Linha {i}: {linha[:3]}", file=_sys.stderr)

num_cols = len(linhas[0]) if linhas else 0

# Detecta linha de cabeçalho (contém "Data" ou "Segunda" etc)
header_row = 0
dias_row   = 1
for i, linha in enumerate(linhas):
    l0 = linha[0].lower()
    if 'data' in l0 or 'segunda' in ' '.join(linha).lower():
        header_row = i
        dias_row   = i + 1 if 'data' in l0 else i
        break

# Monta lista de dias com índice de coluna
dias = []
for col in range(1, num_cols):
    data_val = linhas[header_row][col] if header_row < len(linhas) and col < len(linhas[header_row]) else ''
    dia_val  = linhas[dias_row][col]   if dias_row  < len(linhas) and col < len(linhas[dias_row])   else ''
    if data_val or dia_val:
        dias.append({'col': col, 'data': data_val, 'dia': dia_val})

# Categorias e seus dados por coluna
def get_val(row_idx, col):
    if row_idx < len(linhas) and col < len(linhas[row_idx]):
        return linhas[row_idx][col]
    return ''

# Varre as linhas e classifica por categoria
# A categoria é definida pela coluna 0 da linha atual OU da última linha com label
categorias_por_linha = {}
ultima_cat = None

for i, linha in enumerate(linhas):
    label = linha[0].lower() if linha else ''
    if any(x in label for x in ['tipo de arroz', 'arroz']):
        ultima_cat = 'arroz'
    elif any(x in label for x in ['tipo de feij', 'feij']):
        ultima_cat = 'feijao'
    elif 'carne' in label and 'grill' not in label:
        ultima_cat = 'carnes'
    elif 'guarni' in label:
        ultima_cat = 'guarnicoes'
    elif 'massa' in label:
        ultima_cat = 'massas'
    elif 'grill' in label:
        ultima_cat = 'grill'
    elif i <= max(header_row, dias_row):
        ultima_cat = None

    if ultima_cat and i > dias_row:
        categorias_por_linha[i] = ultima_cat

# Monta cardápio por dia
cardapios = []
for d in dias:
    col = d['col']
    crd = {
        'dia':        d['dia'],
        'data':       d['data'],
        'arroz':      [],
        'feijao':     [],
        'carnes':     [],
        'guarnicoes': [],
        'massas':     [],
        'grill':      ''
    }

    for row_idx, cat in categorias_por_linha.items():
        val = get_val(row_idx, col)
        if not val:
            continue

        # Divide por quebras de linha internas
        itens = [v.strip() for v in val.replace('\n', '|').split('|') if v.strip()]

        if cat == 'arroz':
            crd['arroz'].extend(itens)
        elif cat == 'feijao':
            crd['feijao'].extend(itens)
        elif cat == 'carnes':
            crd['carnes'].extend(itens)
        elif cat == 'guarnicoes':
            crd['guarnicoes'].extend(itens)
        elif cat == 'massas':
            crd['massas'].extend(itens)
        elif cat == 'grill':
            crd['grill'] = val if not crd['grill'] else crd['grill']

    cardapios.append(crd)

print(json.dumps(cardapios, ensure_ascii=False))
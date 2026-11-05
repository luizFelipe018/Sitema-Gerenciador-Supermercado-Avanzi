# -*- coding: utf-8 -*-
"""Leitor de cardápio semanal a partir de planilha .xlsx.
Mesma lógica de classificação do ler_cardapio_docx.py, usando openpyxl.
"""
import sys
import json
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import openpyxl

xlsx_path = sys.argv[1]


def limpar(valor):
    """Normaliza células: remove nbsp, espaços extras e quebras de linha."""
    if valor is None:
        return ''
    texto = str(valor)
    texto = texto.replace('\xa0', ' ')
    texto = texto.replace('\r\n', '\n').replace('\r', '\n')
    texto = ' '.join(texto.split())
    return texto.strip()


def celulas_linha(row):
    return [limpar(cell) for cell in row]


wb = openpyxl.load_workbook(xlsx_path, data_only=True)

# Escolhe a planilha com mais dados (a ativa ou a maior)
ws = wb.active
melhor = None
for folha in wb.worksheets:
    total = folha.max_row * max(folha.max_column, 1)
    if melhor is None or total > melhor[0]:
        melhor = (total, folha)
if melhor and melhor[1] is not ws:
    ws = melhor[1]

linhas = [celulas_linha(row) for row in ws.iter_rows(values_only=True)]

# Remove linhas totalmente vazias
linhas = [l for l in linhas if any(c for c in l)]

if not linhas:
    print(json.dumps({'erro': 'Planilha vazia'}, ensure_ascii=False))
    sys.exit(1)

# Debug: mostra estrutura
import sys as _sys
for i, linha in enumerate(linhas):
    print(f"Linha {i}: {linha[:3]}", file=_sys.stderr)

num_cols = max(len(l) for l in linhas)

# Detecta linha de cabeçalho (contém "Data" ou dia da semana)
header_row = 0
dias_row = 1
for i, linha in enumerate(linhas):
    l0 = linha[0].lower() if linha else ''
    if 'data' in l0 or 'segunda' in ' '.join(linha).lower():
        header_row = i
        dias_row = i + 1 if 'data' in l0 else i
        break

# Monta lista de dias com índice de coluna
dias = []
for col in range(1, num_cols):
    data_val = linhas[header_row][col] if header_row < len(linhas) and col < len(linhas[header_row]) else ''
    dia_val = linhas[dias_row][col] if dias_row < len(linhas) and col < len(linhas[dias_row]) else ''
    if data_val or dia_val:
        dias.append({'col': col, 'data': data_val, 'dia': dia_val})


def get_val(row_idx, col):
    if row_idx < len(linhas) and col < len(linhas[row_idx]):
        return linhas[row_idx][col]
    return ''


# Classifica as linhas por categoria
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
        'dia': d['dia'],
        'data': d['data'],
        'arroz': [],
        'feijao': [],
        'carnes': [],
        'guarnicoes': [],
        'massas': [],
        'grill': ''
    }

    for row_idx, cat in categorias_por_linha.items():
        val = get_val(row_idx, col)
        if not val:
            continue

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

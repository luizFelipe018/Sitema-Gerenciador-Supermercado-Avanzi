#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
# REMOVER FUNDO (IA) — processa uma imagem usando rembg (Python)
# Uso:
#   python tools/remover-fundo.py <entrada> <saida>
# Cada chamada usa o modelo leve 'u2netp' (~5 MB) — ~1s por foto em CPU.
# ═══════════════════════════════════════════════════════════════
import sys
import os
from pathlib import Path
try:
    from rembg import new_session, remove
    session = new_session('u2netp')
except Exception as e:
    print(f'ERRO ao carregar modelo IA: {e}', file=sys.stderr)
    sys.exit(2)

def main():
    if len(sys.argv) != 3:
        print('Uso: python remover-fundo.py <entrada> <saida>', file=sys.stderr)
        sys.exit(1)
    src = sys.argv[1]
    dst = sys.argv[2]
    try:
        with open(src, 'rb') as f:
            dados = f.read()
    except OSError as e:
        print(f'ERRO ao ler {src}: {e}', file=sys.stderr)
        sys.exit(3)

    try:
        saida = remove(dados, session=session, post_process_mask=True)
    except Exception as e:
        print(f'ERRO ao processar {src}: {e}', file=sys.stderr)
        sys.exit(4)

    try:
        Path(dst).parent.mkdir(parents=True, exist_ok=True)
        with open(dst, 'wb') as f:
            f.write(saida)
    except OSError as e:
        print(f'ERRO ao escrever {dst}: {e}', file=sys.stderr)
        sys.exit(5)

if __name__ == '__main__':
    main()

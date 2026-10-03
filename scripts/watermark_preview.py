#!/usr/bin/env python3
"""
Aplica watermark do logo SIAC STUDIO em todas as preview.png e preview2.png
do diretório public/interclasses/
"""

from PIL import Image
from pathlib import Path
import sys

# Configuração
BASE_DIR = Path("public/interclasses")
LOGO_PATH = Path("public/logo.png")
OPACITY = 0.18  # Transparência do watermark (0.0 = invisível, 1.0 = opaco)
SCALE = 0.18    # Tamanho relativo da imagem (18% da largura da preview)
POSITION = "center"  # center, top-left, top-right, bottom-left, bottom-right

def aplicar_watermark(caminho_imagem: Path, caminho_logo: Path):
    """Aplica watermark da logo sobre a imagem."""
    img = Image.open(caminho_imagem).convert("RGBA")
    logo = Image.open(caminho_logo).convert("RGBA")

    # Redimensionar logo
    w, h = img.size
    novo_largura = int(w * SCALE)
    proporcao = logo.height / logo.width
    novo_altura = int(novo_largura * proporcao)
    logo = logo.resize((novo_largura, novo_altura), Image.LANCZOS)

    # Ajustar transparência do logo
    logo = logo.copy()
    r, g, b, a = logo.split()
    a = a.point(lambda x: int(x * OPACITY))
    logo = Image.merge("RGBA", (r, g, b, a))

    # Posicionar
    if POSITION == "center":
        x = (w - logo.width) // 2
        y = (h - logo.height) // 2
    elif POSITION == "top-left":
        x, y = 20, 20
    elif POSITION == "top-right":
        x, y = w - logo.width - 20, 20
    elif POSITION == "bottom-left":
        x, y = 20, h - logo.height - 20
    elif POSITION == "bottom-right":
        x, y = w - logo.width - 20, h - logo.height - 20
    else:
        x, y = (w - logo.width) // 2, (h - logo.height) // 2

    # Colar watermark
    img.paste(logo, (x, y), logo)

    # Salvar (manter formato original)
    img.convert("RGB").save(caminho_imagem, quality=95)
    print(f"  ✓ {caminho_imagem.relative_to(BASE_DIR.parent)}")

def main():
    print(f"Aplicando watermark em {BASE_DIR}/")
    print(f"Logo: {LOGO_PATH} | Opacidade: {OPACITY} | Escala: {SCALE*100:.0f}% | Posição: {POSITION}")
    print("-" * 60)

    arquivos = []
    for nome in ["preview.png", "preview2.png"]:
        for caminho in BASE_DIR.rglob(nome):
            arquivos.append(caminho)

    if not arquivos:
        print("Nenhum arquivo encontrado.")
        return

    print(f"Total de imagens: {len(arquivos)}")
    print()

    for caminho in sorted(arquivos):
        try:
            aplicar_watermark(caminho, LOGO_PATH)
        except Exception as e:
            print(f"  ✗ ERRO: {caminho} — {e}")

    print("-" * 60)
    print(f"Pronto: {len(arquivos)} imagens processadas.")

if __name__ == "__main__":
    main()

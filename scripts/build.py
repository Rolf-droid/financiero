#!/usr/bin/env python3
"""Ensambla index.html desde componentes HTML parciales."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PARTIALS = [
    "components/toast.html",
    "components/modals/forgot.html",
    "components/modals/register.html",
    "components/login.html",
    "components/sidebar.html",
    "components/topbar.html",
    "pages/datos.html",
    "pages/resultados.html",
    "pages/flujo.html",
    "pages/balance.html",
    "pages/dashboard.html",
    "pages/ajustes.html",
    "components/modals/app-modals.html",
]

JS_FILES = [
    "assets/js/utils.js",
    "assets/js/toast.js",
    "assets/js/charts.js",
    "assets/js/auth.js",
    "assets/js/pdf.js",
    "assets/js/nav.js",
    "assets/js/calculations.js",
    "assets/js/reports-resultados.js",
    "assets/js/reports-flujo.js",
    "assets/js/reports-balance.js",
    "assets/js/reports-dashboard.js",
    "assets/js/main.js",
]

HEAD = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sistema Financiero | Comercial Andina S.A.C.</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<link rel="stylesheet" href="assets/css/main.css">
</head>
<body>
"""

CONTENT_CLOSE = """
  </div><!-- /content -->
</div><!-- /main -->
</div><!-- /layout -->
"""

SCRIPTS = "\n".join(
    f'<script src="{path}"></script>' for path in JS_FILES
)

FOOTER = f"""
{SCRIPTS}
</body>
</html>
"""


def read_partial(rel_path: str) -> str:
    path = ROOT / rel_path
    return path.read_text(encoding="utf-8")


def build() -> str:
    body_parts = [read_partial(p) for p in PARTIALS]

    # sidebar + main structure
    sidebar = body_parts[4]
    topbar = body_parts[5]
    pages = "".join(body_parts[6:12])
    before_layout = "".join(body_parts[0:4])
    modals = body_parts[12]

    return (
        HEAD
        + before_layout
        + sidebar
        + topbar
        + pages
        + CONTENT_CLOSE
        + modals
        + FOOTER
    )


def main():
    out = ROOT / "index.html"
    out.write_text(build(), encoding="utf-8")
    print(f"Generado: {out}")


if __name__ == "__main__":
    main()

# Sistema Financiero — Comercial Andina S.A.C.

Aplicación web de reportes financieros (ejercicio 2024, soles).

## Estructura del proyecto

```
Gilberto/
├── index.html                    # Punto de entrada (generado o manual)
├── Sistema_Financiero_Andina.html  # Versión monolítica original (respaldo)
├── assets/
│   ├── css/
│   │   └── main.css              # Estilos
│   └── js/
│       ├── utils.js              # Formato, colores, helpers
│       ├── toast.js              # Notificaciones
│       ├── charts.js             # Instancias Chart.js
│       ├── auth.js               # Login, registro, ajustes
│       ├── pdf.js                # Exportar dashboard a PDF
│       ├── nav.js                # Navegación entre páginas
│       ├── calculations.js       # getData(), calcularTodo()
│       ├── reports-resultados.js
│       ├── reports-flujo.js
│       ├── reports-balance.js
│       ├── reports-dashboard.js
│       └── main.js               # Inicialización
├── components/
│   ├── toast.html
│   ├── login.html
│   ├── sidebar.html
│   ├── topbar.html
│   └── modals/                   # Modales de login y ajustes
├── pages/                        # Vistas del sistema
│   ├── datos.html
│   ├── resultados.html
│   ├── flujo.html
│   ├── balance.html
│   ├── dashboard.html
│   └── ajustes.html
└── scripts/
    └── build.py                  # Ensambla index.html desde partials
```



## Cómo usar

1. Abre **`index.html`** en un navegador moderno (Chrome, Firefox, Edge, Safari), o la URL de GitHub Pages arriba.
2. Credenciales de demostración: usuario **`Admin`**, contraseña **`andina2024`**.

Si editas archivos en `components/` o `pages/`, regenera el HTML principal:

```bash
python3 scripts/build.py
```

## Notas

- Requiere conexión a internet para CDNs (Chart.js, jsPDF, Google Fonts).
- Los datos financieros no se guardan al recargar; solo usuarios y contraseña de admin en `localStorage`.

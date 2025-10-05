# 🚀 SpaceApps Computronic

Este proyecto fue desarrollado para el **NASA Space Apps Challenge**.  
El objetivo es crear un **dashboard interactivo impulsado por IA** que permita explorar, resumir y visualizar publicaciones científicas relacionadas con experimentos biológicos en el espacio.

---

## 🧩 Estructura del Proyecto
``` bash
SPACEAPPS_COMPUTRONIC/
├── .venv/ # Entorno virtual de Python
├── node_modules/ # Dependencias de Node.js
├── tu-proyecto/
│ └── backend/
│ ├── pycache/ # Caché de Python
│ ├── .venv/ # Entorno virtual (backend)
│ ├── data/
│ │ └── SB_publication_PMC.csv # Fuente de datos (publicaciones NASA/PMC)
│ ├── .env # Variables de entorno (API keys, configuraciones)
│ ├── requirements.txt # Dependencias del backend (FastAPI, OpenAI, etc.)
│ ├── server.py # Servidor principal (FastAPI)
│ └── summary.py # Módulo para generar resúmenes con IA
├── src/
│ ├── api/ # Lógica de comunicación con el backend
│ ├── components/ # Componentes principales del frontend
│ │ ├── ArticlePage.tsx
│ │ ├── SummaryPage.tsx
│ │ ├── WelcomePageES.tsx
│ │ ├── WelcomePageFormal.tsx
│ │ └── WelcomeScreen.tsx
│ ├── App.tsx # Componente raíz de React
│ ├── index.css # Estilos globales
│ └── main.tsx # Punto de entrada del frontend
├── eslint.config.js # Configuración de ESLint
├── index.html # Archivo HTML principal
├── package.json # Dependencias de Node.js
├── pnpm-lock.yaml # Bloqueo de versiones de PNPM
├── postcss.config.js # Configuración de PostCSS
├── tailwind.config.js # Configuración de TailwindCSS
├── tsconfig.*.json # Configuraciones de TypeScript
├── vite.config.ts # Configuración del entorno Vite
└── README.md # Documentación del proyecto
``` 
---

## ⚙️ Instalación y Configuración

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/spaceapps_computronic.git
cd spaceapps_computronic
```
### 2️⃣ Configurar el entorno virtual (Backend)

```bash
cd tu-proyecto/backend
python -m venv .venv
```

En Windows (CMD):
``` bash
.venv\Scripts\Activate.ps1

```

En Linux / Mac:
``` bash
.venv\Scripts\activate.bat
```


### 3️⃣ Instalar dependencias del backend
``` bash
pip install -r requirements.txt
```

### 4️⃣ Configurar variables de entorno

Crea un archivo llamado .env dentro de la carpeta backend/ con el siguiente contenido:

``` bash
API_KEY=tu_api_key_de_openai
``` 
⚠️ **IMPORTANTE**: reemplaza tu_api_key_de_openai con tu clave real de OpenAI o de OpenRouter si usas ese servicio.

### 5️⃣ Ejecutar el backend (FastAPI)
``` bash
uvicorn server:app --reload --port 8000
```

El backend se ejecutará en:
👉 http://127.0.0.1:8000

### 6️⃣ Instalar dependencias del frontend
Desde la raíz del proyecto:
``` bash
npm install
```

### 7️⃣ Ejecutar la aplicación (Frontend)
``` bash
npm run dev
``` 
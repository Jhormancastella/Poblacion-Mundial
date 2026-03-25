# 🌍 Población Vida y Muerte en el Mundo

Visualización interactiva 3D en tiempo real de la población mundial con arquitectura modular, PWA support e integración con Google Sheets.

**URL**: https://jhormancastella.github.io/Poblacion-Mundial/

---

![Demo](https://img.shields.io/badge/Status-Refactored-success)
![PWA](https://img.shields.io/badge/PWA-Ready-blue)
![ES6](https://img.shields.io/badge/ES6-Modules-yellow)
![Accessibility](https://img.shields.io/badge/A11y-Enhanced-green)

## ✨ Nuevas Características v2.0

### 🏗️ Arquitectura Modular
- **ES6 Modules**: Código organizado en módulos independientes
- **Store Pattern**: Gestión centralizada de estado reactivo
- **Separación de responsabilidades**: Config, utils, renderer, stats, events

### 📱 Progressive Web App (PWA)
- **Service Worker**: Funciona offline
- **Manifest**: Instalable en dispositivos móviles
- **Caché inteligente**: Assets precargados para performance

### 📊 Google Sheets API
- **Datos dinámicos**: Actualiza estadísticas desde hojas de cálculo
- **Auto-refresh**: Sincronización automática cada 5 minutos
- **Persistencia**: Credenciales almacenadas en localStorage

### ♿ Accesibilidad Mejorada
- **ARIA labels**: Navegación con lectores de pantalla
- **Keyboard shortcuts**: Espacio (rotar), C (colores), A (atmósfera), R (reset)
- **Semantic HTML**: Estructura semántica correcta
- **Focus management**: Estados de foco visibles

## 📁 Nueva Estructura de Proyecto

```
poblacion-mundial/
│
├── index.html              # HTML semántico con accesibilidad
├── app.js                  # Entry point - orquestador principal
├── sw.js                   # Service Worker para PWA
├── manifest.json           # Configuración PWA
├── README.md               # Documentación
│
├── css/
│   └── styles.css          # CSS modular con variables y design tokens
│
├── js/
│   ├── config.js           # Constantes y configuración centralizada
│   ├── store.js            # Gestión de estado (Store pattern)
│   ├── utils.js            # Helpers y utilidades
│   ├── particles.js        # Sistema de partículas 3D
│   ├── renderer.js         # Renderizado Canvas optimizado
│   ├── stats.js            # Cálculo y actualización de estadísticas
│   ├── events.js           # Manejadores de eventos (mouse, touch, keyboard)
│   └── sheets.js           # Integración Google Sheets API
│
└── assets/                 # Recursos estáticos (vacío por ahora)
```

## 🚀 Cómo Usar

### Instalación Local
```bash
git clone https://github.com/jhormancastella/Poblacion-Mundial.git
cd Poblacion-Mundial
# Servir con cualquier servidor estático
npx serve .
# o
python -m http.server 8000
```

### Configurar Google Sheets
1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar Google Sheets API
3. Crear API Key
4. Crear hoja de cálculo con datos:
   | Población Asia | Tasa Natalidad | Tasa Mortalidad | Crecimiento |
   |----------------|----------------|-----------------|-------------|
   | 4,743M         | 17.5‰          | 7.7‰            | +1.05%      |
5. Compartir spreadsheet y obtener ID
6. En consola del navegador:
```javascript
populationApp.setGoogleSheetsCredentials('TU_API_KEY', 'TU_SPREADSHEET_ID');
```

### Atajos de Teclado
| Tecla | Acción |
|-------|--------|
| Espacio | Activar/desactivar rotación |
| C | Alternar colores |
| A | Mostrar/ocultar atmósfera |
| R | Reiniciar vista |
| 1 | Modo puntos |
| 2 | Modo esfera |

## 🏛️ Patrones de Arquitectura

### Store Pattern (Gestión de Estado)
```javascript
// js/store.js
store.setState({ rotation: { x: 0, y: 0.5 } });
store.subscribe('rotation', (newVal, oldVal) => {
    renderer.render();
});
store.toggle('autoRotate');
```

### Módulos ES6
```javascript
// app.js
import { CONFIG } from './js/config.js';
import { store } from './js/store.js';
import { renderer } from './js/renderer.js';
import { statsManager } from './js/stats.js';
import { eventManager } from './js/events.js';
```

### Configuración Centralizada
```javascript
// js/config.js
export const CONFIG = {
    particles: { count: 3000, baseSize: 1.2 },
    animation: { autoRotateSpeed: 0.003 },
    population: { birthsPerMinute: 267, deathsPerMinute: 107 }
};
```

## 🎨 Sistema de Diseño

### Variables CSS (Design Tokens)
```css
:root {
    --primary-color: #4a7fff;
    --secondary-color: #4ade80;
    --danger-color: #f87171;
    
    --spacing-xs: 0.5rem;
    --spacing-sm: 0.75rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.25rem;
    
    --border-radius-sm: 10px;
    --border-radius-md: 15px;
    --border-radius-lg: 20px;
    
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
}
```

## 📊 Datos Demográficos

| Estadística | Valor | Fuente |
|-------------|-------|--------|
| Población mundial | ~8,045M | Cálculo en tiempo real |
| Nacimientos/min | ~267 | ONU/Worldometer |
| Muertes/min | ~107 | ONU/Worldometer |
| Crecimiento neto | +160/min | Cálculo propio |
| Natalidad | 17.5‰ | Banco Mundial |
| Mortalidad | 7.7‰ | Banco Mundial |

## 🔧 Optimizaciones de Performance

- **RequestAnimationFrame**: Throttling a 60fps
- **Dirty rectangles**: Solo redibuja cuando hay cambios
- **Depth sorting**: Ordenamiento por profundidad eficiente
- **Canvas pooling**: Contexto 2D reutilizado
- **Service Worker**: Caché de assets para carga instantánea offline

## 🌐 Compatibilidad

| Navegador | Versión | Soporte |
|-----------|---------|---------|
| Chrome | 80+ | ✅ Completo |
| Firefox | 75+ | ✅ Completo |
| Safari | 13+ | ✅ Completo |
| Edge | 80+ | ✅ Completo |
| Opera | 67+ | ✅ Completo |

## 📝 Changelog

### v2.0 - Refactorización Mayor
- ✅ Arquitectura modular con ES6
- ✅ Store pattern para estado
- ✅ PWA con Service Worker
- ✅ Google Sheets API
- ✅ Mejoras de accesibilidad (ARIA)
- ✅ Atajos de teclado
- ✅ CSS con design tokens
- ✅ Touch events para móvil

### v1.0 - Lanzamiento Inicial
- Visualización 3D Canvas
- Estadísticas en tiempo real
- Dos modos de visualización
- Controles básicos

## 📄 Licencia

© 2024 Jhorman Castellanos. Todos los derechos reservados.

---

**Autor**: Jhorman Castellanos  
**Rol**: Desarrollador Frontend & Visualización de Datos

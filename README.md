
# 🌍 Población Vida y Muerte en el Mundo

Visualización interactiva en tiempo real de la población mundial con estadísticas demográficas y representación 3D.

![Demo](https://img.shields.io/badge/Status-Activo-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 📊 Descripción

Proyecto web que muestra la población mundial en tiempo real mediante dos modos de visualización:
- **Mundo Puntos**: 3000 puntos distribuidos en esfera representando la población
- **Gran Esfera**: Representación estilizada de la Tierra con continentes

## 🚀 Características

### 🌐 Visualización 3D Interactiva
- Rotación automática y control manual (arrastrar)
- Dos modos de visualización intercambiables
- Efectos de profundidad y iluminación realistas

### 📈 Estadísticas en Tiempo Real
- Población mundial actualizada
- Nacimientos y muertes por minuto
- Tasa de crecimiento neto
- Datos demográficos por continente

### 🎨 Personalización
- Alternar entre modo color y monocromático
- Activar/desactivar atmósfera
- Controles de rotación y vista

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos responsive y variables CSS
- **JavaScript** - Lógica interactiva y Canvas API
- **Canvas 2D** - Renderizado gráfico 3D

## 📁 Estructura del Proyecto

```

poblacion-mundo/
│
├──index.html          # Archivo principal (todo-en-uno)
├──README.md           # Documentación
└──assets/             # Recursos (si los hay)

```

## ⚙️ Instalación y Uso

1. **Clonar o descargar** el proyecto
```bash
git clone 
```

1. Abrir el archivo index.html en un navegador web

```bash
open index.html
# o
xdg-open index.html
```

1. Interactuar con la visualización

· Click en botones de modo
· Arrastrar para rotar vista 3D
· Usar controles para personalizar

🎮 Controles

Botón Función
Mundo Puntos Cambia a visualización por puntos
Gran Esfera Cambia a visualización de esfera terrestre
Rotar Activa/desactiva rotación automática
Colores Alterna entre color y blanco/negro
Atmósfera Muestra/oculta capa atmosférica
Reiniciar Restablece vista inicial

📊 Datos Demográficos

Estadísticas Principales

· Población actual: 8,045+ millones
· Nacimientos/minuto: ≈267
· Muertes/minuto: ≈107
· Crecimiento neto: +160/minuto

Tasas Demográficas

· Natalidad: 17.5‰
· Mortalidad: 7.7‰
· Crecimiento anual: +1.05%

🔧 Configuración Técnica

Variables CSS Personalizadas

```css
:root {
    --primary-color: #4a7fff;
    --secondary-color: #4ade80;
    --danger-color: #f87171;
    --bg-color: #0a0a0a;
    --text-color: #ffffff;
}
```

Parámetros de Simulación

```javascript
const birthsPerMinute = 267;
const deathsPerMinute = 107;
const numPoints = 3000;  // Puntos en modo esfera
```

📱 Responsive Design

El diseño se adapta a:

· Escritorio: Vista completa con todos los elementos
· Tablet: Reorganización optimizada
· Móvil: Interfaz touch-friendly

🎯 Funcionalidades Avanzadas

Algoritmo de Distribución Esférica

```javascript
// Distribución uniforme de puntos en esfera
const phi = Math.acos(-1 + (2 * i) / numPoints);
const theta = Math.sqrt(numPoints * Math.PI) * phi;
```

Proyección 3D a 2D

```javascript
const scale = 300 / (300 + rotated.z);
const x = canvas.width / 2 + rotated.x * scale;
const y = canvas.height / 2 + rotated.y * scale;
```

Sistema de Partículas

· 3000 partículas representando distribución poblacional
· Ordenamiento por profundidad (Z-buffering)
· Efectos de brillo y transparencia

🌟 Características Únicas

Modo Puntos

· Representación abstracta de distribución poblacional
· Puntos coloreados por tipo (tierra/agua)
· Efectos de profundidad realistas

Modo Esfera

· Texturizado estilizado de continentes
· Efectos de nubes y atmósfera
· Iluminación dinámica

🔄 Actualizaciones en Tiempo Real

· Población actualizada cada segundo
· Estadísticas refrescadas cada 10 segundos
· Timestamp de última actualización

🐛 Solución de Problemas

Problemas Comunes

1. Canvas no visible: Verificar soporte de Canvas en navegador
2. Rotación no funciona: Click en botón "Rotar"
3. Estadísticas estáticas: Recargar página

Compatibilidad

· ✅ Chrome 90+
· ✅ Firefox 88+
· ✅ Safari 14+
· ✅ Edge 90+

📄 Licencia

© 2024 Jhorman Castellanos. Todos los derechos reservados.

👨‍💻 Autor

Jhorman Castellanos
Desarrollador Frontend y Visualización de Datos

---

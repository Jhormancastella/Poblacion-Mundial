import { CONFIG } from './config.js';
import { store } from './store.js';
import { particleSystem } from './particles.js';
import { project3D, rotatePoint } from './utils.js';

// URL de textura topográfica - NASA Blue Marble (dominio público) - versión 2048x1024
const EARTH_TEXTURE_URL = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74092/world.200407.3x2048x1024.jpg';
const EARTH_TEXTURE_SIZE = { width: 2048, height: 1024 };

class Renderer {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.container = document.getElementById('canvas-container');
        this.earthTexture = null;
        this.textureLoaded = false;
        
        this.setupCanvas();
        this.loadEarthTexture();
        this.bindEvents();
    }
    
    setupCanvas() {
        const { maxWidth } = CONFIG.canvas;
        const containerWidth = this.container.clientWidth;
        const size = Math.min(containerWidth, maxWidth);
        
        this.canvas.width = size;
        this.canvas.height = size;
        
        const radius = size * CONFIG.canvas.radiusFactor;
        
        store.setState({
            canvas: {
                width: size,
                height: size,
                radius
            }
        });
        
        particleSystem.generate();
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }
    
    loadEarthTexture() {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            this.earthTexture = img;
            this.textureLoaded = true;
            console.log('Textura NASA Blue Marble cargada:', img.width, 'x', img.height);
            // Forzar renderizado si estamos en modo esfera
            const { mode } = store.getState();
            if (mode === 'sphere') {
                this.render();
            }
        };
        
        img.onerror = () => {
            console.warn('No se pudo cargar textura NASA, intentando alternativa...');
            this.tryAlternativeTexture();
        };
        
        img.src = EARTH_TEXTURE_URL;
    }
    
    tryAlternativeTexture() {
        // Intentar con Wikipedia Commons como fallback
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            this.earthTexture = img;
            this.textureLoaded = true;
            console.log('Textura alternativa cargada');
            const { mode } = store.getState();
            if (mode === 'sphere') this.render();
        };
        
        img.onerror = () => {
            console.warn('Fallback también falló, usando modo esfera abstracta');
            this.textureLoaded = false;
        };
        
        img.src = 'https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg';
    }
    
    clear() {
        this.ctx.fillStyle = CONFIG.colors.default === '#ffffff' ? '#0a0a0a' : '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawPoints() {
        this.clear();
        
        const { rotation, canvas } = store.getState();
        const { focalLength } = CONFIG.canvas;
        
        const sortedParticles = particleSystem.getSortedParticles(rotation.x, rotation.y);
        
        sortedParticles.forEach(particle => {
            const projected = project3D(
                particle, 
                canvas.width, 
                canvas.height, 
                focalLength
            );
            
            const size = particle.size * projected.scale;
            
            this.ctx.beginPath();
            this.ctx.fillStyle = particle.color;
            this.ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (particle.z > 0) {
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.arc(projected.x, projected.y, size * 0.4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawSphere() {
        this.clear();
        
        const { canvas, rotation, useColors, showAtmosphere } = store.getState();
        const { width, height, radius } = canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        
        this.drawBaseGradient(centerX, centerY, radius, useColors);
        this.drawContinents(centerX, centerY, radius, rotation.x, rotation.y);
        
        if (useColors) {
            this.drawClouds(centerX, centerY, radius, rotation.x, rotation.y);
        }
        
        if (showAtmosphere) {
            this.drawAtmosphere(centerX, centerY, radius);
        }
        
        this.drawHighlight(centerX, centerY, radius);
        this.drawShadow(centerX, centerY, radius);
    }
    
    drawBaseGradient(cx, cy, r, useColors) {
        const gradient = this.ctx.createRadialGradient(
            cx - r * 0.3, cy - r * 0.3, 0,
            cx, cy, r
        );
        
        if (useColors) {
            gradient.addColorStop(0, 'rgba(64, 164, 223, 0.9)');
            gradient.addColorStop(0.4, 'rgba(41, 128, 185, 0.8)');
            gradient.addColorStop(0.8, 'rgba(21, 67, 96, 0.7)');
            gradient.addColorStop(1, 'rgba(9, 32, 63, 0.9)');
        } else {
            gradient.addColorStop(0, 'rgba(200, 230, 255, 0.9)');
            gradient.addColorStop(0.4, 'rgba(150, 200, 255, 0.8)');
            gradient.addColorStop(0.8, 'rgba(100, 150, 200, 0.7)');
            gradient.addColorStop(1, 'rgba(50, 100, 150, 0.9)');
        }
        
        this.ctx.beginPath();
        this.ctx.fillStyle = gradient;
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawContinents(cx, cy, r, rotX, rotY) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.clip();
        
        const offsetX = Math.sin(rotY) * r * 0.7;
        const offsetY = Math.cos(rotX) * r * 0.3;
        
        this.drawContinent(cx + offsetX, cy + offsetY, r * 0.6, r * 0.8, rotY);
        this.drawContinent(cx - offsetX, cy + offsetY * 0.5, r * 0.5, r * 0.9, -rotY);
        this.drawContinent(cx + offsetX * 0.5, cy - offsetY * 0.5, r * 0.7, r * 0.6, rotX);
        
        this.ctx.restore();
    }
    
    drawContinent(x, y, rx, ry, rotation) {
        const gradient = this.ctx.createRadialGradient(
            x - rx * 0.3, y - ry * 0.3, 0,
            x, y, Math.max(rx, ry)
        );
        
        gradient.addColorStop(0, 'rgba(34, 139, 34, 0.9)');
        gradient.addColorStop(0.5, 'rgba(85, 107, 47, 0.8)');
        gradient.addColorStop(1, 'rgba(139, 90, 43, 0.7)');
        
        this.ctx.beginPath();
        this.ctx.fillStyle = gradient;
        this.ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawClouds(cx, cy, r, rotX, rotY) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.clip();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        
        this.drawCloud(cx + Math.sin(rotY * 0.5) * r * 0.6, cy + Math.cos(rotX * 0.5) * r * 0.3, r * 0.2);
        this.drawCloud(cx - Math.sin(rotY * 0.7) * r * 0.5, cy - Math.cos(rotX * 0.7) * r * 0.4, r * 0.15);
        
        this.ctx.restore();
    }
    
    drawCloud(x, y, r) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawAtmosphere(cx, cy, r) {
        const gradient = this.ctx.createRadialGradient(
            cx, cy, r,
            cx, cy, r * 1.1
        );
        
        gradient.addColorStop(0, 'rgba(135, 206, 250, 0)');
        gradient.addColorStop(0.8, 'rgba(135, 206, 250, 0.1)');
        gradient.addColorStop(1, 'rgba(135, 206, 250, 0.3)');
        
        this.ctx.beginPath();
        this.ctx.fillStyle = gradient;
        this.ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawHighlight(cx, cy, r) {
        const gradient = this.ctx.createRadialGradient(
            cx - r * 0.3, cy - r * 0.3, 0,
            cx, cy, r * 0.7
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.fillStyle = gradient;
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawShadow(cx, cy, r) {
        const gradient = this.ctx.createRadialGradient(
            cx, cy, r * 0.8,
            cx, cy, r * 1.2
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        
        this.ctx.beginPath();
        this.ctx.fillStyle = gradient;
        this.ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawRealEarth() {
        this.clear();
        
        const { canvas, rotation, showAtmosphere } = store.getState();
        const { width, height, radius } = canvas;
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        
        if (!this.earthTexture) return;
        
        // Crear ImageData para el resultado
        const outputData = this.ctx.createImageData(width, height);
        const dst = outputData.data;
        
        // Obtener datos de la textura
        const texCanvas = document.createElement('canvas');
        const texCtx = texCanvas.getContext('2d');
        texCanvas.width = this.earthTexture.width;
        texCanvas.height = this.earthTexture.height;
        texCtx.drawImage(this.earthTexture, 0, 0);
        const texData = texCtx.getImageData(0, 0, texCanvas.width, texCanvas.height).data;
        
        const texWidth = texCanvas.width;
        const texHeight = texCanvas.height;
        
        // Precalcular rotación
        const cosRotY = Math.cos(rotation.y);
        const sinRotY = Math.sin(rotation.y);
        const cosRotX = Math.cos(rotation.x);
        const sinRotX = Math.sin(rotation.x);
        
        // Dirección de la luz (desde arriba-izquierda)
        const lightX = 0.3;
        const lightY = -0.3;
        const lightZ = 0.9;
        const lightLen = Math.sqrt(lightX * lightX + lightY * lightY + lightZ * lightZ);
        
        // Radio al cuadrado para optimización
        const rSq = radius * radius;
        
        // Para cada pixel en el canvas
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distSq = dx * dx + dy * dy;
                
                // Índice en el buffer de salida
                const dstIdx = (y * width + x) * 4;
                
                // Fondo negro por defecto
                dst[dstIdx] = 10;
                dst[dstIdx + 1] = 10;
                dst[dstIdx + 2] = 10;
                dst[dstIdx + 3] = 255;
                
                // Si está dentro de la esfera
                if (distSq <= rSq) {
                    // Coordenadas normalizadas en el círculo
                    const nx = dx / radius;
                    const ny = dy / radius;
                    
                    // Calcular Z en la superficie de la esfera unitaria
                    const nz = Math.sqrt(1 - nx * nx - ny * ny);
                    
                    // Aplicar rotación alrededor del eje Y (horizontal)
                    let rx = nx * cosRotY + nz * sinRotY;
                    let rz = -nx * sinRotY + nz * cosRotY;
                    let ry = ny;
                    
                    // Aplicar rotación alrededor del eje X (vertical/inclinación)
                    let tempY = ry * cosRotX - rz * sinRotX;
                    rz = ry * sinRotX + rz * cosRotX;
                    ry = tempY;
                    
                    // Calcular normal (es simplemente el vector desde el centro)
                    const normalLen = Math.sqrt(rx * rx + ry * ry + rz * rz);
                    const nx_norm = rx / normalLen;
                    const ny_norm = ry / normalLen;
                    const nz_norm = rz / normalLen;
                    
                    // Calcular intensidad de luz (producto punto con dirección de luz)
                    let intensity = (nx_norm * lightX + ny_norm * lightY + nz_norm * lightZ) / lightLen;
                    intensity = Math.max(0.3, Math.min(1.2, intensity + 0.5)); // Ambient + diffuse
                    
                    // Convertir a latitud/longitud para mapeo UV
                    // latitud = arcsin(y), longitud = atan2(x, z)
                    const latitude = Math.asin(Math.max(-1, Math.min(1, ry)));
                    let longitude = Math.atan2(rx, rz);
                    
                    // Mapear a coordenadas de textura
                    // U: longitude [-π, π] -> [0, 1]
                    // V: latitude [-π/2, π/2] -> [1, 0] (invertido porque Y crece hacia abajo)
                    let u = (longitude + Math.PI) / (2 * Math.PI);
                    let v = (Math.PI / 2 - latitude) / Math.PI;
                    
                    // Asegurar que u esté en [0, 1]
                    u = u - Math.floor(u);
                    
                    // Convertir a índices de pixel en textura
                    const texX = Math.floor(u * (texWidth - 1));
                    const texY = Math.floor(v * (texHeight - 1));
                    const texIdx = (texY * texWidth + texX) * 4;
                    
                    // Samplear color de textura con iluminación
                    dst[dstIdx] = Math.floor(texData[texIdx] * intensity);
                    dst[dstIdx + 1] = Math.floor(texData[texIdx + 1] * intensity);
                    dst[dstIdx + 2] = Math.floor(texData[texIdx + 2] * intensity);
                    dst[dstIdx + 3] = 255;
                }
            }
        }
        
        // Dibujar resultado
        this.ctx.putImageData(outputData, 0, 0);
        
        // Atmósfera si está activada
        if (showAtmosphere) {
            this.drawAtmosphere(centerX, centerY, radius);
        }
        
        // Sombra exterior
        this.drawShadow(centerX, centerY, radius);
    }
    
    render() {
        const { mode } = store.getState();
        
        if (mode === 'points') {
            this.drawPoints();
        } else {
            if (this.textureLoaded) {
                this.drawRealEarth();
            } else {
                this.drawSphere();
            }
        }
    }
}

export const renderer = new Renderer();

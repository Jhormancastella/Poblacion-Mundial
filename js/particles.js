import { CONFIG } from './config.js';
import { store } from './store.js';
import { generateHSL, rotatePoint } from './utils.js';

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.generate();
    }
    
    generate() {
        const { radius } = store.getState().canvas;
        const { count, landProbability, baseSize } = CONFIG.particles;
        const useColors = store.getState().useColors;
        
        this.particles = [];
        
        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            
            const x = radius * Math.cos(theta) * Math.sin(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(phi);
            
            const isLand = Math.random() > landProbability;
            const color = this.getParticleColor(isLand, useColors);
            
            this.particles.push({
                x, y, z,
                color,
                size: baseSize,
                isLand
            });
        }
        
        store.setState({ particles: this.particles });
    }
    
    getParticleColor(isLand, useColors) {
        if (!useColors) return CONFIG.colors.default;
        
        const { landHue, waterHue } = CONFIG.colors;
        
        if (isLand) {
            return generateHSL(landHue.min, landHue.max, 70, 60);
        }
        return generateHSL(waterHue.min, waterHue.max, 70, 50);
    }
    
    updateColors() {
        const useColors = store.getState().useColors;
        
        this.particles = this.particles.map(p => ({
            ...p,
            color: this.getParticleColor(p.isLand, useColors)
        }));
        
        store.setState({ particles: this.particles });
    }
    
    getSortedParticles(rotationX, rotationY) {
        return this.particles
            .map(p => {
                const rotated = rotatePoint(p, rotationX, rotationY);
                return { ...p, ...rotated, depth: rotated.z };
            })
            .sort((a, b) => a.depth - b.depth);
    }
}

export const particleSystem = new ParticleSystem();

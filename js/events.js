import { store } from './store.js';
import { CONFIG } from './config.js';
import { particleSystem } from './particles.js';

class EventManager {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        
        this.bindCanvasEvents();
        this.bindControlEvents();
        this.bindModeEvents();
        this.bindKeyboardEvents();
    }
    
    bindCanvasEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const deltaX = e.clientX - this.lastX;
            const deltaY = e.clientY - this.lastY;
            
            const { rotation } = store.getState();
            
            store.setState({
                rotation: {
                    x: rotation.x + deltaY * 0.01,
                    y: rotation.y + deltaX * 0.01
                }
            });
            
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDragging = true;
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isDragging) return;
            
            const deltaX = e.touches[0].clientX - this.lastX;
            const deltaY = e.touches[0].clientY - this.lastY;
            
            const { rotation } = store.getState();
            
            store.setState({
                rotation: {
                    x: rotation.x + deltaY * 0.01,
                    y: rotation.y + deltaX * 0.01
                }
            });
            
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }
    
    bindControlEvents() {
        const toggleBtn = (id, stateKey) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            
            btn.addEventListener('click', () => {
                store.toggle(stateKey);
                btn.classList.toggle('active');
            });
        };
        
        toggleBtn('toggle-rotation', 'autoRotate');
        
        const colorsBtn = document.getElementById('toggle-colors');
        if (colorsBtn) {
            colorsBtn.addEventListener('click', () => {
                store.toggle('useColors');
                colorsBtn.classList.toggle('active');
                particleSystem.updateColors();
            });
        }
        
        toggleBtn('toggle-atmosphere', 'showAtmosphere');
        
        const resetBtn = document.getElementById('reset-view');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                store.setState({ rotation: { x: 0, y: 0 } });
            });
        }
    }
    
    bindModeEvents() {
        const pointsBtn = document.getElementById('mode-points');
        const sphereBtn = document.getElementById('mode-sphere');
        
        const setActiveMode = (activeBtn) => {
            [pointsBtn, sphereBtn].forEach(btn => {
                btn?.classList.remove('active');
                btn?.setAttribute('aria-selected', 'false');
                btn?.setAttribute('tabindex', '-1');
            });
            activeBtn?.classList.add('active');
            activeBtn?.setAttribute('aria-selected', 'true');
            activeBtn?.setAttribute('tabindex', '0');
        };
        
        if (pointsBtn) {
            pointsBtn.addEventListener('click', () => {
                store.setState({ mode: 'points' });
                setActiveMode(pointsBtn);
            });
        }
        
        if (sphereBtn) {
            sphereBtn.addEventListener('click', () => {
                store.setState({ mode: 'sphere' });
                setActiveMode(sphereBtn);
            });
        }
    }
    
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    store.toggle('autoRotate');
                    document.getElementById('toggle-rotation')?.classList.toggle('active');
                    break;
                case 'c':
                case 'C':
                    store.toggle('useColors');
                    particleSystem.updateColors();
                    document.getElementById('toggle-colors')?.classList.toggle('active');
                    break;
                case 'a':
                case 'A':
                    store.toggle('showAtmosphere');
                    document.getElementById('toggle-atmosphere')?.classList.toggle('active');
                    break;
                case 'r':
                case 'R':
                    store.setState({ rotation: { x: 0, y: 0 } });
                    break;
                case '1':
                    store.setState({ mode: 'points' });
                    document.getElementById('mode-points')?.classList.add('active');
                    document.getElementById('mode-sphere')?.classList.remove('active');
                    break;
                case '2':
                    store.setState({ mode: 'sphere' });
                    document.getElementById('mode-sphere')?.classList.add('active');
                    document.getElementById('mode-points')?.classList.remove('active');
                    break;
            }
        });
    }
}

export const eventManager = new EventManager();

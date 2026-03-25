import { CONFIG } from './js/config.js';
import { store } from './js/store.js';
import { renderer } from './js/renderer.js';
import { statsManager } from './js/stats.js';
import { eventManager } from './js/events.js';
import { particleSystem } from './js/particles.js';
import { sheetsAPI } from './js/sheets.js';
import { populationAPI } from './js/api.js';
import { rankingsManager } from './js/rankings.js';

class PopulationApp {
    constructor() {
        this.lastFrameTime = 0;
        this.frameInterval = CONFIG.animation.frameThrottle;
        
        this.init();
    }
    
    init() {
        this.registerServiceWorker();
        this.bindStateListeners();
        this.startAnimationLoop();
        this.initRealTimeAPI();
        this.initGoogleSheets();
    }
    
    initRealTimeAPI() {
        // Initialize real-time population API
        populationAPI.init();
        
        // Initialize rankings UI
        rankingsManager.init();
        
        // Listen for real data updates
        store.subscribe('stats', (stats) => {
            if (stats.source) {
                console.log(`Datos actualizados desde: ${stats.source}`);
            }
        });
    }
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registrado:', registration.scope);
                })
                .catch((error) => {
                    console.error('Error al registrar Service Worker:', error);
                });
        }
    }
    
    bindStateListeners() {
        store.subscribe('autoRotate', (autoRotate) => {
            const btn = document.getElementById('toggle-rotation');
            if (btn) {
                btn.classList.toggle('active', autoRotate);
            }
        });
        
        store.subscribe('mode', () => {
            renderer.render();
        });
    }
    
    startAnimationLoop() {
        const loop = (currentTime) => {
            const deltaTime = currentTime - this.lastFrameTime;
            
            if (deltaTime >= this.frameInterval) {
                this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);
                
                this.update();
                renderer.render();
            }
            
            requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
    }
    
    update() {
        const { autoRotate } = store.getState();
        
        if (autoRotate) {
            const { rotation } = store.getState();
            store.setState({
                rotation: {
                    ...rotation,
                    y: rotation.y + CONFIG.animation.autoRotateSpeed
                }
            });
        }
        
        statsManager.update();
    }
    
    initGoogleSheets() {
        const apiKey = localStorage.getItem('sheets_api_key');
        const spreadsheetId = localStorage.getItem('sheets_spreadsheet_id');
        
        if (apiKey && spreadsheetId) {
            sheetsAPI.setCredentials(apiKey, spreadsheetId);
            sheetsAPI.startAutoRefresh(5);
        }
    }
    
    setGoogleSheetsCredentials(apiKey, spreadsheetId) {
        localStorage.setItem('sheets_api_key', apiKey);
        localStorage.setItem('sheets_spreadsheet_id', spreadsheetId);
        
        sheetsAPI.setCredentials(apiKey, spreadsheetId);
        sheetsAPI.startAutoRefresh(5);
    }
}

const app = new PopulationApp();

window.PopulationApp = PopulationApp;
window.populationApp = app;

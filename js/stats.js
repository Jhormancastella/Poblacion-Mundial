import { store } from './store.js';
import { CONFIG } from './config.js';
import { formatNumber } from './utils.js';

class StatsManager {
    constructor() {
        this.elements = {
            population: document.getElementById('population'),
            births: document.getElementById('births'),
            deaths: document.getElementById('deaths'),
            netChange: document.getElementById('net-change'),
            lastUpdate: document.getElementById('last-update'),
            asia: document.getElementById('asia'),
            birthRate: document.getElementById('birth-rate'),
            deathRate: document.getElementById('death-rate'),
            growthRate: document.getElementById('growth-rate')
        };
        
        this.startTime = Date.now();
        this.lastSecond = 0;
        this.lastUIUpdate = 0;
        
        this.birthsPerSecond = CONFIG.population.birthsPerMinute / 60;
        this.deathsPerSecond = CONFIG.population.deathsPerMinute / 60;
        
        this.update = this.update.bind(this);
    }
    
    update() {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - this.startTime) / 1000);
        
        if (elapsedSeconds > this.lastSecond) {
            this.lastSecond = elapsedSeconds;
            this.calculateStats();
            
            if (now - this.lastUIUpdate >= CONFIG.population.uiUpdateInterval) {
                this.lastUIUpdate = now;
                this.updateUI();
            }
        }
    }
    
    calculateStats() {
        const state = store.getState();
        const { population, stats } = state;
        
        // If we have real API data, use those rates
        const birthsPerSecond = stats.birthsPerSecond || this.birthsPerSecond;
        const deathsPerSecond = stats.deathsPerSecond || this.deathsPerSecond;
        
        const newBirths = Math.floor(Math.random() * birthsPerSecond * 2);
        const newDeaths = Math.floor(Math.random() * deathsPerSecond * 2);
        
        const newPopulation = {
            current: stats.source && stats.source !== 'estimado' 
                ? stats.population 
                : population.current + (birthsPerSecond - deathsPerSecond),
            birthsThisMinute: population.birthsThisMinute + newBirths,
            deathsThisMinute: population.deathsThisMinute + newDeaths,
            lastUpdate: Date.now()
        };
        
        store.setState({ population: newPopulation });
    }
    
    updateUI() {
        const { population, stats } = store.getState();
        const netChange = population.birthsThisMinute - population.deathsThisMinute;
        
        // Use real API population if available, otherwise use calculated
        const displayPopulation = stats.population || population.current;
        
        this.updateElement('population', formatNumber(Math.floor(displayPopulation)));
        this.updateElement('births', population.birthsThisMinute);
        this.updateElement('deaths', population.deathsThisMinute);
        this.updateElement('netChange', `${netChange >= 0 ? '+' : ''}${netChange}`);
        
        // Show data source indicator
        const sourceText = stats.source && stats.source !== 'estimado' 
            ? `Datos en tiempo real: ${stats.source}` 
            : `Estimaciones locales`;
        this.updateElement('lastUpdate', `${sourceText} • ${new Date().toLocaleTimeString('es-ES')}`);
    }
    
    updateElement(key, value) {
        if (this.elements[key]) {
            this.elements[key].textContent = value;
        }
    }
    
    updateFromSheet(data) {
        if (!data) return;
        
        const [asia, birthRate, deathRate, growthRate] = data;
        
        if (asia) this.updateElement('asia', asia);
        if (birthRate) this.updateElement('birthRate', birthRate);
        if (deathRate) this.updateElement('deathRate', deathRate);
        if (growthRate) this.updateElement('growthRate', growthRate);
    }
}

export const statsManager = new StatsManager();

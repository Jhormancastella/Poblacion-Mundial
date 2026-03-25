import { CONFIG } from './config.js';

class Store {
    constructor() {
        this.state = {
            rotation: { x: 0, y: 0 },
            autoRotate: true,
            useColors: false,
            showAtmosphere: false,
            mode: 'points',
            mouse: { down: false, x: 0, y: 0 },
            population: {
                current: CONFIG.population.initial,
                birthsThisMinute: 0,
                deathsThisMinute: 0,
                lastUpdate: Date.now()
            },
            stats: {
                population: CONFIG.population.initial,
                birthsPerSecond: CONFIG.population.birthsPerMinute / 60,
                deathsPerSecond: CONFIG.population.deathsPerMinute / 60,
                birthsToday: 0,
                deathsToday: 0,
                source: 'estimado',
                lastUpdated: null,
                byRegion: {}
            },
            rankings: {
                highestBirthRates: [],
                highestDeathRates: [],
                mostPopulous: [],
                lastUpdated: null
            },
            canvas: {
                width: 0,
                height: 0,
                radius: 0
            },
            particles: [],
            isDragging: false
        };
        
        this.listeners = new Map();
        this.prevState = this.cloneState();
    }
    
    getState() {
        return { ...this.state };
    }
    
    setState(updates) {
        this.prevState = this.cloneState();
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }
    
    updatePath(path, value) {
        this.prevState = this.cloneState();
        const keys = path.split('.');
        let current = this.state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        this.notifyListeners();
    }
    
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        
        return () => this.listeners.get(key)?.delete(callback);
    }
    
    notifyListeners() {
        this.listeners.forEach((callbacks, key) => {
            const oldValue = this.getNestedValue(this.prevState, key);
            const newValue = this.getNestedValue(this.state, key);
            
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                callbacks.forEach(cb => cb(newValue, oldValue));
            }
        });
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }
    
    cloneState() {
        return JSON.parse(JSON.stringify(this.state));
    }
    
    toggle(key) {
        const current = this.getNestedValue(this.state, key);
        if (typeof current === 'boolean') {
            this.updatePath(key, !current);
        }
    }
}

export const store = new Store();

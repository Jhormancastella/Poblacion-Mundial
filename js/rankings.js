/**
 * Rankings Module - UI component for country rankings display
 * Shows top countries by birth rate, death rate, and population
 */

import { store } from './store.js';
import { formatNumber } from './utils.js';

class RankingsManager {
    constructor() {
        this.container = null;
        this.initialized = false;
    }

    init() {
        this.createRankingsUI();
        this.bindToStore();
        this.initialized = true;
    }

    createRankingsUI() {
        // Find or create the rankings container
        this.container = document.getElementById('rankings-container');
        
        if (!this.container) {
            // Create container after the stats section
            const statsSection = document.querySelector('.additional-stats');
            if (statsSection) {
                this.container = document.createElement('section');
                this.container.id = 'rankings-container';
                this.container.className = 'rankings-section';
                this.container.setAttribute('aria-labelledby', 'rankings-heading');
                statsSection.after(this.container);
            }
        }

        if (this.container) {
            this.renderInitialStructure();
        }
    }

    renderInitialStructure() {
        this.container.innerHTML = `
            <h2 id="rankings-heading" class="rankings-title">🏆 Ranking de Países</h2>
            <div class="rankings-grid">
                <article class="ranking-card" aria-labelledby="birth-rank-title">
                    <h3 id="birth-rank-title" class="ranking-card-title">
                        <span class="ranking-icon">👶</span>
                        Mayor Natalidad
                    </h3>
                    <p class="ranking-subtitle">Nacimientos por cada 1,000 habitantes</p>
                    <ol class="ranking-list" id="birth-rankings" aria-live="polite">
                        <li class="ranking-placeholder">Cargando datos...</li>
                    </ol>
                </article>

                <article class="ranking-card" aria-labelledby="death-rank-title">
                    <h3 id="death-rank-title" class="ranking-card-title">
                        <span class="ranking-icon">⚰️</span>
                        Mayor Mortalidad
                    </h3>
                    <p class="ranking-subtitle">Muertes por cada 1,000 habitantes</p>
                    <ol class="ranking-list" id="death-rankings" aria-live="polite">
                        <li class="ranking-placeholder">Cargando datos...</li>
                    </ol>
                </article>

                <article class="ranking-card" aria-labelledby="pop-rank-title">
                    <h3 id="pop-rank-title" class="ranking-card-title">
                        <span class="ranking-icon">🌎</span>
                        Más Poblados
                    </h3>
                    <p class="ranking-subtitle">Población total</p>
                    <ol class="ranking-list" id="pop-rankings" aria-live="polite">
                        <li class="ranking-placeholder">Cargando datos...</li>
                    </ol>
                </article>
            </div>
            <p class="rankings-source" id="rankings-source"></p>
        `;
    }

    bindToStore() {
        store.subscribe('rankings', (rankings) => {
            if (rankings && rankings.highestBirthRates && rankings.highestBirthRates.length > 0) {
                this.updateRankings(rankings);
            }
        });
    }

    updateRankings(rankings) {
        const { highestBirthRates, highestDeathRates, mostPopulous, timestamp } = rankings;

        // Update birth rate rankings
        const birthList = document.getElementById('birth-rankings');
        if (birthList && highestBirthRates) {
            birthList.innerHTML = highestBirthRates.map((country, index) => `
                <li class="ranking-item">
                    <span class="ranking-position">${index + 1}</span>
                    <span class="ranking-country">${country.name}</span>
                    <span class="ranking-value ranking-value-birth">${country.rate.toFixed(1)}‰</span>
                </li>
            `).join('');
        }

        // Update death rate rankings
        const deathList = document.getElementById('death-rankings');
        if (deathList && highestDeathRates) {
            deathList.innerHTML = highestDeathRates.map((country, index) => `
                <li class="ranking-item">
                    <span class="ranking-position">${index + 1}</span>
                    <span class="ranking-country">${country.name}</span>
                    <span class="ranking-value ranking-value-death">${country.rate.toFixed(1)}‰</span>
                </li>
            `).join('');
        }

        // Update population rankings
        const popList = document.getElementById('pop-rankings');
        if (popList && mostPopulous) {
            popList.innerHTML = mostPopulous.map((country, index) => `
                <li class="ranking-item">
                    <span class="ranking-position">${index + 1}</span>
                    <span class="ranking-country">${country.name}</span>
                    <span class="ranking-value">${formatCompactNumber(country.population)}</span>
                </li>
            `).join('');
        }

        // Update source timestamp
        const sourceEl = document.getElementById('rankings-source');
        if (sourceEl && timestamp) {
            const date = new Date(timestamp);
            sourceEl.textContent = `Datos actualizados: ${date.toLocaleDateString('es-ES')} ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        }
    }
}

// Helper for compact number formatting (e.g., 1.4B, 142M)
function formatCompactNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export const rankingsManager = new RankingsManager();

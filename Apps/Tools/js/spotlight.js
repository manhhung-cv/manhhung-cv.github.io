// js/spotlight.js
import { TOOLS } from './config.js';

const cmdPalette = document.getElementById('cmd-palette');
const cmdInput = document.getElementById('cmd-input');
const cmdResults = document.getElementById('cmd-results');
const spotlightSectionTitle = document.getElementById('spotlight-section-title');

function renderSpotlightResults(list, isSuggestion = false) {
    if (!cmdResults) return;
    if (spotlightSectionTitle) {
        spotlightSectionTitle.textContent = isSuggestion ? 'Gợi ý ứng dụng' : `Kết quả tìm kiếm (${list.length})`;
    }

    if (list.length === 0) {
        cmdResults.innerHTML = `<li class="px-4 py-6 text-center text-white/50 text-xs">Không tìm thấy tiện ích</li>`;
        return;
    }

    cmdResults.innerHTML = list.map(t => `
        <li class="px-3 py-2 rounded-xl hover:bg-white/10 active:bg-white/20 cursor-pointer flex items-center justify-between transition-colors" 
            onclick="window.openToolGlobal('${t.id}'); window.closeSpotlight();">
            <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                    <i class="${t.icon}"></i>
                </div>
                <div class="truncate">
                    <div class="text-xs font-semibold text-white truncate">${t.name}</div>
                    <div class="text-[10px] text-white/50 truncate">${t.desc || 'Tiện ích HunqOS'}</div>
                </div>
            </div>
            <i class="fas fa-arrow-right text-white/30 text-xs"></i>
        </li>
    `).join('');
}

export function initSpotlight() {
    window.openSpotlight = () => {
        if (!cmdPalette) return;
        cmdPalette.classList.add('spotlight-active');
        if (cmdInput) {
            cmdInput.value = '';
            setTimeout(() => cmdInput.focus(), 50);
        }
        renderSpotlightResults(TOOLS.slice(0, 6), true);
    };

    window.closeSpotlight = () => {
        if (!cmdPalette) return;
        cmdPalette.classList.remove('spotlight-active');
        cmdInput?.blur();
    };

    if (cmdInput) {
        cmdInput.oninput = (e) => {
            const val = e.target.value.trim().toLowerCase();
            if (!val) {
                renderSpotlightResults(TOOLS.slice(0, 6), true);
                return;
            }
            renderSpotlightResults(
                TOOLS.filter(t => t.name.toLowerCase().includes(val) || (t.desc && t.desc.toLowerCase().includes(val)))
            );
        };
    }

    if (cmdPalette) {
        cmdPalette.addEventListener('click', (e) => {
            if (e.target === cmdPalette) window.closeSpotlight();
        });
    }

    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        const isCmdOrCtrl = e.metaKey || e.ctrlKey;

        if (isCmdOrCtrl && (key === 'f' || key === 'k')) {
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') && active !== cmdInput) {
                return;
            }
            e.preventDefault();
            if (cmdPalette?.classList.contains('spotlight-active')) {
                window.closeSpotlight();
            } else {
                window.openSpotlight();
            }
        } else if (e.key === 'Escape' && cmdPalette?.classList.contains('spotlight-active')) {
            window.closeSpotlight();
        }
    });
}
document.addEventListener('DOMContentLoaded', function () {

    // --- Elements ---

    const allNavButtons = document.querySelectorAll('.desktop-nav .nav-button');

    const toolContainers = document.querySelectorAll('.tool-container');

    const headerTitle = document.querySelector('.header-title');

    const paletteOverlay = document.querySelector('.command-palette-overlay');

    const paletteInput = document.getElementById('command-palette-input');

    const paletteResults = document.querySelector('.command-palette-results');

    const paletteTriggers = document.querySelectorAll('.command-palette-trigger');

    const themeOptionButtons = document.querySelectorAll('.theme-options button');

    const htmlElement = document.documentElement;



    // =================================================================

    // THEME MANAGEMENT

    // =================================================================

    const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');



    function applyTheme(theme) {

        let effectiveTheme = theme;

        if (theme === 'system') {

            effectiveTheme = systemThemeQuery.matches ? 'dark' : 'light';

        }

        htmlElement.setAttribute('data-theme', effectiveTheme);

        localStorage.setItem('theme', theme);



        // Cập nhật trạng thái active cho nút theme

        themeOptionButtons.forEach(btn => {

            if (btn.dataset.themeValue === theme) {

                btn.classList.add('active');

            } else {

                btn.classList.remove('active');

            }

        });

    }



    // Listener cho thay đổi theme hệ thống

    systemThemeQuery.addEventListener('change', (e) => {

        const savedTheme = localStorage.getItem('theme') || 'system';

        if (savedTheme === 'system') {

            applyTheme('system');

        }

    });



    // Gán sự kiện cho các nút chọn theme

    themeOptionButtons.forEach(button => {

        button.addEventListener('click', () => {

            const theme = button.dataset.themeValue;

            applyTheme(theme);

        });

    });



    // Khởi tạo theme khi tải trang

    const initialTheme = localStorage.getItem('theme') || 'system';

    applyTheme(initialTheme);



    // =================================================================

    // TOOL & COMMAND PALETTE MANAGEMENT

    // =================================================================

    function switchTool(toolId) {

        toolContainers.forEach(c => c.classList.remove('visible'));

        const activeTool = document.getElementById(toolId);

        if (activeTool) activeTool.classList.add('visible');



        let toolName = 'Công cụ';

        allNavButtons.forEach(btn => {

            if (btn.dataset.tool === toolId) {

                btn.classList.add('active');

                toolName = btn.querySelector('span')?.textContent || toolName;

            } else {

                btn.classList.remove('active');

            }

        });

        if (headerTitle) headerTitle.innerHTML = '<div class="logo">Hunq</div>'+ toolName;

    }



    function openPalette() {

        paletteOverlay.classList.add('visible');

        paletteInput.focus();

        paletteInput.value = '';

        filterPalette();

    }



    function closePalette() {

        paletteOverlay.classList.remove('visible');

    }



    function filterPalette() {

        const query = paletteInput.value.toLowerCase().trim();

        paletteResults.querySelectorAll('.result-item').forEach(item => {

            const text = item.textContent.toLowerCase();

            item.classList.toggle('hidden', !text.includes(query));

        });

    }



    function populatePalette() {

        paletteResults.innerHTML = '';

        allNavButtons.forEach(button => {

            const toolId = button.dataset.tool;

            const iconHTML = button.querySelector('.nav-icon').outerHTML;

            const text = button.querySelector('span').textContent;

            const li = document.createElement('li');

            li.className = 'result-item';

            li.dataset.tool = toolId;

            li.innerHTML = `${iconHTML}<span>${text}</span>`;

            li.addEventListener('click', () => {

                switchTool(toolId);

                closePalette();

            });

            paletteResults.appendChild(li);

        });

    }



    // --- Event Listeners ---

    allNavButtons.forEach(button => button.addEventListener('click', () => switchTool(button.dataset.tool)));

    paletteTriggers.forEach(trigger => trigger.addEventListener('click', openPalette));

    paletteOverlay.addEventListener('click', (e) => { if (e.target === paletteOverlay) closePalette(); });

    paletteInput.addEventListener('input', filterPalette);

    window.addEventListener('keydown', (e) => {

        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openPalette(); }

        if (e.key === 'Escape' && paletteOverlay.classList.contains('visible')) { closePalette(); }

    });



    // --- Initialization ---

    switchTool('tool-welcome');

    populatePalette();

});

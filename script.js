document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTY DOM ---
    const themeToggle = document.getElementById('theme-toggle');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const farmsGrid = document.getElementById('farms-grid');
    const modal = document.getElementById('farm-modal');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    const logoLink = document.getElementById('logo-link');

    // Dwa zestawy filtrów
    const editionFilterHeader = document.getElementById('edition-filter-header');
    const automationFilterHeader = document.getElementById('automation-filter-header');
    const versionFilterHeader = document.getElementById('version-filter-header');
    
    const editionFilterMain = document.getElementById('edition-filter-main');
    const automationFilterMain = document.getElementById('automation-filter-main');
    const versionFilterMain = document.getElementById('version-filter-main');

    // --- ZARZĄDZANIE MOTYWEM (TRÓJSTANOWE) ---
    const themes = ['system', 'light', 'dark'];
    const icons = {
        light: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
        dark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
        system: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`
    };

    const applyTheme = (themeSetting) => {
        if (themeSetting === 'system') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.dataset.theme = themeSetting;
        }
        themeToggle.innerHTML = icons[themeSetting];
        localStorage.setItem('theme', themeSetting);
    };

    const toggleTheme = () => {
        const currentSetting = localStorage.getItem('theme') || 'system';
        const currentIndex = themes.indexOf(currentSetting);
        const nextSetting = themes[(currentIndex + 1) % themes.length];
        applyTheme(nextSetting);
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('theme') === 'system') {
            applyTheme('system');
        }
    });

    applyTheme(localStorage.getItem('theme') || 'system');
    themeToggle.addEventListener('click', toggleTheme);
    
    // --- LOGIKA ROZWIJANEJ WYSZUKIWARKI ---
    searchInput.addEventListener('focus', () => {
        searchContainer.classList.add('active');
    });
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            searchContainer.classList.remove('active');
        }
    });

    // --- ŁADOWANIE I WYŚWIETLANIE DANYCH ---
    const allFarms = typeof farmsData !== 'undefined' ? farmsData : [];

    function displayFarms(farms) {
        farmsGrid.innerHTML = '';
        if (farms.length === 0) {
            farmsGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem;">Nie znaleziono farm pasujących do kryteriów.</p>`;
            return;
        }

        farms.forEach(farm => {
            const card = document.createElement('div');
            card.className = 'farm-card';
            card.dataset.id = farm.id;
            const editionClass = farm.edition.toLowerCase().replace(/ & /g, '-');

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${farm.image}" alt="${farm.name}" class="card-image" loading="lazy">
                    ${farm.new ? '<span class="new-badge">Nowa</span>' : ''}
                </div>
                <div class="card-content">
                    <h3>${farm.name}</h3>
                    <p>${farm.description}</p>
                    <div class="card-meta">
                        <span>${farm.author}</span>
                        <div class="meta-tags">
                            <span class="meta-item ${editionClass}">${farm.edition}</span>
                            <span class="meta-item">${farm.version}</span>
                        </div>
                    </div>
                </div>
            `;
            farmsGrid.appendChild(card);
        });
    }

    // --- SYNCHRONIZACJA I FILTROWANIE ---
    function syncFilters(sourceElement) {
        const value = sourceElement.value;
        if (sourceElement.id.includes('edition-filter')) {
            editionFilterHeader.value = value;
            editionFilterMain.value = value;
        } else if (sourceElement.id.includes('automation-filter')) {
            automationFilterHeader.value = value;
            automationFilterMain.value = value;
        } else if (sourceElement.id.includes('version-filter')) {
            versionFilterHeader.value = value;
            versionFilterMain.value = value;
        }
    }
    
    function filterAndSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const edition = editionFilterHeader.value;
        const automation = automationFilterHeader.value;
        const version = versionFilterHeader.value.toLowerCase().trim();

        const filteredFarms = allFarms.filter(farm => {
            const matchesSearch = searchTerm === '' ||
                farm.name.toLowerCase().includes(searchTerm) ||
                farm.author.toLowerCase().includes(searchTerm) ||
                farm.description.toLowerCase().includes(searchTerm);
            const matchesEdition = edition === 'all' || farm.edition === edition;
            const matchesAutomation = automation === 'all' || farm.automation === automation;
            const matchesVersion = version === '' || farm.version.toLowerCase().includes(version);
            return matchesSearch && matchesEdition && matchesAutomation && matchesVersion;
        });
        displayFarms(filteredFarms);
    }
    
    const allFilterElements = [
        searchInput,
        editionFilterHeader, automationFilterHeader, versionFilterHeader,
        editionFilterMain, automationFilterMain, versionFilterMain
    ];

    allFilterElements.forEach(el => {
        el.addEventListener('input', (e) => {
            if (e.target.tagName === 'SELECT' || e.target.id.includes('version-filter')) {
                syncFilters(e.target);
            }
            filterAndSearch();
        });
    });

    logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        searchContainer.classList.remove('active');
        searchInput.value = '';
        editionFilterHeader.value = 'all';
        automationFilterHeader.value = 'all';
        versionFilterHeader.value = '';
        syncFilters(editionFilterHeader);
        syncFilters(automationFilterHeader);
        syncFilters(versionFilterHeader);
        filterAndSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- LOGIKA MODALA ---
    function openModal(farm) {
        document.body.classList.add('modal-open');

        let materialsHTML = '';
        const savedMaterials = JSON.parse(localStorage.getItem(`minefarm-materials-${farm.id}`)) || [];
        farm.materials.forEach((mat, index) => {
            const isChecked = savedMaterials.includes(index);
            const checkboxId = `mat-${farm.id}-${index}`;
            materialsHTML += `<li><input type="checkbox" id="${checkboxId}" data-index="${index}" ${isChecked ? 'checked' : ''}><label for="${checkboxId}">${mat.amount} - ${mat.item}</label></li>`;
        });
        modalBody.innerHTML = `
            <div class="modal-header"><h2>${farm.name}</h2><div class="modal-meta"><span><strong>Autor:</strong> ${farm.author}</span><span><strong>Edycja:</strong> ${farm.edition}</span><span><strong>Wersja:</strong> ${farm.version}</span></div></div>
            <div class="modal-body-content"><p>${farm.description}</p><div class="video-container"><iframe src="${farm.videoUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p>${farm.info}</p>
            <div class="materials-section"><h3>Potrzebne materiały:</h3><ul class="materials-list" data-farm-id="${farm.id}">${materialsHTML}</ul><button class="uncheck-button" data-farm-id="${farm.id}">Odznacz wszystko</button></div></div>`;
        modal.classList.add('visible');
        modal.querySelector('.materials-list').addEventListener('change', handleMaterialCheck);
        modal.querySelector('.uncheck-button').addEventListener('click', handleUncheckAll);
    }

    function closeModal() {
        document.body.classList.remove('modal-open');
        modal.classList.remove('visible');
    }

    farmsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.farm-card');
        if (card) {
            const farmData = allFarms.find(f => f.id === card.dataset.id);
            if (farmData) openModal(farmData);
        }
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === "Escape" && modal.classList.contains('visible')) closeModal(); });

    // --- LOGIKA LISTY MATERIAŁÓW ---
    function handleMaterialCheck(e) {
        if (e.target.type === 'checkbox') {
            const farmId = e.currentTarget.dataset.farmId;
            const itemIndex = parseInt(e.target.dataset.index);
            const storageKey = `minefarm-materials-${farmId}`;
            let checkedItems = JSON.parse(localStorage.getItem(storageKey)) || [];
            if (e.target.checked) {
                if (!checkedItems.includes(itemIndex)) checkedItems.push(itemIndex);
            } else {
                checkedItems = checkedItems.filter(i => i !== itemIndex);
            }
            localStorage.setItem(storageKey, JSON.stringify(checkedItems));
        }
    }

    function handleUncheckAll(e) {
        const farmId = e.target.dataset.farmId;
        localStorage.removeItem(`minefarm-materials-${farmId}`);
        modal.querySelectorAll('.materials-list input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    }

    // --- INICJALIZACJA ---
    if (allFarms.length > 0) {
        displayFarms(allFarms);
    } else {
        console.error("Dane farm (`farmsData`) nie zostały poprawnie załadowane.");
        farmsGrid.innerHTML = `<p>Błąd ładowania danych. Sprawdź konsolę przeglądarki.</p>`;
    }
});

document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
});

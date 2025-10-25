document.addEventListener('DOMContentLoaded', function() {
    // Configuración de idiomas (ahora con bandera de Colombia para español)
    const languages = {
        'es': { code: 'ES', name: 'Español', flag: 'img/flags/co.svg' }, // Cambiado a bandera de Colombia
        'en': { code: 'EN', name: 'English', flag: 'img/flags/gb.svg' },
        'pt': { code: 'BR', name: 'Português', flag: 'img/flags/br.svg' },
        'de': { code: 'DE', name: 'Deutsch', flag: 'img/flags/de.svg' },
        'fr': { code: 'FR', name: 'Français', flag: 'img/flags/fr.svg' }
    };

    // Elementos del DOM
    const languageSelector = document.querySelector('.language-selector');
    const selectedLanguage = document.querySelector('.selected-language');
    const languageDropdown = document.querySelector('.language-dropdown');
    const selectedFlag = selectedLanguage.querySelector('img');

    // Determinar idioma actual
    function getCurrentLanguage() {
        const path = window.location.pathname;
        if (path.includes('en.html')) return 'en';
        if (path.includes('pt.html')) return 'pt';
        if (path.includes('de.html')) return 'de';
        if (path.includes('fr.html')) return 'fr';
        return 'es';
    }

    // Cargar idioma actual
    function loadCurrentLanguage() {
        const currentLang = getCurrentLanguage();
        const langData = languages[currentLang];
        
        // Actualizar bandera mostrada
        selectedFlag.src = langData.flag;
        selectedFlag.alt = langData.name;
        
        languageDropdown.style.display = 'none';
    }

    // Cambiar idioma
    function changeLanguage(lang) {
        if (lang === 'es') {
            window.location.href = 'index.html';
        } else {
            window.location.href = `lang/${lang}.html`;
        }
        localStorage.setItem('preferredLanguage', lang);
    }

    // Crear opciones del dropdown
    function createLanguageOptions() {
        languageDropdown.innerHTML = '';
        const currentLang = getCurrentLanguage();

        Object.entries(languages).forEach(([key, langData]) => {
            if (key === currentLang) return;

            const option = document.createElement('div');
            option.className = 'language-option';
            option.innerHTML = `
                <img src="${langData.flag}" alt="${langData.name}" width="20" height="15">
                <span>${langData.name} (${langData.code})</span>
            `;
            option.addEventListener('click', () => changeLanguage(key));
            languageDropdown.appendChild(option);
        });
    }

    // Toggle dropdown
    function toggleDropdown() {
        if (languageDropdown.style.display === 'block') {
            languageDropdown.style.display = 'none';
        } else {
            createLanguageOptions();
            languageDropdown.style.display = 'block';
        }
    }

    // Cerrar al hacer clic fuera
    function closeOnClickOutside(e) {
        if (!languageSelector.contains(e.target)) {
            languageDropdown.style.display = 'none';
        }
    }

    // Inicializar
    function init() {
        loadCurrentLanguage();
        
        // Event listeners
        selectedLanguage.addEventListener('click', toggleDropdown);
        document.addEventListener('click', closeOnClickOutside);
        
        // Cargar idioma preferido
        const preferredLang = localStorage.getItem('preferredLanguage');
        if (preferredLang && preferredLang !== getCurrentLanguage()) {
            changeLanguage(preferredLang);
        }
    }

    init();
});
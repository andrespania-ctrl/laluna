
async function loadLanguageData() {
    const supportedLanguages = ['en', 'es', 'no'];
    let langToLoad = localStorage.getItem('userLang');

    if (!langToLoad) {
        const userLanguages = navigator.languages || [navigator.language || 'en'];
        langToLoad = userLanguages
            .map(l => l.split('-')[0])
            .find(l => supportedLanguages.includes(l)) || 'en';
        
        localStorage.setItem('userLang', langToLoad);
    }

    try {
        const response = await fetch(`./i18n/${langToLoad}.json`);
        if (!response.ok) throw new Error("Failed to load");
        return response.json();
    } catch (error) {
        console.error(`Error loading ${langToLoad}, falling back to English`, error);
        const fallbackResponse = await fetch(`./i18n/en.json`);
        return fallbackResponse.json();
    }
}

function getNestedTranslation(obj, key) {
    return key.split('.').reduce((o, k) => o?.[k], obj);
}

function renderFormattedText(text) {
    if (typeof text !== "string") return text;

    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const value = getNestedTranslation(translations, key);

        if (value !== undefined) {
            el.innerHTML = renderFormattedText(value);
        } else {
            console.warn(`Missing translation: ${key}`);
        }
    });
}

async function switchLanguage(lang) {
    localStorage.setItem('userLang', lang);

    const response = await fetch(`./i18n/${lang}.json`);
    const translations = await response.json();
    
    applyTranslations(translations);
}

function changeFlag(lang) {
    const flagImage = document.getElementById("flagImg");
    
    flagImage.src = `./images/${lang}.png`;
    flagImage.alt = lang + " Flag";
}


document.addEventListener("DOMContentLoaded", async () => {
    const savedLang = localStorage.getItem('userLang') || 'no';
    changeFlag(savedLang);

    const selectButton = document.getElementById("languageSwitcher");
    const langOptions = document.getElementById("langOptions");

    const translations = await loadLanguageData();
    applyTranslations(translations);

    const langSelector = document.getElementById("langSelector");

    let hideTimeout = null;

    langSelector.addEventListener("mouseenter", () => {
        clearTimeout(hideTimeout);
        langOptions.classList.remove("selectHide");
    });

    langSelector.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(() => {
            langOptions.classList.add("selectHide");
        }, 150);
    });

    selectButton.addEventListener("click", function (e) {
        e.stopPropagation();
        langOptions.classList.toggle("selectHide");
    });

    langOptions.addEventListener("click", async function (e) {
        if (e.target && e.target.classList.contains("option")) {
            const lang = e.target.getAttribute("value");

            selectButton.textContent = e.target.textContent;
            langOptions.classList.add("selectHide");

            changeFlag(lang);

            await switchLanguage(lang);
        }
    });

    document.addEventListener("click", function () {
        langOptions.classList.add("selectHide");
    });

});

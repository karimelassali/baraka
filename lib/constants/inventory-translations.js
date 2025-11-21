// lib/constants/inventory-translations.js

export const inventoryTranslations = {
    it: {
        // Page titles
        inventory: "Inventario",
        inventoryManagement: "Gestione Inventario",
        inventoryDescription: "Gestisci prodotti e categorie del tuo negozio",

        // Tabs
        categories: "Categorie",
        products: "Prodotti",

        // Categories
        categoryName: "Nome Categoria",
        categoryDescription: "Descrizione",
        categoryColor: "Colore",
        addCategory: "Aggiungi Categoria",
        editCategory: "Modifica Categoria",
        deleteCategory: "Elimina Categoria",
        categoryDeleted: "Categoria eliminata con successo",
        categoryCreated: "Categoria creata con successo",
        categoryUpdated: "Categoria aggiornata con successo",
        noCategoriesFound: "Nessuna categoria trovata",
        createFirstCategory: "Crea la tua prima categoria per organizzare i prodotti",
        productCount: "Prodotti",
        cannotDeleteCategory: "Impossibile eliminare categoria con prodotti esistenti",

        // Products
        productName: "Nome Prodotto",
        productDescription: "Descrizione",
        category: "Categoria",
        selectCategory: "Seleziona Categoria",
        noCategory: "Nessuna Categoria",
        quantity: "Quantità",
        unit: "Unità",
        minimumStock: "Scorta Minima",
        purchasePrice: "Prezzo d'Acquisto",
        sellingPrice: "Prezzo di Vendita",
        currency: "Valuta",
        supplier: "Fornitore",
        supplierName: "Nome Fornitore",
        supplierContact: "Contatto Fornitore",
        sku: "SKU",
        barcode: "Codice a Barre",
        location: "Posizione",
        locationInShop: "Posizione in Negozio",
        expirationDate: "Data di Scadenza",
        batchNumber: "Numero Lotto",
        addProduct: "Aggiungi Prodotto",
        editProduct: "Modifica Prodotto",
        deleteProduct: "Elimina Prodotto",
        productDeleted: "Prodotto eliminato con successo",
        productCreated: "Prodotto creato con successo",
        productUpdated: "Prodotto aggiornato con successo",
        noProductsFound: "Nessun prodotto trovato",
        createFirstProduct: "Aggiungi il tuo primo prodotto all'inventario",

        // Expiration alerts
        expirationAlerts: "Avvisi di Scadenza",
        expired: "Scaduti",
        expiringToday: "Scadono Oggi",
        expiringTomorrow: "Scadono Domani",
        expiringSoon: "Scadono Presto",
        noExpiringProducts: "Nessun prodotto in scadenza",
        viewDetails: "Visualizza Dettagli",
        productsExpired: "prodotti scaduti",
        productsExpiringToday: "prodotti scadono oggi",
        productsExpiringTomorrow: "prodotti scadono domani",
        productsExpiringSoon: "prodotti scadono entro 7 giorni",
        attentionRequired: "Attenzione Richiesta",
        productsExpiringOverview: "Panoramica prodotti in scadenza o scaduti",
        collapse: "Comprimi",
        all: "Tutti",

        // Units
        units: {
            pcs: "pezzi",
            kg: "kg",
            g: "g",
            l: "litri",
            ml: "ml",
            box: "scatole",
            bottle: "bottiglie",
            pack: "confezioni"
        },

        // Actions
        search: "Cerca",
        searchProducts: "Cerca prodotti...",
        searchCategories: "Cerca categorie...",
        filter: "Filtra",
        filterByCategory: "Filtra per Categoria",
        filterByExpiration: "Filtra per Scadenza",
        allProducts: "Tutti i Prodotti",
        allCategories: "Tutte le Categorie",
        save: "Salva",
        cancel: "Annulla",
        delete: "Elimina",
        edit: "Modifica",
        create: "Crea",
        close: "Chiudi",
        actions: "Azioni",

        // Validation messages
        nameRequired: "Il nome è obbligatorio",
        expirationRequired: "La data di scadenza è obbligatoria",
        quantityRequired: "La quantità è obbligatoria",
        categoryRequired: "La categoria è obbligatoria",

        // Status
        active: "Attivo",
        inactive: "Inattivo",
        lowStock: "Scorta Bassa",
        outOfStock: "Esaurito",

        // Misc
        total: "Totale",
        loading: "Caricamento...",
        error: "Errore",
        success: "Successo",
        confirmDelete: "Sei sicuro di voler eliminare",
        confirmDeleteMessage: "Questa azione non può essere annullata.",
    }
};

export const getInventoryTranslation = (key, lang = 'it') => {
    const keys = key.split('.');
    let value = inventoryTranslations[lang];

    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key;
        }
    }

    return value || key;
};

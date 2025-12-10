const fs = require('fs');
const path = require('path');

const files = [
    path.join(__dirname, 'messages', 'en.json'),
    path.join(__dirname, 'messages', 'it.json'),
    path.join(__dirname, 'messages', 'ar.json')
];

const newKeys = {
    en: {
        Offers: {
            title: "Offer Management",
            subtitle: "Create and manage weekly and permanent offers",
            create: "Create Offer",
            edit: "Edit Offer",
            search: "Search offers...",
            existing: "Existing Offers",
            no_offers: "No offers found",
            table: {
                offer: "Offer",
                type: "Type",
                category: "Category",
                active: "Active",
                actions: "Actions"
            },
            form: {
                title: "Title",
                type: "Type",
                category: "Category",
                description: "Description",
                image: "Offer Image",
                badge: "Badge Text",
                popup: "Show as Popup Offer",
                cancel: "Cancel",
                save: "Save",
                update: "Update Offer",
                create_btn: "Create Offer",
                uploading: "Uploading...",
                saving: "Saving..."
            },
            messages: {
                success_create: "Offer created successfully",
                success_update: "Offer updated successfully",
                error: "An error occurred",
                delete_confirm: "Are you sure you want to delete this offer?"
            }
        },
        Campaigns: {
            stats: {
                total: "Total Messages",
                success_rate: "Success Rate",
                failed: "Failed"
            },
            filters: {
                search: "Search messages...",
                status: "All Status",
                reset: "Reset Filters",
                sent: "Sent",
                failed: "Failed"
            },
            table: {
                no_messages: "No messages found matching your criteria"
            }
        },
        Reviews: {
            title: "Review Management",
            subtitle: "Manage customer reviews and feedback",
            add: "Add Review",
            search: "Search reviews...",
            total: "Total Reviews",
            last_updated: "Last updated: Today",
            table: {
                content: "Content",
                rating: "Rating",
                status: "Status",
                date: "Date",
                actions: "Actions",
                approved: "Approved",
                pending: "Pending",
                no_reviews: "No reviews found"
            },
            form: {
                title: "Add New Review",
                name: "Customer Name",
                rating: "Rating",
                content: "Review Content",
                approve: "Auto-approve this review",
                cancel: "Cancel",
                submit: "Add Review"
            },
            details: {
                content: "Review Content",
                details: "Review Details",
                rating: "Rating:",
                status: "Status:",
                date: "Date:",
                hide: "Hide",
                approve: "Approve"
            }
        },
        Inventory: {
            products: "Products",
            categories: "Categories",
            total: "Total",
            addProduct: "Add Product",
            addCategory: "Add Category",
            searchProducts: "Search products...",
            searchCategories: "Search categories...",
            allCategories: "All Categories",
            noProductsFound: "No products found",
            createFirstProduct: "Create your first product to get started",
            noCategoriesFound: "No categories found",
            createFirstCategory: "Create your first category to get started",
            productName: "Product Name",
            category: "Category",
            quantity: "Quantity",
            location: "Location",
            expirationDate: "Expiration Date",
            actions: "Actions",
            noCategory: "No Category",
            lowStock: "Low Stock",
            expired: "Expired",
            expiringToday: "Expiring Today",
            expiringSoon: "Expiring Soon",
            active: "Active",
            nameRequired: "Name is required",
            expirationRequired: "Expiration date is required",
            confirmDelete: "Are you sure you want to delete",
            confirmDeleteMessage: "This action cannot be undone.",
            editCategory: "Edit Category",
            categoryName: "Category Name",
            categoryDescription: "Description",
            categoryColor: "Color",
            cancel: "Cancel",
            save: "Save",
            loading: "Loading...",
            productCount: "Products"
        }
    },
    it: {
        Offers: {
            title: "Gestione Offerte",
            subtitle: "Crea e gestisci offerte settimanali e permanenti",
            create: "Crea Offerta",
            edit: "Modifica Offerta",
            search: "Cerca offerte...",
            existing: "Offerte Esistenti",
            no_offers: "Nessuna offerta trovata",
            table: {
                offer: "Offerta",
                type: "Tipo",
                category: "Categoria",
                active: "Attivo",
                actions: "Azioni"
            },
            form: {
                title: "Titolo",
                type: "Tipo",
                category: "Categoria",
                description: "Descrizione",
                image: "Immagine Offerta",
                badge: "Testo Badge",
                popup: "Mostra come Popup",
                cancel: "Annulla",
                save: "Salva",
                update: "Aggiorna Offerta",
                create_btn: "Crea Offerta",
                uploading: "Caricamento...",
                saving: "Salvataggio..."
            },
            messages: {
                success_create: "Offerta creata con successo",
                success_update: "Offerta aggiornata con successo",
                error: "Si è verificato un errore",
                delete_confirm: "Sei sicuro di voler eliminare questa offerta?"
            }
        },
        Campaigns: {
            stats: {
                total: "Messaggi Totali",
                success_rate: "Tasso di Successo",
                failed: "Falliti"
            },
            filters: {
                search: "Cerca messaggi...",
                status: "Tutti gli Stati",
                reset: "Reimposta Filtri",
                sent: "Inviato",
                failed: "Fallito"
            },
            table: {
                no_messages: "Nessun messaggio trovato con i criteri selezionati"
            }
        },
        Reviews: {
            title: "Gestione Recensioni",
            subtitle: "Gestisci le recensioni e i feedback dei clienti",
            add: "Aggiungi Recensione",
            search: "Cerca recensioni...",
            total: "Recensioni Totali",
            last_updated: "Ultimo aggiornamento: Oggi",
            table: {
                content: "Contenuto",
                rating: "Valutazione",
                status: "Stato",
                date: "Data",
                actions: "Azioni",
                approved: "Approvato",
                pending: "In Attesa",
                no_reviews: "Nessuna recensione trovata"
            },
            form: {
                title: "Aggiungi Nuova Recensione",
                name: "Nome Cliente",
                rating: "Valutazione",
                content: "Contenuto Recensione",
                approve: "Approva automaticamente",
                cancel: "Annulla",
                submit: "Aggiungi Recensione"
            },
            details: {
                content: "Contenuto Recensione",
                details: "Dettagli Recensione",
                rating: "Valutazione:",
                status: "Stato:",
                date: "Data:",
                hide: "Nascondi",
                approve: "Approva"
            }
        },
        Inventory: {
            products: "Prodotti",
            categories: "Categorie",
            total: "Totale",
            addProduct: "Aggiungi Prodotto",
            addCategory: "Aggiungi Categoria",
            searchProducts: "Cerca prodotti...",
            searchCategories: "Cerca categorie...",
            allCategories: "Tutte le Categorie",
            noProductsFound: "Nessun prodotto trovato",
            createFirstProduct: "Crea il tuo primo prodotto per iniziare",
            noCategoriesFound: "Nessuna categoria trovata",
            createFirstCategory: "Crea la tua prima categoria per iniziare",
            productName: "Nome Prodotto",
            category: "Categoria",
            quantity: "Quantità",
            location: "Posizione",
            expirationDate: "Data di Scadenza",
            actions: "Azioni",
            noCategory: "Nessuna Categoria",
            lowStock: "Scorte Basse",
            expired: "Scaduto",
            expiringToday: "Scade Oggi",
            expiringSoon: "Scade Presto",
            active: "Attivo",
            nameRequired: "Il nome è obbligatorio",
            expirationRequired: "La data di scadenza è obbligatoria",
            confirmDelete: "Sei sicuro di voler eliminare",
            confirmDeleteMessage: "Questa azione non può essere annullata.",
            editCategory: "Modifica Categoria",
            categoryName: "Nome Categoria",
            categoryDescription: "Descrizione",
            categoryColor: "Colore",
            cancel: "Annulla",
            save: "Salva",
            loading: "Caricamento...",
            productCount: "Prodotti"
        }
    },
    ar: {
        Offers: {
            title: "إدارة العروض",
            subtitle: "إنشاء وإدارة العروض الأسبوعية والدائمة",
            create: "إنشاء عرض",
            edit: "تعديل العرض",
            search: "البحث عن العروض...",
            existing: "العروض الحالية",
            no_offers: "لم يتم العثور على عروض",
            table: {
                offer: "العرض",
                type: "النوع",
                category: "الفئة",
                active: "نشط",
                actions: "إجراءات"
            },
            form: {
                title: "العنوان",
                type: "النوع",
                category: "الفئة",
                description: "الوصف",
                image: "صورة العرض",
                badge: "نص الشارة",
                popup: "عرض كنافذة منبثقة",
                cancel: "إلغاء",
                save: "حفظ",
                update: "تحديث العرض",
                create_btn: "إنشاء عرض",
                uploading: "جاري الرفع...",
                saving: "جاري الحفظ..."
            },
            messages: {
                success_create: "تم إنشاء العرض بنجاح",
                success_update: "تم تحديث العرض بنجاح",
                error: "حدث خطأ",
                delete_confirm: "هل أنت متأكد أنك تريد حذف هذا العرض؟"
            }
        },
        Campaigns: {
            stats: {
                total: "إجمالي الرسائل",
                success_rate: "معدل النجاح",
                failed: "فشل"
            },
            filters: {
                search: "البحث في الرسائل...",
                status: "كل الحالات",
                reset: "إعادة تعيين المرشحات",
                sent: "أرسلت",
                failed: "فشلت"
            },
            table: {
                no_messages: "لم يتم العثور على رسائل مطابقة للمعايير الخاصة بك"
            }
        },
        Reviews: {
            title: "إدارة المراجعات",
            subtitle: "إدارة مراجعات العملاء والملاحظات",
            add: "إضافة مراجعة",
            search: "البحث في المراجعات...",
            total: "إجمالي المراجعات",
            last_updated: "آخر تحديث: اليوم",
            table: {
                content: "المحتوى",
                rating: "التقييم",
                status: "الحالة",
                date: "التاريخ",
                actions: "إجراءات",
                approved: "موافق عليه",
                pending: "قيد الانتظار",
                no_reviews: "لم يتم العثور على مراجعات"
            },
            form: {
                title: "إضافة مراجعة جديدة",
                name: "اسم العميل",
                rating: "التقييم",
                content: "محتوى المراجعة",
                approve: "الموافقة التلقائية على هذه المراجعة",
                cancel: "إلغاء",
                submit: "إضافة مراجعة"
            },
            details: {
                content: "محتوى المراجعة",
                details: "تفاصيل المراجعة",
                rating: "التقييم:",
                status: "الحالة:",
                date: "التاريخ:",
                hide: "إخفاء",
                approve: "موافقة"
            }
        },
        Inventory: {
            products: "المنتجات",
            categories: "الفئات",
            total: "الإجمالي",
            addProduct: "إضافة منتج",
            addCategory: "إضافة فئة",
            searchProducts: "البحث عن المنتجات...",
            searchCategories: "البحث عن الفئات...",
            allCategories: "جميع الفئات",
            noProductsFound: "لم يتم العثور على منتجات",
            createFirstProduct: "أنشئ منتجك الأول للبدء",
            noCategoriesFound: "لم يتم العثور على فئات",
            createFirstCategory: "أنشئ فئتك الأولى للبدء",
            productName: "اسم المنتج",
            category: "الفئة",
            quantity: "الكمية",
            location: "الموقع",
            expirationDate: "تاريخ انتهاء الصلاحية",
            actions: "إجراءات",
            noCategory: "بدون فئة",
            lowStock: "مخزون منخفض",
            expired: "منتهي الصلاحية",
            expiringToday: "ينتهي اليوم",
            expiringSoon: "ينتهي قريبا",
            active: "نشط",
            nameRequired: "الاسم مطلوب",
            expirationRequired: "تاريخ انتهاء الصلاحية مطلوب",
            confirmDelete: "هل أنت متأكد أنك تريد حذف",
            confirmDeleteMessage: "لا يمكن التراجع عن هذا الإجراء.",
            editCategory: "تعديل الفئة",
            categoryName: "اسم الفئة",
            categoryDescription: "الوصف",
            categoryColor: "اللون",
            cancel: "إلغاء",
            save: "حفظ",
            loading: "جاري التحميل...",
            productCount: "المنتجات"
        }
    }
};

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const json = JSON.parse(content);

        // Determine language from filename
        const lang = path.basename(file, '.json');

        // Ensure Admin object exists
        if (!json.Admin) {
            json.Admin = {};
        }

        // Merge new keys
        Object.assign(json.Admin, newKeys[lang]);

        fs.writeFileSync(file, JSON.stringify(json, null, 2));
        console.log(`Updated ${file}`);
    } catch (err) {
        console.error(`Error updating ${file}:`, err);
    }
});

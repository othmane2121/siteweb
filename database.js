/// Contenu complet du gestionnaire de base de données
// Contenu complet du gestionnaire de base de données
class RestaurantDB {
    constructor() {
        this.dbName = 'RestaurantDB';
        this.version = 1;
        this.db = null;
        this.listeners = [];
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains('reservations')) {
                    const store = db.createObjectStore('reservations', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('date', 'date', { unique: false });
                    store.createIndex('status', 'status', { unique: false });
                }

                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    async ensureDB() {
        if (!this.db) {
            await this.init();
            if (!this.db) {
                throw new Error("La base de données n'a pas pu être initialisée.");
            }
        }
    }

    async saveReservation(reservation) {
        await this.ensureDB();

        const transaction = this.db.transaction(['reservations'], 'readwrite');
        const store = transaction.objectStore('reservations');

        if (!reservation.createdAt) {
            reservation.createdAt = new Date().toLocaleString('fr-FR');
        }

        return new Promise((resolve, reject) => {
            const request = store.put(reservation);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllReservations() {
        await this.ensureDB();

        const transaction = this.db.transaction(['reservations'], 'readonly');
        const store = transaction.objectStore('reservations');

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteReservation(id) {
        await this.ensureDB();

        const transaction = this.db.transaction(['reservations'], 'readwrite');
        const store = transaction.objectStore('reservations');

        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Instance globale
window.restaurantDB = new RestaurantDB();

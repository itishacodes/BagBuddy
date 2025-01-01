const { createApp } = Vue;

createApp({
    data() {
        return {
            loggedIn: false,
            username: '',
            listName: '',
            mode: 'pack',
            newItem: {
                name: '',
                quantity: '',
                location: '',
                date: ''
            },
            packedItems: [],
            unpackedItems: [],
            filterLocation: '',
            filterDate: ''
        };
    },
    computed: {
        filteredPackedItems() {
            return this.packedItems.filter(item =>
                item.location.toLowerCase().includes(this.filterLocation.toLowerCase()) &&
                (this.filterDate ? new Date(item.date).toLocaleDateString() === new Date(this.filterDate).toLocaleDateString() : true)
            );
        },
        filteredUnpackedItems() {
            return this.unpackedItems.filter(item =>
                item.location.toLowerCase().includes(this.filterLocation.toLowerCase()) &&
                (this.filterDate ? new Date(item.date).toLocaleDateString() === new Date(this.filterDate).toLocaleDateString() : true)
            );
        }
    },
    methods: {
        login() {
            if (this.username) {
                this.loggedIn = true;
                this.loadData();
            }
        },
        saveData() {
            const data = {
                listName: this.listName,
                packedItems: this.packedItems,
                unpackedItems: this.unpackedItems
            };
            localStorage.setItem(this.username, JSON.stringify(data));
        },
        loadData() {
            const storedData = localStorage.getItem(this.username);
            if (storedData) {
                const data = JSON.parse(storedData);
                this.listName = data.listName;
                this.packedItems = data.packedItems;
                this.unpackedItems = data.unpackedItems;
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        addItem() {
            const newItem = { ...this.newItem, id: Date.now() };
            if (this.mode === 'pack') {
                this.packedItems.push(newItem);
            } else {
                this.unpackedItems.push(newItem);
            }
            this.newItem = { name: '', quantity: '', location: '', date: '' };
            this.saveData();
        },
        moveItem(item, targetList) {
            if (targetList === 'pack') {
                this.packedItems.push(item);
                this.unpackedItems = this.unpackedItems.filter(i => i.id !== item.id);
            } else {
                this.unpackedItems.push(item);
                this.packedItems = this.packedItems.filter(i => i.id !== item.id);
            }
            this.saveData();
        },
        deleteItem(item, list) {
            if (list === 'pack') {
                this.packedItems = this.packedItems.filter(i => i.id !== item.id);
            } else {
                this.unpackedItems = this.unpackedItems.filter(i => i.id !== item.id);
            }
            this.saveData();
        },
        downloadList() {
            const allItems = [...this.packedItems, ...this.unpackedItems];
            const headers = ["Name", "Quantity", "Location", "Date"];
            const rows = allItems.map(item => [
                `"${item.name}"`,
                item.quantity,
                `"${item.location}"`,
                `"${item.date}"`
            ]);

            const csvContent = [headers, ...rows]
                .map(row => row.join(","))
                .join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${this.listName || "bagBuddy"}-list.csv`;
            link.click();
        }
    }
}).mount('#app');

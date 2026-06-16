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
                category: '', 
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
            if (this.username.trim()) {
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
            localStorage.setItem(this.username.trim(), JSON.stringify(data));
        },
        loadData() {
            const savedData = localStorage.getItem(this.username.trim());
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.listName = parsed.listName || '';
                this.packedItems = parsed.packedItems || [];
                this.unpackedItems = parsed.unpackedItems || [];
            } else {
                this.listName = '';
                this.packedItems = [];
                this.unpackedItems = [];
            }
        },
        addItem() {
            if (!this.newItem.name.trim() || !this.newItem.category) return;
            
            const itemToAdd = {
                id: Date.now(),
                name: this.newItem.name.trim(),
                quantity: this.newItem.quantity || 1,
                category: this.newItem.category,
                location: this.newItem.location.trim() || 'Main Bag',
                date: this.newItem.date || new Date().toISOString().split('T')[0]
            };

            this.unpackedItems.push(itemToAdd);
            this.saveData();

            // Clear inputs
            this.newItem.name = '';
            this.newItem.quantity = '';
            this.newItem.category = '';
            this.newItem.location = '';
            this.newItem.date = '';
        },
        toggleItem(item, fromList) {
            if (fromList === 'unpacked') {
                this.unpackedItems = this.unpackedItems.filter(i => i.id !== item.id);
                this.packedItems.push(item);
            } else {
                this.packedItems = this.packedItems.filter(i => i.id !== item.id);
                this.unpackedItems.push(item);
            }
            this.saveData();
        },
        removeItem(item, fromList) {
            if (fromList === 'unpacked') {
                this.unpackedItems = this.unpackedItems.filter(i => i.id !== item.id);
            } else {
                this.packedItems = this.packedItems.filter(i => i.id !== item.id);
            }
            this.saveData();
        },
        logout() {
            this.loggedIn = false;
            this.username = '';
            this.listName = '';
            this.packedItems = [];
            this.unpackedItems = [];
        },
        downloadCSV() {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Item Name,Quantity,Category,Storage Location,Target Date,Status\n";

            this.unpackedItems.forEach(item => {
                csvContent += `"${item.name}","${item.quantity}","${item.category}","${item.location}","${item.date}","Unpacked"\n`;
            });

            this.packedItems.forEach(item => {
                csvContent += `"${item.name}","${item.quantity}","${item.category}","${item.location}","${item.date}","Packed"\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${this.listName || 'Packing_List'}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Confetti Trigger
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            }
        }
    }
}).mount('#app');

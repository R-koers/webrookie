let products = [];
let originalProducts = [];
let hasChanges = false;

document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    setupEventListeners();
    setupOrderAdminEvents();
});


function updateProductsFromAdmin(updatedProducts) {

    localStorage.setItem('products', JSON.stringify(updatedProducts));
    localStorage.setItem('hasAdminEdits', 'true');

    localStorage.removeItem('productsTimestamp');
    console.log('Admin wijzigingen doorgevoerd naar alle pagina\'s:', updatedProducts.length);
}


async function refreshProducts() {
    try {
        console.log('Producten verversen van server...');
        const response = await fetch('products.json');
        const data = await response.json();
        const serverProducts = data.components;

        localStorage.setItem('products', JSON.stringify(serverProducts));
        localStorage.setItem('productsTimestamp', Date.now());
        localStorage.setItem('hasAdminEdits', 'false'); 
        console.log('Producten verversen voltooid:', serverProducts.length);
        return serverProducts;
    } catch (error) {
        console.error('Fout bij verversen van producten:', error);
        return products;
    }
}


async function loadProducts() {
    try {

        const cachedProducts = localStorage.getItem('adminProducts');
        if (cachedProducts) {
            products = JSON.parse(cachedProducts);
        } else {

            const response = await fetch('products.json');
            const data = await response.json();

            products = data.components || [];
        }
        if (!Array.isArray(products)) {
            products = [];
        }
        originalProducts = JSON.parse(JSON.stringify(products));
        displayProducts();
        updateChangeStatus();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Fout bij het laden van producten', 'error');
        products = [];
        originalProducts = [];
        displayProducts();
        updateChangeStatus();
    }
}

function setupEventListeners() {
    const addForm = document.getElementById('add-product-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddProduct);
    }
    const saveBtn = document.getElementById('save-changes');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveChanges);
    }
    const resetBtn = document.getElementById('reset-products-btn');
    const resetHeaderBtn = document.getElementById('reset-products');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => confirmReset());
    }
    if (resetHeaderBtn) {
        resetHeaderBtn.addEventListener('click', () => confirmReset());
    }

    const editModal = document.getElementById('edit-modal');
    const closeEditBtn = document.getElementById('close-edit-modal');
    const cancelEditBtn = document.getElementById('cancel-edit');
    if (closeEditBtn) {
        closeEditBtn.addEventListener('click', closeEditModal);
    }
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }
    const editForm = document.getElementById('edit-product-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditProduct);
    }
    const confirmModal = document.getElementById('confirm-modal');
    const confirmCancelBtn = document.getElementById('confirm-cancel');
    const confirmOkBtn = document.getElementById('confirm-ok');
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', closeConfirmModal);
    }
    if (confirmOkBtn) {
        confirmOkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = window.pendingConfirmAction;
            window.pendingConfirmAction = null;
            if (typeof action === 'function') {
                action();
            }
            closeConfirmModal();
        });
    }
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                closeConfirmModal();
            }
        });
    }
}


function displayProducts() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    if (products.length === 0) {
        productsList.innerHTML = `
        <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <p>Geen producten gevonden</p>
            </div>
        `;
        return;
    }
    const productsHTML = products.map((product, index) => {
        const category = getProductCategory(product);
        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                data-product-id="${product.id}">
                <div class="flex items-center space-x-4">
                    <img src="${product.image}" alt="${product.name}"
                        class="w-16 h-16 object-contain rounded bg-gray-100">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-medium text-gray-900 truncate">
                            ${product.name}
                        </h3>
                        <p class="text-sm text-gray-500">
                            Categorie: ${getCategoryName(category)}
                        </p>
                        <p class="text-sm text-gray-500">
                            Prijs: €${product.price.toFixed(2).replace('.', ',')}
                        </p>
                        ${product.amount
        ? `<p class="text-sm text-gray-500">Voorraad: ${product.amount}</p>`
        : ''}
                    </div>
                    <div class="flex space-x-1">
                        <button onclick="editProduct(${index})"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded
                             text-xs transition-colors duration-300 flex items-center space-x-1"
                            title="Bewerken">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2
                                    0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828
                                    15H9v-2.828l8.586-8.586z">
                                </path>
                            </svg>
                            <span>Bewerken</span>
                        </button>
                        <button onclick="deleteProduct(${index})"
                            class="bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded
                             text-xs transition-colors duration-300 flex items-center space-x-1"
                            title="Verwijderen">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5
                                    7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                            </svg>
                            <span>Verwijderen</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    productsList.innerHTML = productsHTML;
}


function getCategoryName(category) {
    const categories = {
        cpu: 'CPU',
        gpu: 'GPU',
        memory: 'Geheugen',
        storage: 'Opslag',
        motherboard: 'Moederbord',
        psu: 'Voeding',
        cooling: 'Koeling',
    };
    return categories[category] || category;
}


function getProductCategory(product) {
    const name = product.name.toLowerCase();
    const specs = product.specifications || {};
    if (name.includes('cpu') || name.includes('intel') || name.includes('amd') || specs.socket) {
        return 'cpu';
    }
    if (name.includes('gpu') || name.includes('graphics') || name.includes('rtx') || name.includes('gtx')) {
        return 'gpu';
    }
    if (name.includes('memory') || name.includes('ddr') || name.includes('ram') || specs.memory_type) {
        return 'memory';
    }
    if (name.includes('ssd') || name.includes('hdd') || name.includes('storage') || specs.capacity) {
        return 'storage';
    }
    if (name.includes('motherboard') || name.includes('board') || specs.chipset) {
        return 'motherboard';
    }
    if (name.includes('psu') || name.includes('power') || name.includes('watt') || specs.wattage) {
        return 'psu';
    }
    if (name.includes('cooler') || name.includes('cooling') || name.includes('fan') || specs.type === 'Air Cooler') {
        return 'cooling';
    }
    return 'other';
}


function handleAddProduct(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newProduct = {
        id: Date.now(),
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        image: formData.get('image'),
        description: formData.get('description') || '',
        amount: 10,
        specifications: {},
    };

    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.image) {
        if (typeof window.notify === 'function') {
            window.notify('Vul alle verplichte velden in', 'error');
        }
        return;
    }

    if (newProduct.price <= 0) {
        if (typeof window.notify === 'function') {
            window.notify('Prijs moet groter zijn dan 0', 'error');
        }
        return;
    }

    products.push(newProduct);
    hasChanges = true;

    displayProducts();
    updateChangeStatus();

    event.target.reset();
    if (typeof window.notify === 'function') {
        window.notify('Product toegevoegd - klik "Wijzigingen Opslaan" om door te voeren naar alle pagina\'s', 'success');
    }
}


function editProduct(index) {
    const product = products[index];
    if (!product) return;

    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-category').value = product.category;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-image').value = product.image;
    document.getElementById('edit-product-description').value = product.description || '';
    document.getElementById('edit-product-form').dataset.editIndex = index;
    document.getElementById('edit-modal').classList.remove('hidden');
}

function handleEditProduct(event) {
    event.preventDefault();
    console.log('handleEditProduct aangeroepen!');
    const formData = new FormData(event.target);
    const index = parseInt(event.target.dataset.editIndex);
    if (Number.isNaN(index) || index < 0 || index >= products.length) {
        if (typeof window.notify === 'function') {
            window.notify('Product niet gevonden', 'error');
        }
        return;
    }
    const originalProduct = products[index];
    const updatedProduct = {
        id: parseInt(formData.get('id')),
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        image: formData.get('image'),
        description: formData.get('description') || '',
        amount: originalProduct.amount || 10,

        specifications: originalProduct.specifications || {},
    };
    console.log('Original product:', originalProduct);
    console.log('Updated product:', updatedProduct);

    if (!updatedProduct.name || !updatedProduct.category || !updatedProduct.price || !updatedProduct.image) {
        if (typeof window.notify === 'function') {
            window.notify('Vul alle verplichte velden in', 'error');
        }
        return;
    }
    if (updatedProduct.price <= 0) {
        if (typeof window.notify === 'function') {
            window.notify('Prijs moet groter zijn dan 0', 'error');
        }
        return;
    }
    products[index] = updatedProduct;
    hasChanges = true;
    console.log('Product updated, hasChanges set to:', hasChanges);

    displayProducts();
    updateChangeStatus();
    closeEditModal();
    if (typeof window.notify === 'function') {
        window.notify('Product bijgewerkt - klik "Wijzigingen Opslaan" om door te voeren naar alle pagina\'s', 'success');
    }
}


function deleteProduct(index) {
    if (index < 0 || index >= products.length) {
        if (typeof window.notify === 'function') {
            window.notify('Product niet gevonden', 'error');
        }
        return;
    }
    const product = products[index];

    showConfirmModal(
        'Product Verwijderen',
        `Weet je zeker dat je "${product.name}" wilt verwijderen?`,
        () => {
            products.splice(index, 1);
            hasChanges = true;
            displayProducts();
            updateChangeStatus();
            if (typeof window.notify === 'function') {
                window.notify('Product verwijderd - klik "Wijzigingen Opslaan" om door te voeren naar alle pagina\'s', 'success');
            }
        },
    );
}


function saveChanges() {
    console.log('saveChanges aangeroepen!');
    console.log('hasChanges:', hasChanges);
    console.log('products:', products);
    try {
        localStorage.setItem('adminProducts', JSON.stringify(products));
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('hasAdminEdits', 'true');
        localStorage.removeItem('productsTimestamp');
        updateProductsFromAdmin(products);
        hasChanges = false;
        updateChangeStatus();
        console.log('Wijzigingen opgeslagen!');
        if (typeof window.notify === 'function') {
            window.notify('Wijzigingen succesvol opgeslagen en doorgevoerd naar alle pagina\'s', 'success');
        }
    } catch (error) {
        console.error('Error saving changes:', error);
        if (typeof window.notify === 'function') {
            window.notify('Fout bij het opslaan van wijzigingen', 'error');
        }
    }
}


function resetProducts() {
    closeConfirmModal();
    products = JSON.parse(JSON.stringify(originalProducts));
    hasChanges = false;
    localStorage.removeItem('adminProducts');
    localStorage.removeItem('products');
    localStorage.removeItem('hasAdminEdits');
    localStorage.removeItem('productsTimestamp');
    refreshProducts().then(() => {
        displayProducts();
        updateChangeStatus();
        if (typeof window.notify === 'function') {
            window.notify('Producten succesvol gereset naar originele staat!', 'success');
        }
    }).catch(() => {
        displayProducts();
        updateChangeStatus();
        if (typeof window.notify === 'function') {
            window.notify('Producten succesvol gereset naar originele staat!', 'success');
        }
    });
}


function confirmReset() {
    showConfirmModal(
        'Producten Resetten',
        'Weet je zeker dat je alle wijzigingen wilt ongedaan maken? Dit kan niet ongedaan worden gemaakt.',
        resetProducts,
    );
}

// Update change status
function updateChangeStatus() {
    const saveBtn = document.getElementById('save-changes');
    console.log('updateChangeStatus aangeroepen, hasChanges:', hasChanges);
    console.log('saveBtn gevonden:', !!saveBtn); 
    if (saveBtn) {
        if (hasChanges) {
            saveBtn.disabled = false;
            saveBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
            saveBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            console.log('Save button ingeschakeld');
        } else {
            saveBtn.disabled = true;
            saveBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            saveBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            console.log('Save button uitgeschakeld'); 
        }
    }
}


function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    document.getElementById('edit-product-form').reset();
}


function showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    window.pendingConfirmAction = onConfirm;
    document.getElementById('confirm-modal').classList.remove('hidden');
}


function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
}


// Notifications removed; use window.notify from notify.js instead


window.editProduct = editProduct;
window.deleteProduct = deleteProduct;



function fetchOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    const emptyDiv = document.getElementById('orders-empty');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!orders || orders.length === 0) {
        emptyDiv.classList.remove('hidden');
        return;
    } else {
        emptyDiv.classList.add('hidden');
    }
    orders.forEach(order => {
        const totalItems = order.items.reduce((sum, item) => sum + (item.amount || item.quantity || 1), 0);
        order.items.forEach((item, idx) => {
            const tr = document.createElement('tr');
            tr.className = idx === 0 ? 'border-t-4 border-gray-300' : '';
            if (idx === 0) {
                const tijdTd = document.createElement('td');
                tijdTd.className = 'px-4 py-2 align-top text-xs text-gray-500';
                tijdTd.rowSpan = order.items.length;
                tijdTd.textContent = formatOrderTime(order.orderDate);
                tr.appendChild(tijdTd);
                const idTd = document.createElement('td');
                idTd.className = 'px-4 py-2 align-top font-mono text-sm text-blue-900';
                idTd.rowSpan = order.items.length;
                idTd.textContent = order.orderNumber;
                tr.appendChild(idTd);
            }

            const productTd = document.createElement('td');
            productTd.className = 'px-4 py-2 text-gray-900';
            productTd.textContent = item.name || item.productName || '-';
            tr.appendChild(productTd);

            const amountTd = document.createElement('td');
            amountTd.className = 'px-4 py-2 text-center';
            amountTd.textContent = item.amount || item.quantity || 1;
            tr.appendChild(amountTd);
 
            if (idx === 0) {
                const totalTd = document.createElement('td');
                totalTd.className = 'px-4 py-2 text-center font-semibold';
                totalTd.rowSpan = order.items.length;
                totalTd.textContent = totalItems;
                tr.appendChild(totalTd);

                const actionsTd = document.createElement('td');
                actionsTd.className = 'px-4 py-2 text-center';
                actionsTd.rowSpan = order.items.length;
                const printBtn = document.createElement('button');
                printBtn.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded text-xs';
                printBtn.textContent = 'Print';
                printBtn.onclick = () => printOrder(order);
                actionsTd.appendChild(printBtn);
                tr.appendChild(actionsTd);
            }
            tbody.appendChild(tr);
        });
        const sepTr = document.createElement('tr');
        sepTr.innerHTML = `<td colspan="6" class="p-0"><div class="border-b-4 border-gray-300"></div></td>`;
        tbody.appendChild(sepTr);
    });
}

function formatOrderTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '\n' + date.toLocaleDateString();
}


function filterOrders(orders, query) {
    if (!query) return orders;
    query = query.toLowerCase();
    return orders.filter(order => {
        if (order.orderNumber.toLowerCase().includes(query)) return true;
        return order.items.some(item => (item.name || '').toLowerCase().includes(query));
    });
}


function printOrder(order) {
    const win = window.open('', '_blank');
    win.document.write('<html><head><title>Order ' + order.orderNumber + '</title>');
    win.document.write('<style>body{font-family:sans-serif;padding:2em;}h2{margin-bottom:0.5em;}table{border-collapse:collapse;width:100%;margin-top:1em;}td,th{border:1px solid #E0E0E0;padding:8px;}th{background:#f5f5f5;}tr:nth-child(even){background:#fafafa;}@media print{button{display:none;}}</style>');
    win.document.write('</head><body>');
    win.document.write('<h2>Order ' + order.orderNumber + '</h2>');
    win.document.write('<p><strong>Datum:</strong> ' + new Date(order.orderDate).toLocaleString() + '</p>');
    win.document.write('<p><strong>Klant:</strong> ' + order.customer.firstName + ' ' + order.customer.lastName + ' (' + order.customer.email + ')</p>');
    win.document.write('<table><thead><tr><th>Product</th><th>Aantal</th></tr></thead><tbody>');
    order.items.forEach(item => {
        win.document.write('<tr><td>' + (item.name || '-') + '</td><td>' + (item.amount || item.quantity || 1) + '</td></tr>');
    });
    win.document.write('</tbody></table>');
    win.document.write('<p><strong>Totaal:</strong> €' + (order.totals?.grandTotal?.toFixed(2) || '-') + '</p>');
    win.document.write('<button onclick="window.print()">Print</button>');
    win.document.write('</body></html>');
    win.document.close();
}


function refreshOrdersTable() {
    const orders = fetchOrders();
    const searchInput = document.getElementById('order-search');
    const query = searchInput ? searchInput.value : '';
    renderOrdersTable(filterOrders(orders, query));
}


function setupOrderAdminEvents() {
    const searchInput = document.getElementById('order-search');
    if (searchInput) {
        searchInput.addEventListener('input', refreshOrdersTable);
    }
    const refreshBtn = document.getElementById('order-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshOrdersTable);
    }
    const exportBtn = document.getElementById('order-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportOrdersCsv);
    }
    const clearBtn = document.getElementById('order-clear-storage');
    if (clearBtn) {
        clearBtn.addEventListener('click', confirmClearStorage);
    }
    
    refreshOrdersTable();
}


function exportOrdersCsv() {
    const orders = fetchOrders();
    if (!orders || orders.length === 0) {
        if (typeof window.notify === 'function') {
            window.notify('Geen bestellingen om te exporteren', 'error');
        }
        return;
    }
    const rows = [];
    rows.push(['Ordernummer', 'Datum', 'Klant', 'Email', 'Product', 'Aantal', 'Totaal items', 'Grand total (€)']);
    orders.forEach(order => {
        const totalItems = order.items.reduce((sum, item) => sum + (item.amount || item.quantity || 1), 0);
        order.items.forEach((item, idx) => {
            rows.push([
                order.orderNumber,
                new Date(order.orderDate).toLocaleString(),
                `${order.customer.firstName} ${order.customer.lastName}`,
                order.customer.email,
                item.name || item.productName || '-',
                String(item.amount || item.quantity || 1),
                idx === 0 ? String(totalItems) : '',
                idx === 0 ? (order.totals?.grandTotal?.toFixed(2) || String(order.totals?.total || '')) : '',
            ]);
        });
    });
    const csv = rows.map(r => r.map(field => {
        const s = String(field ?? '');
        if (s.includes('"') || s.includes(',') || s.includes('\n')) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bestellingen-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


function confirmClearStorage() {
    showConfirmModal(
        'Opslag legen',
        'Weet je zeker dat je orders, winkelwagen en productcache wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
        clearLocalStorageData,
    );
}

function clearLocalStorageData() {
    try {
        localStorage.removeItem('orders');
        localStorage.removeItem('cart');
        localStorage.removeItem('products');
        localStorage.removeItem('adminProducts');
        localStorage.removeItem('hasAdminEdits');
        localStorage.removeItem('productsTimestamp');
        refreshOrdersTable();
        if (typeof refreshProducts === 'function') {
            refreshProducts().then(() => {
                displayProducts();
                updateChangeStatus();
            }).catch(() => {
                displayProducts();
                updateChangeStatus();
            });
        }
        if (typeof window.notify === 'function') {
            window.notify('Opslag geleegd', 'success');
        }
        closeConfirmModal();
    } catch (e) {
        console.error('Fout bij legen van opslag:', e);
        if (typeof window.notify === 'function') {
            window.notify('Fout bij legen van opslag', 'error');
        }
        closeConfirmModal();
    }
}
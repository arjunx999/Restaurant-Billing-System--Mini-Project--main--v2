const DISH_API = "http://localhost:9999/dish/get-all";
const ORDER_API = "http://localhost:9999/order/place";

let dishesList = [];      // All dishes from backend
let billItems = [];       // Items added to bill

document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("token")) {
        window.location.href = "index.html";
        return;
    }

    fetchDishes();
    document.getElementById("add-to-bill").addEventListener("click", addToBill);
    document.getElementById("generate-bill").addEventListener("click", saveOrder);
});

function getToken() {
    return localStorage.getItem("token");
}


//  FETCH DISHES TO POPULATE DROPDOWN

async function fetchDishes() {
    try {
        const res = await fetch(DISH_API, {
            headers: { "Authorization": "Bearer " + getToken() }
        });

        const data = await res.json();
        dishesList = data.dishes || [];

        populateDishDropdown();
    } catch (err) {
        console.error(err);
        alert("Failed to load menu items");
    }
}

function populateDishDropdown() {
    const select = document.getElementById("item-select");
    select.innerHTML = "";

    dishesList.forEach(dish => {
        select.innerHTML += `<option value="${dish._id}">${dish.name} - $${dish.price}</option>`;
    });
}


//  ADD ITEM TO BILL

function addToBill() {
    const id = document.getElementById("item-select").value;
    const quantity = parseInt(document.getElementById("item-quantity").value) || 1;

    const dish = dishesList.find(d => d._id === id);
    if (!dish) return;

    // Add item to bill array
    billItems.push({
        id: dish._id,
        name: dish.name,
        price: dish.price,
        quantity,
        total: dish.price * quantity
    });

    document.getElementById("add-item-form").reset();

    const modal = bootstrap.Modal.getInstance(document.getElementById("addItemModal"));
    modal.hide();

    renderBillTable();
}


//  RENDER BILL TABLE

function renderBillTable() {
    const table = document.getElementById("bill-items");
    table.innerHTML = "";

    billItems.forEach((item, index) => {
        table.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>$${item.price}</td>
                <td>${item.quantity}</td>
                <td>$${item.total.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="removeBillItem(${index})">Delete</button>
                </td>
            </tr>
        `;
    });

    updateTotals();
}


//  REMOVE ITEM FROM BILL

function removeBillItem(index) {
    billItems.splice(index, 1);
    renderBillTable();
}


// CALCULATE TOTALS

function updateTotals() {
    let subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    let discountPercent = parseFloat(document.getElementById("discount-percent").value) || 0;
    let discountAmount = subtotal * (discountPercent / 100);

    let total = subtotal - discountAmount;

    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("discount").textContent = `$${discountAmount.toFixed(2)}`;
    document.getElementById("total").textContent = `$${total.toFixed(2)}`;
}

document.getElementById("discount-percent").addEventListener("input", updateTotals);


//  SAVE ORDER → BACKEND

async function saveOrder() {
    if (billItems.length === 0) {
        alert("Add at least one item to generate bill.");
        return;
    }

    const customerName = document.getElementById("customer-name").value.trim();
    const customerPhone = document.getElementById("customer-phone").value.trim();
    const email = document.getElementById("customer-email").value.trim();
    const discountPercent = parseFloat(document.getElementById("discount-percent").value) || 0;

    if (!customerName || !customerPhone || !email) {
        alert("Please fill customer details.");
        return;
    }

    // Create order item format for backend
    const orderItems = billItems.map(item => ({
        dish: item.id,
        quantity: item.quantity
    }));

    // Calculate totals
    let subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    let discountAmount = subtotal * (discountPercent / 100);
    let totalAmount = subtotal - discountAmount;

    const orderData = {
        dishes: orderItems,
        customer: {
            name: customerName,
            phone: customerPhone,
            email
        },
        total_amount: totalAmount,
        status: "Preparing"
    };

    try {
        const res = await fetch(ORDER_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.msg || "Failed to save order");
            return;
        }

        alert(`Order Created Successfully!\nOrder ID: ${data.order._id}`);

        // Reset
        billItems = [];
        renderBillTable();
        document.getElementById("customer-name").value = "";
        document.getElementById("customer-phone").value = "";
        document.getElementById("customer-email").value = "";
        document.getElementById("discount-percent").value = 0;
        updateTotals();

    } catch (err) {
        console.error(err);
        alert("Server error while saving order");
    }
}

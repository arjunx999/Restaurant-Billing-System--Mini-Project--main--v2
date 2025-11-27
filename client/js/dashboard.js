const API_DISHES = "http://localhost:9999/dish/get-all";
const API_ORDERS = "http://localhost:9999/order/my-orders";

document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("token")) {
        window.location.href = "index.html";
        return;
    }

    loadDashboardData();
});

function getToken() {
    return localStorage.getItem("token");
}

async function loadDashboardData() {
    try {
        const [dishesRes, ordersRes] = await Promise.all([
            fetch(API_DISHES, { headers: { Authorization: "Bearer " + getToken() } }),
            fetch(API_ORDERS, { headers: { Authorization: "Bearer " + getToken() } })
        ]);

        const dishesData = await dishesRes.json();
        const ordersData = await ordersRes.json();

        const dishes = dishesData.dishes || [];
        const orders = ordersData.orders || [];

        updateStats(dishes, orders);
        loadRecentOrders(orders);
        loadPopularItems(orders, dishes);

    } catch (err) {
        console.log(err);
        alert("Dashboard loading failed.");
    }
}


// DASHBOARD STATS 

function updateStats(dishes, orders) {
    const today = new Date().toISOString().split("T")[0];

    const todaysOrders = orders.filter(order =>
        order.placed_at && order.placed_at.startsWith(today)
    );

    // Cards
    document.querySelector("#today-orders").textContent = todaysOrders.length;

    const revenue = todaysOrders.reduce((sum, o) => sum + o.total_amount, 0);
    document.querySelector("#revenue-today").textContent = `$${revenue.toFixed(2)}`;

    document.querySelector("#menu-items-count").textContent = dishes.length;

    const uniqueUsers = new Set(orders.map(o => o.user));
    document.querySelector("#customers-count").textContent = uniqueUsers.size;
}

// RECENT ORDERS
function loadRecentOrders(orders) {
    const table = document.getElementById("recent-orders");
    table.innerHTML = "";

    const recent = orders.slice(-5).reverse();

    if (recent.length === 0) {
        table.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No orders found</td></tr>`;
        return;
    }

    recent.forEach(order => {
        const row = document.createElement("tr");

        const statusClass = order.status === "Completed"
            ? "bg-success"
            : order.status === "Preparing"
                ? "bg-warning"
                : "bg-info";

        row.innerHTML = `
            <td>${order._id}</td>
            <td>${order.user?.name || "Unknown"}</td>
            <td>${order.dishes?.length || 0}</td>
            <td>$${order.total_amount.toFixed(2)}</td>
            <td><span class="badge ${statusClass}">${order.status}</span></td>
        `;
        table.appendChild(row);
    });
}


//POPULAR ITEMS 

function loadPopularItems(orders, dishes) {
    const list = document.getElementById("popular-items");
    list.innerHTML = "";

    const countMap = {};
    orders.forEach(order => {
        order.dishes.forEach(d => {
            // If d is an object, use d._id; if it's a string, use d directly
            const id = typeof d === 'string' ? d : d._id;
            countMap[id] = (countMap[id] || 0) + 1;
        });
    });

    const stats = Object.keys(countMap).map(id => {
        const dish = dishes.find(d => d._id === id);
        return {
            name: dish?.name || "Unknown",
            count: countMap[id]
        };
    });

    stats.sort((a, b) => b.count - a.count);

    stats.slice(0, 5).forEach(item => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            ${item.name}
            <span class="badge bg-primary rounded-pill">${item.count}</span>
        `;
        list.appendChild(li);
    });
}

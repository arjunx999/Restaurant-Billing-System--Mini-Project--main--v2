    const API_URL = "http://localhost:9999/order";

    document.addEventListener("DOMContentLoaded", () => {
        if (!localStorage.getItem("token")) {
            window.location.href = "index.html";
            return;
        }
        loadOrders();
    });

    function getToken() {
        return localStorage.getItem("token");
    }

    //LOAD ALL ORDERS 
    async function loadOrders() {
        try {
            const res = await fetch(`${API_URL}/my-orders`, {
                headers: { "Authorization": "Bearer " + getToken() }
            });

            if (!res.ok) throw new Error("Failed to fetch orders");

            const data = await res.json();
            populateOrdersTable(data.orders || []);
        } catch (err) {
            alert("Error loading orders");
            console.error(err);
        }
    }

    function populateOrdersTable(orders) {
        const table = document.getElementById("orders-table");
        table.innerHTML = "";

        if (orders.length === 0) {
            table.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No orders found</td></tr>`;
            return;
        }

        orders.forEach(order => {
            const row = document.createElement("tr");

            const statusClass =
                order.status === "Ready" ? "bg-info" :
                order.status === "Preparing" ? "bg-warning" : "bg-success";

            row.innerHTML = `
                <td>${order._id}</td>
                <td>${order.user ? order.user.name : "-"}</td>
                <td>${order.dishes.length}</td>
                <td>$${Number(order.total_amount).toFixed(2)}</td>
                <td><span class="badge ${statusClass}">${order.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-success complete-order" data-id="${order._id}">
                        Complete
                    </button>
                </td>
            `;

            table.appendChild(row);
        });

        document.querySelectorAll('.complete-order').forEach(btn => {
            btn.addEventListener("click", () => {
                completeOrder(btn.dataset.id);
            });
        });
    }

    // COMPLETE ORDER 
    async function completeOrder(id) {
        if (!confirm("Mark this order as completed?")) return;

        try {
            const res = await fetch(`${API_URL}/status/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + getToken()
                },
                body: JSON.stringify({ status: "Completed" })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.msg || "Failed to update order");
                return;
            }

            alert("Order completed!");
            loadOrders();

        } catch (err) {
            alert("Error updating order");
            console.error(err);
        }
    }

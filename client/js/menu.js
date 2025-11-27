const API_URL = "http://localhost:9999/dish";

// Check authentication before loading menu
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    loadDishes();
    document.getElementById("save-dish").addEventListener("click", addDish);
});

function getToken() {
    return localStorage.getItem("token");
}

//  LOAD DISHES 
async function loadDishes() {
    try {
        const res = await fetch(`${API_URL}/get-all`, {
            headers: { "Authorization": "Bearer " + getToken() }
        });

        if (!res.ok) {
            throw new Error("Failed to load dishes");
        }

        const data = await res.json();
        populateTable(data.dishes || []);
    } catch (err) {
        console.error("Error loading dishes:", err);
        alert("Unable to load dishes. Check backend.");
    }
}

//  POPULATE TABLE 
function populateTable(dishes) {
    const table = document.getElementById("dishes-table");
    table.innerHTML = "";

    if (dishes.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">No dishes added yet</td>
            </tr>`;
        return;
    }

    dishes.forEach(dish => {
        table.innerHTML += `
            <tr>
                <td>${dish.name}</td>
                <td>${dish.category}</td>
                <td>${dish.description}</td>
                <td>$${Number(dish.price).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteDish('${dish._id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

//  ADD DISH 
async function addDish() {
    const name = document.getElementById("dish-name").value.trim();
    const category = document.getElementById("dish-category").value.trim();
    const description = document.getElementById("dish-description").value.trim();
    const price = parseFloat(document.getElementById("dish-price").value);

    if (!name || !category || !description || isNaN(price)) {
        alert("Please fill all fields correctly.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify({ name, category, description, price })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.msg || "Failed to add dish");
            return;
        }

        alert("Dish added successfully!");

        loadDishes();  
        document.getElementById("add-dish-form").reset();

        const modalEl = document.getElementById("addDishModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

    } catch (err) {
        console.error("Error adding dish:", err);
        alert("Server error while adding dish.");
    }
}

//  DELETE DISH 
async function deleteDish(id) {
    if (!confirm("Are you sure you want to delete this dish?")) return;

    try {
        const res = await fetch(`${API_URL}/delete/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + getToken() }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.msg || "Failed to delete dish");
            return;
        }

        alert("Dish deleted successfully!");
        loadDishes();

    } catch (err) {
        console.error("Error deleting dish:", err);
        alert("Server error while deleting dish.");
    }
}

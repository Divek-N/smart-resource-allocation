const API = "http://localhost:3000";

/* Load bookings when page loads */
document.addEventListener("DOMContentLoaded", () => {
    loadBookings();
});

/* BOOK FUNCTION – FIXED */
function book() {
    const userName = document.getElementById("userName").value.trim();
    const resourceName = document.getElementById("resourceName").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    if (!userName || !resourceName || !startTime || !endTime) {
        alert("⚠️ Please fill all fields");
        return;
    }

    fetch(`${API}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: userName,
            resourceId: resourceName,
            startTime,
            endTime
        })
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    })
    .then(() => {
        alert("✅ Booking Successful");
        clearForm();
        loadBookings();
    })
    .catch(err => {
        alert(err.message || "❌ Booking failed");
    });
}

/* LOAD BOOKINGS – FIXED */
function loadBookings() {
    fetch(`${API}/bookings`)
        .then(res => res.json())
        .then(result => {
            const rows = document.getElementById("rows");
            rows.innerHTML = "";

            result.data.forEach(b => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${b.user_id}</td>
                    <td>${b.resource_id}</td>
                    <td>${formatDate(b.start_time)}</td>
                    <td>${formatDate(b.end_time)}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteBooking(${b.id})">
                            Delete
                        </button>
                    </td>
                `;
                rows.appendChild(tr);
            });
        })
        .catch(() => {
            alert("❌ Error loading bookings");
        });
}

/* DELETE */
function deleteBooking(id) {
    if (!confirm("Delete this booking?")) return;

    fetch(`${API}/bookings/${id}`, { method: "DELETE" })
        .then(() => loadBookings())
        .catch(() => alert("❌ Delete failed"));
}

/* HELPERS */
function clearForm() {
    document.getElementById("userName").value = "";
    document.getElementById("resourceName").value = "";
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";
}

function formatDate(dt) {
    return new Date(dt).toLocaleString();
}

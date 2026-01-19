const API = "http://localhost:3000";

/* Resource maps */
const resourceMap = {
    1: "Conference Hall",
    2: "Meeting Room A",
    3: "Meeting Room B",
    4: "Seminar Hall"
};

const resourceReverseMap = {
    "Conference Hall": 1,
    "Meeting Room A": 2,
    "Meeting Room B": 3,
    "Seminar Hall": 4
};

/* Save user names locally */
function saveUserName(id, name) {
    const data = JSON.parse(localStorage.getItem("bookingUsers")) || {};
    data[id] = name;
    localStorage.setItem("bookingUsers", JSON.stringify(data));
}

function getUserName(id, userId) {
    const data = JSON.parse(localStorage.getItem("bookingUsers")) || {};
    return data[id] || `User ${userId}`;
}

function removeUserName(id) {
    const data = JSON.parse(localStorage.getItem("bookingUsers")) || {};
    delete data[id];
    localStorage.setItem("bookingUsers", JSON.stringify(data));
}

/* Helpers */
function fmt(d) {
    return new Date(d).toLocaleString();
}

/* Load bookings */
function loadBookings() {
    fetch(API + "/bookings")
        .then(res => res.json())
        .then(res => {
            const rows = document.getElementById("rows");
            rows.innerHTML = "";

            res.data.forEach(b => {
                rows.innerHTML += `
                <tr>
                    <td>${getUserName(b.id, b.user_id)}</td>
                    <td>${resourceMap[b.resource_id]}</td>
                    <td>${fmt(b.start_time)}</td>
                    <td>${fmt(b.end_time)}</td>
                    <td>
                        <button class="delete-btn"
                            onclick="deleteBooking(${b.id})">
                            Delete
                        </button>
                    </td>
                </tr>`;
            });
        });
}

/* Book */
function book() {
    const name = userName.value.trim();
    const resource = resourceName.value;
    const start = startTime.value;
    const end = endTime.value;

    if (!name || !resource || !start || !end) {
        alert("Fill all fields");
        return;
    }

    fetch(API + "/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: 1,
            resourceId: resourceReverseMap[resource],
            startTime: start,
            endTime: end
        })
    })
    .then(res => res.json())
    .then(res => {
        if (!res.success) {
            alert("Already booked");
            return;
        }

        fetch(API + "/bookings")
            .then(r => r.json())
            .then(r => {
                const last = r.data[r.data.length - 1];
                saveUserName(last.id, name);
                clearForm();
                loadBookings();
            });
    });
}

/* Delete */
function deleteBooking(id) {
    if (!confirm("Delete this booking?")) return;

    fetch(API + "/booking/" + id, { method: "DELETE" })
        .then(() => {
            removeUserName(id);
            loadBookings();
        });
}

/* Clear form */
function clearForm() {
    userName.value = "";
    resourceName.value = "";
    startTime.value = "";
    endTime.value = "";
}

/* Input refs */
const userName = document.getElementById("userName");
const resourceName = document.getElementById("resourceName");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");

/* Initial load */
loadBookings();

const TASK_KEY = "tasks";
const WORKOUT_KEY = "workouts";
const LAST_RESET_KEY = "last_reset";
const TOGGLE_STATUS_KEY = "toggle_status"; // Key baru untuk status tombol
const DATA_KEY = "uploaded_data"; // Key untuk data JSON yang diunggah
const today = new Date().toISOString().slice(0, 10);

let data = {};
let isOddDays = JSON.parse(localStorage.getItem(TOGGLE_STATUS_KEY)) ?? true; // Muat status dari localStorage

// Load data dari localStorage jika tersedia
const savedData = localStorage.getItem(DATA_KEY);
if (savedData) {
    data = JSON.parse(savedData); // Muat data dari localStorage jika tersedia
} else {
    data = {}; // Kosongkan jika belum ada data
}

// Fungsi untuk membaca file JSON yang diunggah
document.getElementById("upload-button").addEventListener("click", () => {
    const fileInput = document.getElementById("upload-json");
    const file = fileInput.files[0];

    if (!file) {
        alert("Pilih file JSON terlebih dahulu!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        console.log("File content:", event.target.result); // Periksa isi file
        try {
            const jsonData = JSON.parse(event.target.result);
            console.log("Parsed JSON:", jsonData); // Periksa hasil parsing
            // Validasi struktur JSON
            if (!jsonData.tasks || !Array.isArray(jsonData.tasks)) {
                throw new Error("Data 'tasks' tidak ditemukan atau bukan array.");
            }
            if (!jsonData.workouts || !Array.isArray(jsonData.workouts)) {
                throw new Error("Data 'workouts' tidak ditemukan atau bukan array.");
            }

            // Simpan data ke localStorage
            localStorage.setItem(DATA_KEY, JSON.stringify(jsonData));
            alert("Data berhasil diunggah!");
            const tasks = JSON.parse(localStorage.getItem(TASK_KEY)) || {};
            const workouts = JSON.parse(localStorage.getItem(WORKOUT_KEY)) || {};

            data = jsonData; // Simpan ke variabel global
            renderChecklist(data.tasks, tasks);
            const workoutsData = isOddDays ? data.workouts : data.alternateWorkouts;
            renderWorkoutTable(workoutsData, workouts);
        } catch (error) {
            alert("Gagal membaca file JSON. Pastikan formatnya benar. " + error.message);
            console.error("Error parsing JSON:", error);
        }
    };

    reader.readAsText(file);
});

// Reset logic
if (localStorage.getItem(LAST_RESET_KEY) !== today) {
    localStorage.setItem(LAST_RESET_KEY, today);
    localStorage.setItem(TASK_KEY, JSON.stringify({}));
    localStorage.setItem(WORKOUT_KEY, JSON.stringify({}));
}

// Load saved data or default
const tasks = JSON.parse(localStorage.getItem(TASK_KEY)) || {};
const workouts = JSON.parse(localStorage.getItem(WORKOUT_KEY)) || {};

// Render checklist
renderChecklist(data.tasks || [], tasks);

// Render initial workout table based on toggle status
updateWorkoutTableTitleAndButton();
const workoutsData = isOddDays ? (data.workouts || []) : (data.alternateWorkouts || []);
renderWorkoutTable(workoutsData, workouts);

// Add event listener for toggle button
document.getElementById("toggle-button").addEventListener("click", () => {
    isOddDays = !isOddDays; // Ubah status
    localStorage.setItem(TOGGLE_STATUS_KEY, isOddDays); // Simpan status tombol
    updateWorkoutTableTitleAndButton();
    const updatedWorkoutsData = isOddDays ? (data.workouts || []) : (data.alternateWorkouts || []);
    renderWorkoutTable(updatedWorkoutsData, workouts);
});

// Function to update workout table title and button
function updateWorkoutTableTitleAndButton() {
    const title = document.getElementById("workout-title");
    const button = document.getElementById("toggle-button");

    if (isOddDays) {
        title.textContent = "Senin, Rabu, Jumat";
        button.textContent = "Switch to Selasa, Kamis, Sabtu";
    } else {
        title.textContent = "Selasa, Kamis, Sabtu";
        button.textContent = "Switch to Senin, Rabu, Jumat";
    }
}

// Render checklist
function renderChecklist(tasksData, tasks) {
    const checklist = document.getElementById("checklist");
    checklist.innerHTML = "";

    tasksData.forEach(task => {
        const status = tasks[task.id] || "not-started";

        const li = document.createElement("li");
        li.innerHTML = `
            ${task.name}
            <span class="task-status ${status}">${formatStatus(status)}</span>
            <select onchange="updateTaskStatus('${task.id}', this.value)">
                <option value="not-started" ${status === "not-started" ? "selected" : ""}>Not Started</option>
                <option value="on-progress" ${status === "on-progress" ? "selected" : ""}>On Progress</option>
                <option value="complete" ${status === "complete" ? "selected" : ""}>Complete</option>
            </select>
        `;
        checklist.appendChild(li);
    });
}

// Fungsi renderWorkoutTable
function renderWorkoutTable(workoutsData, workouts) {
    const workoutTable = document.getElementById("workoutTable");
    workoutTable.innerHTML = "";

    workoutsData.forEach(workout => {
        const progress = workouts[workout.id] || 0;
        const status = getWorkoutStatus(progress, workout.sets);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${workout.name}</td>
            <td>${workout.reps}</td>
            <td>
                <select onchange="updateWorkoutProgress('${workout.id}', this.value)">
                    ${[...Array(workout.sets + 1).keys()]
                        .map(i => `<option value="${i}" ${progress == i ? "selected" : ""}>${i}</option>`)
                        .join("")}
                </select>
            </td>
            <td class="${status}">${formatStatus(status)}</td>
        `;
        workoutTable.appendChild(row);
    });
}

// Tambahkan di bawah fungsi di atas
document.getElementById("clear-table-button").addEventListener("click", () => {
    const confirmClear = confirm("Apakah Anda yakin ingin menghapus tabel latihan? Tindakan ini tidak dapat dibatalkan.");
    if (confirmClear) {
        localStorage.removeItem(TASK_KEY);
        localStorage.removeItem(WORKOUT_KEY);
        localStorage.removeItem(DATA_KEY); // Hapus data JSON yang diunggah
        localStorage.removeItem(TOGGLE_STATUS_KEY); // Hapus status toggle

        data = {}; // Reset data yang disimpan dalam memori
        renderChecklist([], {}); // Kosongkan checklist
        renderWorkoutTable([], {}); // Kosongkan tabel workout
        
        alert("Semua data berhasil dihapus.");
    }
});




// Event handler for task status
window.updateTaskStatus = (id, status) => {
    tasks[id] = status;
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    renderChecklist(data.tasks, tasks);
};

// Event handler for workout progress
window.updateWorkoutProgress = (id, progress) => {
    workouts[id] = parseInt(progress, 10);
    localStorage.setItem(WORKOUT_KEY, JSON.stringify(workouts));
    const updatedWorkoutsData = isOddDays ? (data.workouts || []) : (data.alternateWorkouts || []);
    renderWorkoutTable(updatedWorkoutsData, workouts);
};


// Helpers
function formatStatus(status) {
    switch (status) {
        case "not-started": return "Not Started";
        case "on-progress": return "On Progress";
        case "complete": return "Complete";
        default: return "";
    }
}

function getWorkoutStatus(progress, totalSets) {
    if (progress === 0) return "not-started";
    if (progress < totalSets) return "on-progress";
    return "complete";
}

// Update date and time every second
function updateDateTime() {
    const datetimeElement = document.getElementById("current-time");
    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("id-ID");
    datetimeElement.textContent = `${formattedDate}, ${formattedTime}`;
}

// Call the function initially and set an interval
updateDateTime();
setInterval(updateDateTime, 1000);

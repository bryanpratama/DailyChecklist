const TASK_KEY = "tasks";
const WORKOUT_KEY = "workouts";
const LAST_RESET_KEY = "last_reset";
const TOGGLE_STATUS_KEY = "toggle_status"; // Key baru untuk status tombol
const today = new Date().toISOString().slice(0, 10);

let data = {};
let isOddDays = JSON.parse(localStorage.getItem(TOGGLE_STATUS_KEY)) ?? true; // Muat status dari localStorage

// Fetch JSON data
fetch("data.json")
    .then(response => response.json())
    .then(json => {
        data = json;

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
        renderChecklist(data.tasks, tasks);

        // Render initial workout table based on toggle status
        updateWorkoutTableTitleAndButton();
        const workoutsData = isOddDays ? data.workouts : data.alternateWorkouts;
        renderWorkoutTable(workoutsData, workouts);

        // Add event listener for toggle button
        document.getElementById("toggle-button").addEventListener("click", () => {
            isOddDays = !isOddDays; // Ubah status
            localStorage.setItem(TOGGLE_STATUS_KEY, isOddDays); // Simpan status tombol
            updateWorkoutTableTitleAndButton();
            const updatedWorkoutsData = isOddDays ? data.workouts : data.alternateWorkouts;
            renderWorkoutTable(updatedWorkoutsData, workouts);
        });

        // Event listeners for updates
        window.updateTaskStatus = (id, status) => {
            tasks[id] = status;
            localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
            renderChecklist(data.tasks, tasks);
        };

        window.updateWorkoutProgress = (id, progress) => {
            workouts[id] = parseInt(progress);
            localStorage.setItem(WORKOUT_KEY, JSON.stringify(workouts));
            const updatedWorkoutsData = isOddDays ? data.workouts : data.alternateWorkouts;
            renderWorkoutTable(updatedWorkoutsData, workouts);
        };
    })
    .catch(error => console.error("Error loading JSON data:", error));

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

// Render workout table
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

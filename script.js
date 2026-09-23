
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priority");
const categoryInput = document.getElementById("category");
const dueDateInput = document.getElementById("dueDate");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter");

const themeBtn = document.getElementById("themeBtn");
const clearCompletedBtn = document.getElementById("clearCompleted");



let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

let currentFilter = "all";


function saveTasks() {
    localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}


const today = new Date().toISOString().split("T")[0];
dueDateInput.min = today;



taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        priority: priorityInput.value,
        category: categoryInput.value,
        dueDate: dueDateInput.value,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    // Clear form
    taskForm.reset();

    // Focus input again
    taskInput.focus();
});

function renderTasks() {

    taskList.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase().trim();

    let filteredTasks = tasks.filter(function (task) {

        // Filter
        if (currentFilter === "pending" && task.completed) {
            return false;
        }

        if (currentFilter === "completed" && !task.completed) {
            return false;
        }

        // Search
        const searchableText = `
            ${task.text}
            ${task.category}
            ${task.priority}
        `.toLowerCase();

        if (!searchableText.includes(searchTerm)) {
            return false;
        }

        return true;
    });


    // Empty state
    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

        if (tasks.length === 0) {
            emptyState.querySelector("h3").textContent = "No tasks yet";
            emptyState.querySelector("p").textContent =
                "Add your first task and start being productive!";
        } else {
            emptyState.querySelector("h3").textContent =
                "No matching tasks";

            emptyState.querySelector("p").textContent =
                "Try another search or filter.";
        }

    } else {

        emptyState.style.display = "none";

        filteredTasks.forEach(function (task) {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    updateStats();
}


function createTaskElement(task) {

    const taskDiv = document.createElement("div");

    taskDiv.className = "task";

    if (task.completed) {
        taskDiv.classList.add("completed");
    }

    taskDiv.dataset.id = task.id;


    // Check button
    const checkButton = document.createElement("button");

    checkButton.className = "check";
    checkButton.type = "button";
    checkButton.dataset.action = "complete";
    checkButton.textContent = task.completed ? "✓" : "";


    // Task content
    const contentDiv = document.createElement("div");
    contentDiv.className = "task-content";


    // Task title
    const title = document.createElement("div");

    title.className = "task-title";
    title.textContent = task.text;


    // Meta information
    const meta = document.createElement("div");
    meta.className = "task-meta";


    // Priority badge
    const priorityBadge = document.createElement("span");

    priorityBadge.className =
        `badge priority-${task.priority}`;

    priorityBadge.textContent =
        getPriorityLabel(task.priority);


    // Category
    const categoryBadge = document.createElement("span");

    categoryBadge.className = "badge category";

    categoryBadge.textContent =
        getCategoryLabel(task.category);


    meta.appendChild(priorityBadge);
    meta.appendChild(categoryBadge);


    // Due date
    if (task.dueDate) {

        const dueDate = document.createElement("span");

        dueDate.className = "due-date";

        dueDate.textContent =
            "📅 " + formatDate(task.dueDate);

        meta.appendChild(dueDate);
    }


    // Add content
    contentDiv.appendChild(title);
    contentDiv.appendChild(meta);


    // Actions
    const actions = document.createElement("div");

    actions.className = "task-actions";


    // Edit button
    const editButton = document.createElement("button");

    editButton.className = "edit-btn";
    editButton.type = "button";
    editButton.dataset.action = "edit";
    editButton.textContent = "✏️";


    // Delete button
    const deleteButton = document.createElement("button");

    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "🗑️";


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);


    // Build task
    taskDiv.appendChild(checkButton);
    taskDiv.appendChild(contentDiv);
    taskDiv.appendChild(actions);


    return taskDiv;
}

taskList.addEventListener("click", function (event) {

    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const taskElement = button.closest(".task");

    if (!taskElement) {
        return;
    }

    const taskId = Number(taskElement.dataset.id);

    const action = button.dataset.action;


    // Complete
    if (action === "complete") {

        const task = tasks.find(function (item) {
            return item.id === taskId;
        });

        if (task) {
            task.completed = !task.completed;
        }

        saveTasks();
        renderTasks();
    }


    // Edit
    if (action === "edit") {

        const task = tasks.find(function (item) {
            return item.id === taskId;
        });

        if (!task) {
            return;
        }

        const updatedText = prompt(
            "Edit your task:",
            task.text
        );

        if (updatedText !== null) {

            const cleanText = updatedText.trim();

            if (cleanText !== "") {
                task.text = cleanText;
                saveTasks();
                renderTasks();
            }
        }
    }


    // Delete
    if (action === "delete") {

        const confirmDelete = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) {
            return;
        }

        tasks = tasks.filter(function (item) {
            return item.id !== taskId;
        });

        saveTasks();
        renderTasks();
    }

});


filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        filterButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();
    });

});


searchInput.addEventListener("input", function () {
    renderTasks();
});



function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    const pending = total - completed;


    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;


    // Progress
    let progress = 0;

    if (total > 0) {
        progress = Math.round((completed / total) * 100);
    }

    progressText.textContent = progress + "%";
    progressFill.style.width = progress + "%";
}


clearCompletedBtn.addEventListener("click", function () {

    const completedCount = tasks.filter(function (task) {
        return task.completed;
    }).length;


    if (completedCount === 0) {
        return;
    }


    const confirmClear = confirm(
        "Clear all completed tasks?"
    );


    if (!confirmClear) {
        return;
    }


    tasks = tasks.filter(function (task) {
        return !task.completed;
    });


    saveTasks();
    renderTasks();
});

function updateThemeIcon() {

    if (document.body.classList.contains("dark")) {
        themeBtn.textContent = "☀️";
    } else {
        themeBtn.textContent = "🌙";
    }
}


themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem("taskflowTheme", isDark ? "dark" : "light");

    updateThemeIcon();
});


// Load saved theme
const savedTheme =
    localStorage.getItem("taskflowTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
}

updateThemeIcon();


function getPriorityLabel(priority) {

    const labels = {
        low: "🟢 Low",
        medium: "🟡 Medium",
        high: "🔴 High"
    };

    return labels[priority] || "🟡 Medium";
}


function getCategoryLabel(category) {

    const labels = {
        personal: "👤 Personal",
        work: "💼 Work",
        study: "📚 Study",
        shopping: "🛒 Shopping"
    };

    return labels[category] || category;
}


function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

renderTasks();
document.addEventListener("DOMContentLoaded", function() {
    loadTasks();
    setupFormListeners();
});

// Setup form event listeners
function setupFormListeners() {
    const taskForm = document.getElementById("task-form");

    if (taskForm) {
        taskForm.addEventListener("submit", function(e) {
            e.preventDefault();
            addTask();
        });
    } else {
        console.error("Task form not found.");
    }

    document.querySelectorAll('.edit-form').forEach(form => {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            updateTask(e.target);
        });
    });
}

function renderTaskItem(task) {
    const startDate = new Date(task.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endDate = new Date(task.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const statusBadge = task.completed ? 
        `<span class="status-badge completed">Completed</span>` : 
        `<span class="status-badge pending">Pending</span>`;
    
    return `
        <li class="task-item ${task.completed ? 'completed-task' : ''}">
            <div class="task-content">
                <h3 class="task-title">${task.task_name}</h3>
                <div class="task-dates">
                    <span class="date-badge start-date">
                        <i class="fas fa-calendar-alt"></i> 
                        ${startDate}
                    </span>
                    <span class="date-separator">→</span>
                    <span class="date-badge end-date">
                        <i class="fas fa-calendar-check"></i> 
                        ${endDate}
                    </span>
                    ${statusBadge}
                </div>
            </div>
            <div class="task-actions">
                ${!task.completed ? `<button onclick="markAsDone(${task.id})" class="btn done-btn" title="Mark as Done">
                    <i class="fas fa-check"></i>
                </button>` : ''}
                <button onclick="toggleEditForm(${task.id})" class="btn edit-btn" title="Edit Task">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTask(${task.id})" class="btn delete-btn" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <form class="edit-form" id="edit-form-${task.id}" data-task-id="${task.id}">
                <div class="form-group">
                    <label for="edit-name-${task.id}">Task Name</label>
                    <input type="text" id="edit-name-${task.id}" name="task_name" value="${task.task_name}" required>
                </div>
                <div class="form-group date-group">
                    <div class="date-input">
                        <label for="edit-start-${task.id}">Start Date</label>
                        <input type="date" id="edit-start-${task.id}" name="start_date" value="${task.start_date}" required>
                    </div>
                    <div class="date-input">
                        <label for="edit-end-${task.id}">End Date</label>
                        <input type="date" id="edit-end-${task.id}" name="end_date" value="${task.end_date}" required>
                    </div>
                </div>
                <div class="edit-actions">
                    <button type="button" onclick="toggleEditForm(${task.id})" class="btn cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" class="btn save-btn">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </form>
        </li>
    `;
}

// Fetch all tasks and display them
function loadTasks() {
    return fetch("../api/task_api.php")
        .then(response => response.json())
        .then(data => {
            const taskList = document.getElementById("task-list");
            const completedTaskList = document.getElementById("completed-task-list");
            
            if (!taskList || !completedTaskList) {
                console.error("Task list elements not found!");
                return;
            }
            
            taskList.innerHTML = "";
            completedTaskList.innerHTML = "";

            if (data.status === "success" && data.tasks && data.tasks.length > 0) {
                const pendingTasks = data.tasks.filter(task => !task.completed);
                const completedTasks = data.tasks.filter(task => task.completed);

                // Render pending tasks
                if (pendingTasks.length === 0) {
                    taskList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-clipboard-list empty-icon"></i>
                            <p>No pending tasks. Add a new task to get started!</p>
                        </div>
                    `;
                } else {
                    taskList.innerHTML = pendingTasks.map(renderTaskItem).join('');
                }

                // Render completed tasks
                if (completedTasks.length === 0) {
                    completedTaskList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-check-circle empty-icon"></i>
                            <p>No completed tasks yet.</p>
                        </div>
                    `;
                } else {
                    completedTaskList.innerHTML = completedTasks.map(renderTaskItem).join('');
                }
                
                setupFormListeners();
            }
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
            const taskList = document.getElementById("task-list");
            const completedTaskList = document.getElementById("completed-task-list");
            
            const errorMessage = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle empty-icon"></i>
                    <p>Error loading tasks. Please try refreshing the page.</p>
                </div>
            `;
            
            if (taskList) taskList.innerHTML = errorMessage;
            if (completedTaskList) completedTaskList.innerHTML = errorMessage;
            
            return Promise.reject(error);
        });
}

// Add a new task
function addTask() {
    const submitButton = document.querySelector('#task-form button[type="submit"]');
    
    if (submitButton.disabled) {
        return;
    }
    
    const taskName = document.getElementById("task-name").value.trim();
    const startDate = document.getElementById("start-date").value.trim();
    const endDate = document.getElementById("end-date").value.trim();

    if (!taskName || !startDate || !endDate) {
        alert("Please fill in all fields.");
        return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    const formData = new FormData();
    formData.append('task_name', taskName);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);

    fetch("../api/task_api.php", {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            document.getElementById("task-form").reset();
            return loadTasks().then(() => {
                alert('Task added successfully!');
            });
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error adding task:', error);
        alert('Failed to add task. Please try again. Error: ' + error.message);
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-plus"></i> Add Task';
    });
}

// Mark a task as done
function markAsDone(id) {
    if (!confirm('Are you sure you want to mark this task as done?')) {
        return;
    }

    fetch(`../api/task_api.php?action=mark_as_done&id=${id}`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            return loadTasks().then(() => {
                alert('Task marked as done!');
            });
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error marking task as done:', error);
        alert('Failed to mark task as done. Please try again. Error: ' + error.message);
    });
}

// Delete a task
function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    fetch(`../api/task_api.php?id=${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            return loadTasks().then(() => {
                alert('Task deleted successfully!');
            });
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again. Error: ' + error.message);
    });
}

// Toggle edit form visibility
function toggleEditForm(id) {
    const editForm = document.getElementById(`edit-form-${id}`);
    if (editForm.style.display === 'none' || editForm.style.display === '') {
        editForm.style.display = 'flex';
    } else {
        editForm.style.display = 'none';
    }
}

// Update a task
function updateTask(form) {
    const id = form.getAttribute('data-task-id');
    const taskName = form.querySelector('input[name="task_name"]').value.trim();
    const startDate = form.querySelector('input[name="start_date"]').value.trim();
    const endDate = form.querySelector('input[name="end_date"]').value.trim();

    if (new Date(startDate) > new Date(endDate)) {
        alert("End date must be after start date");
        return;
    }

    if (!taskName || !startDate || !endDate) {
        alert("Please fill in all fields.");
        return;
    }

    const data = { id, task_name: taskName, start_date: startDate, end_date: endDate };

    fetch("../api/task_api.php", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            toggleEditForm(id);
            return loadTasks().then(() => {
                alert('Task updated successfully!');
            });
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error updating task:', error);
        alert('Failed to update task. Please try again. Error: ' + error.message);
    });
}
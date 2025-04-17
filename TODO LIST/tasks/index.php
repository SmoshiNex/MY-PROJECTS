<?php
include '../api/database.php';

$database = new Database();
$conn = $database->getConnection();

// Fetch All Tasks
$tasks = [];
$sql = "SELECT * FROM tasks ORDER BY completed ASC, end_date ASC";
$stmt = $conn->prepare($sql);
$stmt->execute();
$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Split tasks into pending and completed
$pendingTasks = array_filter($tasks, fn($task) => !$task['completed']);
$completedTasks = array_filter($tasks, fn($task) => $task['completed']);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>To-Do List Manager</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../style/style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>To-Do List Manager</h1>
        </header>
        
        <div class="card">
            <form id="task-form">
                <div class="form-group">
                    <input type="text" id="task-name" placeholder="Task Name" required>
                </div>
                <div class="form-group date-group">
                    <div class="date-input">
                        <label for="start-date">Start Date</label>
                        <input type="date" id="start-date" required>
                    </div>
                    <div class="date-input">
                        <label for="end-date">End Date</label>
                        <input type="date" id="end-date" required>
                    </div>
                </div>
                <button type="submit" class="btn add-btn"><i class="fas fa-plus"></i> Add Task</button>
            </form>
        </div>
        
        <!-- Pending Tasks Container -->
        <div class="tasks-container">
            <h2>Pending Tasks</h2>
            <ul id="task-list">
                <!-- JavaScript will populate this -->
            </ul>
        </div>

        <!-- Completed Tasks Container -->
        <div class="tasks-container completed-container">
            <h2>Completed Tasks</h2>
            <ul id="completed-task-list">
                <!-- JavaScript will populate this -->
            </ul>
        </div>
    </div>
    <script src="../tasks/task.js"></script>
</body>
</html>
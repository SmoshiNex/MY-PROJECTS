<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'database.php';
include '../class/task.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

// Initialize Task class
$task = new Task($db);

// Get HTTP method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $tasks = $task->getAllTasks();
        echo json_encode(["status" => "success", "tasks" => $tasks]);
        break;

    case 'POST':
        $data = $_POST;

        if (!isset($data['task_name']) || !isset($data['start_date']) || !isset($data['end_date'])) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Missing required fields. Please provide task_name, start_date, and end_date."
            ]);
            break;
        }

        try {
            $result = $task->addTask($data['task_name'], $data['start_date'], $data['end_date']);
            if ($result) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Task created successfully",
                    "task_id" => $result
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    "status" => "error",
                    "message" => "Failed to create task"
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Error creating task: " . $e->getMessage()
            ]);
        }
        break;

    case 'PUT':
        // For Mark as Done action
        if (isset($_GET['action']) && $_GET['action'] === 'mark_as_done') {
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode([
                    "status" => "error",
                    "message" => "Missing task ID."
                ]);
                break;
            }
            try {
                $result = $task->markAsDone($_GET['id']);
                if ($result) {
                    echo json_encode([
                        "status" => "success",
                        "message" => "Task marked as done successfully"
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        "status" => "error",
                        "message" => "Task not found"
                    ]);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    "status" => "error",
                    "message" => "Error marking task as done: " . $e->getMessage()
                ]);
            }
            break;
        }
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id']) || !isset($data['task_name']) || !isset($data['start_date']) || !isset($data['end_date'])) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Missing required fields. Please provide id, task_name, start_date, and end_date."
            ]);
            break;
        }
        try {
            $result = $task->updateTask($data['id'], $data['task_name'], $data['start_date'], $data['end_date']);
            if ($result) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Task updated successfully"
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    "status" => "error",
                    "message" => "Task not found or no changes made"
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Error updating task: " . $e->getMessage()
            ]);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Missing task ID."
            ]);
            break;
        }
        try {
            $result = $task->deleteTask($_GET['id']);
            if ($result) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Task deleted successfully"
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    "status" => "error",
                    "message" => "Task not found"
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Error deleting task: " . $e->getMessage()
            ]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode([
            "status" => "error",
            "message" => "Invalid request method"
        ]);
}
?>

<?php
class Task
{
    private $conn;
    private $table = 'tasks';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Fetch all tasks
    public function getAllTasks()
    {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Add a new task
    public function addTask($task_name, $start_date, $end_date)
    {
        if (empty($task_name) || empty($start_date) || empty($end_date)) {
            throw new Exception("Task name, start date, and end date are required.");
        }
        $query = "INSERT INTO " . $this->table . " SET task_name = ?, start_date = ?, end_date = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$task_name, $start_date, $end_date]);
        return $this->conn->lastInsertId();
    }

    // Update a task
    public function updateTask($id, $task_name, $start_date, $end_date)
    {
        if (empty($task_name) || empty($start_date) || empty($end_date)) {
            throw new Exception("Task name, start date, and end date are required.");
        }
        $query = "UPDATE " . $this->table . " SET task_name = ?, start_date = ?, end_date = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$task_name, $start_date, $end_date, $id]);
        return $stmt->rowCount();
    }

    // Mark a task as done
    public function markAsDone($id)
    {
        $query = "UPDATE " . $this->table . " SET completed = TRUE WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }

    // Delete a task
    public function deleteTask($id)
    {
        $query = "DELETE FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
?>

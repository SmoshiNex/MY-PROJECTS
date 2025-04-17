<?php
class Dbtest
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function checkConnection()
    {
        if ($this->conn) {
            return ["status" => "success", "message" => "Database connected successfully"];
        } else {
            return ["status" => "error", "message" => "Failed to connect to the database"];
        }
    }
}
?>

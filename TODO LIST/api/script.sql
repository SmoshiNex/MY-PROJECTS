CREATE DATABASE IF NOT EXISTS todo_list_manager;

USE todo_list_manager;

CREATE TABLE
    tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        completed BOOLEAN DEFAULT FALSE
    );
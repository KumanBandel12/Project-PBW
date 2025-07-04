<?php
class Database {
    private $host = "localhost";
    private $db_name = "ngapain_db";
    private $username = "root"; // sesuaikan dengan username database Anda
    private $password = ""; // sesuaikan dengan password database Anda
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Database connection error: " . $exception->getMessage()));
            exit; // Hentikan eksekusi jika koneksi gagal
        }
        return $this->conn;
    }
}
?>

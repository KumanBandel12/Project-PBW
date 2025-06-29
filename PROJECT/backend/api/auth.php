<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Pastikan path ke database.php sudah benar
include_once '../config/database.php'; 

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'POST':
        if(isset($input['action'])) {
            switch($input['action']) {
                case 'register':
                    register($db, $input);
                    break;
                case 'login':
                    login($db, $input);
                    break;
                case 'delete_account':
                    delete_account($db, $input);
                    break;
                case 'test':
                    http_response_code(200);
                    echo json_encode(array("success" => true, "message" => "API is responding"));
                    break;
                default:
                    http_response_code(400);
                    echo json_encode(array("success" => false, "message" => "Invalid action"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Action is not specified"));
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
}

function register($db, $data) {
    try {
        if(empty($data['nama']) || empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Semua field harus diisi"));
            return;
        }

        $check_query = "SELECT user_id FROM users WHERE email = :email AND delete_at IS NULL";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":email", $data['email']);
        $check_stmt->execute();

        if($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Email sudah terdaftar"));
            return;
        }

        $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);

        $query = "INSERT INTO users (nama, email, password, create_at) VALUES (:nama, :email, :password, NOW())";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":nama", $data['nama']);
        $stmt->bindParam(":email", $data['email']);
        $stmt->bindParam(":password", $hashed_password);

        if($stmt->execute()) {
            $user_id = $db->lastInsertId();
            echo json_encode(array(
                "success" => true, 
                "message" => "Registrasi berhasil",
                "user_id" => $user_id
            ));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Gagal mendaftar"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Error: " . $e->getMessage()));
    }
}

function login($db, $data) {
    try {
        if(empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Email dan password harus diisi"));
            return;
        }

        $query = "SELECT user_id, nama, email, password FROM users WHERE email = :email AND delete_at IS NULL";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $data['email']);
        $stmt->execute();

        if($stmt->rowCount() == 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(password_verify($data['password'], $user['password'])) {
                $update_query = "UPDATE users SET last_login = NOW() WHERE user_id = :user_id";
                $update_stmt = $db->prepare($update_query);
                $update_stmt->bindParam(":user_id", $user['user_id']);
                $update_stmt->execute();

                $token = bin2hex(random_bytes(32));
                
                echo json_encode(array(
                    "success" => true,
                    "message" => "Login berhasil",
                    "user" => array(
                        "user_id" => $user['user_id'],
                        "nama" => $user['nama'],
                        "email" => $user['email']
                    ),
                    "token" => $token
                ));
            } else {
                http_response_code(401);
                echo json_encode(array("success" => false, "message" => "Password salah"));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("success" => false, "message" => "Email tidak ditemukan"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Error: " . $e->getMessage()));
    }
}

// Fungsi baru untuk soft delete akun
function delete_account($db, $data) {
    try {
        if (empty($data['user_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required.']);
            return;
        }

        $user_id = $data['user_id'];

        // Gunakan NOW() atau CURRENT_TIMESTAMP untuk mengisi kolom delete_at
        $query = "UPDATE users SET delete_at = NOW() WHERE user_id = :user_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Account successfully marked for deletion.']);
            } else {
                // Kemungkinan user_id tidak ditemukan
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'User not found.']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete account.']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}
?>
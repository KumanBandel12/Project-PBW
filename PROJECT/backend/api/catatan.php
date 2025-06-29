<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : (isset($input['user_id']) ? $input['user_id'] : null);

if(!$user_id) {
    http_response_code(401);
    echo json_encode(array("message" => "User ID required"));
    exit;
}

switch($method) {
    case 'GET':
        getCatatan($db, $user_id);
        break;
    case 'POST':
        createCatatan($db, $input, $user_id);
        break;
    case 'PUT':
        updateCatatan($db, $input, $user_id);
        break;
    case 'DELETE':
        deleteCatatan($db, $input, $user_id);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
}

function getCatatan($db, $user_id) {
    try {
        $query = "SELECT * FROM catatan WHERE user_id = :user_id ORDER BY dates DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        
        $catatan_list = array();
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $catatan_item = array(
                "id" => $row['catatan_id'],
                "title" => $row['judul'],
                "content" => $row['deskripsi'],
                "category" => ucfirst($row['kategori']),
                "isPinned" => false, // Bisa ditambahkan field di database
                "createdAt" => $row['dates'] . 'T00:00:00.000Z',
                "updatedAt" => $row['dates'] . 'T00:00:00.000Z'
            );
            $catatan_list[] = $catatan_item;
        }
        
        echo json_encode($catatan_list);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $e->getMessage()));
    }
}

function createCatatan($db, $data, $user_id) {
    try {
        $query = "INSERT INTO catatan (user_id, judul, deskripsi, kategori, dates) 
                  VALUES (:user_id, :judul, :deskripsi, :kategori, CURDATE())";
        
        $stmt = $db->prepare($query);
        
        // --- PERBAIKAN ---
        $title = $data['title'] ?? 'Tanpa Judul';
        $content = $data['content'] ?? '';
        $category = strtolower($data['category'] ?? 'lainnya');

        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":judul", $title);
        $stmt->bindParam(":deskripsi", $content);
        $stmt->bindParam(":kategori", $category);
        
        if($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Catatan berhasil dibuat"));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Gagal membuat catatan"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Error: " . $e->getMessage()));
    }
}

function updateCatatan($db, $data, $user_id) {
    try {
        $query = "UPDATE catatan SET judul = :judul, deskripsi = :deskripsi, kategori = :kategori
                  WHERE catatan_id = :catatan_id AND user_id = :user_id";
        
        $stmt = $db->prepare($query);
        
        // --- PERBAIKAN ---
        $id = $data['id'] ?? 0;
        $title = $data['title'] ?? 'Tanpa Judul';
        $content = $data['content'] ?? '';
        $category = strtolower($data['category'] ?? 'lainnya');
        
        $stmt->bindParam(":catatan_id", $id);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":judul", $title);
        $stmt->bindParam(":deskripsi", $content);
        $stmt->bindParam(":kategori", $category);
        
        if($stmt->execute()) {
            echo json_encode(array("success" => true, "message" => "Catatan berhasil diupdate"));
        } else {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Gagal mengupdate catatan"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Error: " . $e->getMessage()));
    }
}


function deleteCatatan($db, $data, $user_id) {
    try {
        // Ambil data catatan sebelum dihapus
        $select_query = "SELECT * FROM catatan WHERE catatan_id = :catatan_id AND user_id = :user_id";
        $select_stmt = $db->prepare($select_query);
        $select_stmt->bindParam(":catatan_id", $data['id']);
        $select_stmt->bindParam(":user_id", $user_id);
        $select_stmt->execute();
        
        if($select_stmt->rowCount() > 0) {
            $catatan = $select_stmt->fetch(PDO::FETCH_ASSOC);
            
            // Siapkan data asli untuk disimpan
            $data_asli = [
                'catatan_id' => $catatan['catatan_id'],
                'judul' => $catatan['judul'],
                'deskripsi' => $catatan['deskripsi'],
                'kategori' => $catatan['kategori'],
                'dates' => $catatan['dates']
            ];
            
            // Masukkan ke sampah
            $sampah_query = "INSERT INTO Sampah (user_id, catatan_id, tipe, dihapus_pada, kadaluarsa_pada, data_asli) 
                            VALUES (:user_id, :catatan_id, 'catatan', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), :data_asli)";
            $sampah_stmt = $db->prepare($sampah_query);
            $sampah_stmt->bindParam(":user_id", $user_id);
            $sampah_stmt->bindParam(":catatan_id", $data['id']);
            $sampah_stmt->bindValue(":data_asli", json_encode($data_asli));
            $sampah_stmt->execute();
            
            // Hapus catatan
            $delete_query = "DELETE FROM catatan WHERE catatan_id = :catatan_id AND user_id = :user_id";
            $delete_stmt = $db->prepare($delete_query);
            $delete_stmt->bindParam(":catatan_id", $data['id']);
            $delete_stmt->bindParam(":user_id", $user_id);
            
            if($delete_stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Catatan berhasil dihapus"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Gagal menghapus catatan"]);
            }
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Catatan tidak ditemukan"]);
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}
?>

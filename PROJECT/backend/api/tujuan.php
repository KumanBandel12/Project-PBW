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

// Fungsi untuk membuat subtujuan
function createSubtujuan($db, $tujuan_id, $task) {
    $query = "INSERT INTO subtujuan (tujuan_id, judul, prioritas, date_end, finish) VALUES (:tujuan_id, :judul, :prioritas, :date_end, :finish)";
    $stmt = $db->prepare($query);
    
    $title = $task['title'] ?? 'Tanpa Judul';
    $priority = strtolower($task['priority'] ?? 'medium');
    $deadline = $task['deadline'] ?? null;
    $completed = !empty($task['completed']);

    $stmt->bindParam(':tujuan_id', $tujuan_id);
    $stmt->bindParam(':judul', $title);
    $stmt->bindParam(':prioritas', $priority);
    $stmt->bindParam(':date_end', $deadline);
    $stmt->bindParam(':finish', $completed, PDO::PARAM_BOOL);
    
    $stmt->execute();
}


switch($method) {
    case 'GET':
        getTujuan($db, $user_id);
        break;
    case 'POST':
        createTujuan($db, $input, $user_id);
        break;
    case 'PUT':
        updateTujuan($db, $input, $user_id);
        break;
    case 'DELETE':
        deleteTujuan($db, $input, $user_id);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
}

function getTujuan($db, $user_id) {
    try {
        $query = "SELECT t.tujuan_id, t.judul, t.deskripsi, t.kategori, t.date_start, t.date_end, t.progres, t.finish,
                  (SELECT COUNT(*) FROM subtujuan s WHERE s.tujuan_id = t.tujuan_id) as total_subtujuan,
                  (SELECT COUNT(*) FROM subtujuan s WHERE s.tujuan_id = t.tujuan_id AND s.finish = 1) as completed_subtujuan
                  FROM tujuan t 
                  WHERE t.user_id = :user_id 
                  ORDER BY t.date_start DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        
        $tujuan_list = array();
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $progress = 0;
            if ($row['finish']) {
                $progress = 100;
            } elseif ($row['total_subtujuan'] > 0) {
                $progress = round(($row['completed_subtujuan'] / $row['total_subtujuan']) * 100);
            } else {
                $progress = $row['progres'];
            }
            
            $sub_query = "SELECT * FROM subtujuan WHERE tujuan_id = :tujuan_id ORDER BY date_end ASC";
            $sub_stmt = $db->prepare($sub_query);
            $sub_stmt->bindParam(":tujuan_id", $row['tujuan_id']);
            $sub_stmt->execute();
            $subtujuan = $sub_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $tujuan_item = array(
                "id" => $row['tujuan_id'],
                "title" => $row['judul'],
                "description" => $row['deskripsi'],
                "category" => ucfirst($row['kategori']),
                "startDate" => $row['date_start'],
                "targetDate" => $row['date_end'],
                "progress" => (int)$progress,
                "completed" => (bool)$row['finish'],
                "tasks" => array_map(function($sub) {
                    return array(
                        "id" => $sub['subtujuan_id'],
                        "title" => $sub['judul'],
                        "priority" => ucfirst($sub['prioritas']),
                        "deadline" => $sub['date_end'],
                        "completed" => (bool)$sub['finish']
                    );
                }, $subtujuan)
            );
            $tujuan_list[] = $tujuan_item;
        }
        echo json_encode($tujuan_list);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $e->getMessage()));
    }
}

function createTujuan($db, $data, $user_id) {
    $db->beginTransaction();
    try {
        $query = "INSERT INTO tujuan (user_id, judul, deskripsi, kategori, date_start, date_end, finish, progres) 
                  VALUES (:user_id, :judul, :deskripsi, :kategori, :date_start, :date_end, :finish, :progres)";
        $stmt = $db->prepare($query);

        $title = $data['title'] ?? 'Tanpa Judul';
        $description = $data['description'] ?? '';
        $category = strtolower($data['category'] ?? 'lainnya');
        $startDate = $data['startDate'] ?? null;
        $targetDate = $data['targetDate'] ?? null;
        $completed = !empty($data['completed']);
        $progress = $data['progress'] ?? 0;

        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":judul", $title);
        $stmt->bindParam(":deskripsi", $description);
        $stmt->bindParam(":kategori", $category);
        $stmt->bindParam(":date_start", $startDate);
        $stmt->bindParam(":date_end", $targetDate);
        $stmt->bindParam(":finish", $completed, PDO::PARAM_BOOL);
        $stmt->bindParam(":progres", $progress);
        
        $stmt->execute();
        $tujuan_id = $db->lastInsertId();

        if (isset($data['tasks']) && is_array($data['tasks'])) {
            foreach($data['tasks'] as $task) {
                createSubtujuan($db, $tujuan_id, $task);
            }
        }
        
        $db->commit();
        echo json_encode(["success" => true, "message" => "Tujuan berhasil dibuat", "id" => $tujuan_id]);
    } catch(Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}


function updateTujuan($db, $data, $user_id) {
    // Memulai transaksi
    $db->beginTransaction();

    try {
        // 1. Update tabel tujuan utama
        $query_tujuan = "UPDATE tujuan SET judul = :judul, deskripsi = :deskripsi, kategori = :kategori, 
                         date_start = :date_start, date_end = :date_end, finish = :finish, progres = :progres
                         WHERE tujuan_id = :tujuan_id AND user_id = :user_id";
        
        $stmt_tujuan = $db->prepare($query_tujuan);

        $id = $data['id'] ?? 0;
        $title = $data['title'] ?? 'Tanpa Judul';
        $description = $data['description'] ?? '';
        $category = strtolower($data['category'] ?? 'lainnya');
        $startDate = $data['startDate'] ?? null;
        $targetDate = $data['targetDate'] ?? null;
        $completed = !empty($data['completed']);
        $progress = $data['progress'] ?? 0;
        
        $stmt_tujuan->bindParam(":tujuan_id", $id);
        $stmt_tujuan->bindParam(":user_id", $user_id);
        $stmt_tujuan->bindParam(":judul", $title);
        $stmt_tujuan->bindParam(":deskripsi", $description);
        $stmt_tujuan->bindParam(":kategori", $category);
        $stmt_tujuan->bindParam(":date_start", $startDate);
        $stmt_tujuan->bindParam(":date_end", $targetDate);
        $stmt_tujuan->bindParam(":finish", $completed, PDO::PARAM_BOOL);
        $stmt_tujuan->bindParam(":progres", $progress);

        $stmt_tujuan->execute();

        // 2. Update atau buat subtujuan
        if (isset($data['tasks']) && is_array($data['tasks'])) {
            $query_subtujuan = "UPDATE subtujuan SET finish = :finish WHERE subtujuan_id = :subtujuan_id AND tujuan_id = :tujuan_id";
            $stmt_subtujuan = $db->prepare($query_subtujuan);

            foreach ($data['tasks'] as $task) {
                if (isset($task['id'])) {
                    $sub_completed = !empty($task['completed']);
                    $stmt_subtujuan->bindParam(":finish", $sub_completed, PDO::PARAM_BOOL);
                    $stmt_subtujuan->bindParam(":subtujuan_id", $task['id']);
                    $stmt_subtujuan->bindParam(":tujuan_id", $id);
                    $stmt_subtujuan->execute();
                } else {
                    // Jika task belum punya ID, berarti ini task baru
                    createSubtujuan($db, $id, $task);
                }
            }
        }
        
        // Jika semua berjalan lancar, commit transaksi
        $db->commit();
        echo json_encode(array("success" => true, "message" => "Tujuan berhasil diupdate"));

    } catch(Exception $e) {
        // Jika ada error, rollback semua perubahan
        $db->rollBack();
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Error: " . $e->getMessage()));
    }
}


function deleteTujuan($db, $data, $user_id) {
    try {
        $tujuan_id = $data['id'];
        
        $select_query = "SELECT * FROM tujuan WHERE tujuan_id = :tujuan_id AND user_id = :user_id";
        $select_stmt = $db->prepare($select_query);
        $select_stmt->bindParam(":tujuan_id", $tujuan_id);
        $select_stmt->bindParam(":user_id", $user_id);
        $select_stmt->execute();
        
        if($select_stmt->rowCount() > 0) {
            $tujuan = $select_stmt->fetch(PDO::FETCH_ASSOC);

            // Hapus dari tabel tujuan (ON DELETE CASCADE akan menghapus subtujuan terkait)
            $delete_query = "DELETE FROM tujuan WHERE tujuan_id = :tujuan_id AND user_id = :user_id";
            $delete_stmt = $db->prepare($delete_query);
            $delete_stmt->bindParam(":tujuan_id", $tujuan_id);
            $delete_stmt->bindParam(":user_id", $user_id);
            
            if($delete_stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Tujuan berhasil dihapus"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Gagal menghapus tujuan"]);
            }
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Tujuan tidak ditemukan"]);
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}
?>
<?php

// Required libraries
require '/home/ec2-user/jsthings/vendor/autoload.php';
use \Firebase\JWT\JWT;
require "/home/ec2-user/config/mod5/connect_db.php";

header('Content-Type: application/json');

// Check for a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Input parsing and CSRF check
    $content = json_decode(file_get_contents('php://input'), true);
    $javascript_token_input = $content['sent_csrf_token'];

    if ($_SESSION['csrf_token'] !== $javascript_token_input) {
        echo json_encode(['success' => false, 'message' => "Invalid CSRF token", 'csrf_hacker' => true]);
        exit(); // Stop script execution if CSRF check fails
    }

    // Preventing XSS attacks
    $currentevent_id = htmlspecialchars($content['event_id']);
    $currentuser = htmlspecialchars($content['username']);

    // Retrieve user ID
    $query = "SELECT id FROM users WHERE username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $currentuser);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 0) {
        echo json_encode(['success' => false, 'message' => "User not found.", 'csrf_hacker' => false]);
        exit();
    }

    $user = $result->fetch_assoc();
    $userId = $user['id'];

    // Check ownership of the event or if it's shared with the user
    $query = "SELECT e.id FROM events e WHERE e.id = ? AND e.user_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ii', $currentevent_id, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Delete shared event records, if any
        $query = "DELETE FROM event_shares WHERE event_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $currentevent_id);
        $stmt->execute();
        
        // User is the owner, delete the event
        $query = "DELETE FROM events WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $currentevent_id);
        $stmt->execute();
        
        
        
        // Generate JWT
        $iat = time();
        $exp = $iat + 3600;
        $payload = array(
            'userid' => $userId,
            'username' => $currentuser,
            'iat' => $iat,
            'exp' => $exp,
        );
        $jwt = JWT::encode($payload, $secret_key, 'HS256');

        // Cleanup
        $stmt->close();

        // Success response for event owner
        echo json_encode(['success' => true, 'message' => "Your event was deleted successfully.", 'token' => $jwt, 'csrf_hacker' => false]);
    } else {
        // The user is not the owner, check if they are an invitee
        $query = "SELECT * FROM event_shares WHERE event_id = ? AND user_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('ii', $currentevent_id, $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // User is an invitee, remove the event from their view
            $query = "DELETE FROM event_shares WHERE event_id = ? AND user_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param('ii', $currentevent_id, $userId);
            if ($stmt->execute()) {

                // Generate JWT
                $iat = time();
                $exp = $iat + 3600;
                $payload = array(
                    'userid' => $userId,
                    'username' => $currentuser,
                    'iat' => $iat,
                    'exp' => $exp,
                );
                $jwt = JWT::encode($payload, $secret_key, 'HS256');

                // Cleanup
                $stmt->close();

                // Success response for invitee
                echo json_encode(['success' => true, 'message' => "Your event was deleted successfully.", 'token' => $jwt, 'csrf_hacker' => false]);
            } else {
                echo json_encode(['success' => false, 'message' => "Failed to remove event from your view.", 'csrf_hacker' => false]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => "Event not found or you don't have permission to delete it.", 'csrf_hacker' => false]);
        }
    }

    // Close connection
    mysqli_close($conn);
} else {
    // Not a POST request
    echo json_encode(['success' => false, 'message' => "Invalid request method.", 'csrf_hacker' => false]);
}

?>
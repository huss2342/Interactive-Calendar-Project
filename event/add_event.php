<?php
// Import required libraries 
require '/home/ec2-user/jsthings/vendor/autoload.php';
use \Firebase\JWT\JWT;

require "/home/ec2-user/config/mod5/connect_db.php";

header('Content-Type: application/json');

// Get the post request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $content = json_decode(file_get_contents('php://input'), true);

    // Check CSRF token
    $javascript_token_input = $content['sent_csrf_token'];
    if ($_SESSION['csrf_token'] !== $javascript_token_input) {
        echo json_encode(['success' => false, 'message' => "You are a csrf hacker", 'csrf_hacker' => true]);
        exit;
    }

    // Sanitize inputs
    $date = htmlspecialchars($content['date']);
    $time = htmlspecialchars($content['time']);
    $title = htmlspecialchars($content['title']);
    $currentuser = htmlspecialchars($content['username']);
    //get the tag option
    $tag_input = htmlspecialchars($content['sent_tag_option']); //sends the task
    $sharedUsers = $content['sharedUsers']; // Array of usernames to share with

    if (($title !== "") && ($date !== "") && ($time !== "")) {
        // Check if the user exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param('s', $currentuser);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $userId = $result->fetch_object()->id;
            // Insert the new event, including tag
            $stmt = $conn->prepare("INSERT INTO events (user_id, title, date_column, time_column, tags) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param('issss', $userId, $title, $date, $time,  $tag_input);

            if ($stmt->execute()) {
                $eventId = $conn->insert_id; // Get the ID of the newly created event
            
                // Flag to check if any sharing was successful
                $isShared = false;
            
                // Share event with other users
                foreach ($sharedUsers as $username) {
                    $username = htmlspecialchars($username); // Sanitize each username

                    // Skip if username is blank
                    if (trim($username) === '') {
                        continue;
                    }

                    // Get the ID for the shared user
                    $shareStmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
                    $shareStmt->bind_param('s', $username);
                    $shareStmt->execute();
                    $shareResult = $shareStmt->get_result();
            
                    if ($shareResult->num_rows === 1) {
                        $sharedUserId = $shareResult->fetch_object()->id;
                        // Insert shared event
                        $insertShareStmt = $conn->prepare("INSERT INTO event_shares (event_id, user_id) VALUES (?, ?)");
                        $insertShareStmt->bind_param('ii', $eventId, $sharedUserId);
                        if ($insertShareStmt->execute()) {
                            $isShared = true; // Sharing was successful for at least one user
                        }
                    }
                }
                // If the event was shared with at least one user, update the is_shared field
                if ($isShared) {
                    $updateEventStmt = $conn->prepare("UPDATE events SET is_shared = 1 WHERE id = ?");
                    $updateEventStmt->bind_param('i', $eventId);
                    if (!$updateEventStmt->execute()) {
                        error_log('Failed to update is_shared: ' . $updateEventStmt->error); // Log error if the update fails
                    }
                    $updateEventStmt->close(); // Close the statement after executing
                }

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
                // Return success response
                echo json_encode(['success' => true, 'token' => $jwt, 'message' => "Your event has been uploaded to your calendar account database!", 'csrf_hacker' => false]);
            } else {
                echo json_encode(['success' => false, 'message' => "Error in saving event", 'csrf_hacker' => false]);
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => "User not found", 'csrf_hacker' => false]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => "Parameters are empty, please input datafields", 'csrf_hacker' => false]);
    }
} else {
    // Request method not POST
    echo json_encode(['success' => false, 'message' => "Missing required parameters", 'csrf_hacker' => false]);
}

mysqli_close($conn);
?>
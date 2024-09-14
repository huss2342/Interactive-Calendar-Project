
<?php

//required libraries

require '/home/ec2-user/jsthings/vendor/autoload.php';

use \Firebase\JWT\JWT;

require "/home/ec2-user/config/mod5/connect_db.php";

header('Content-Type: application/json');


if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $content = json_decode(file_get_contents('php://input'), true);

    // CSRF token validation
    $javascript_token_input = $content['sent_csrf_token'];
    if ($_SESSION['csrf_token'] !== $javascript_token_input) {
        echo json_encode(['success' => false, 'message' => "Invalid CSRF token", 'csrf_hacker' => true]);
        exit;
    }

    // Sanitize inputs to prevent XSS attacks
    $currentevent_id = htmlspecialchars($content['event_id']);
    $currentuser = htmlspecialchars($content['username']);
    $title = htmlspecialchars($content['title']);
    $date = htmlspecialchars($content['date']);
    $time = htmlspecialchars($content['time']);

    //get the event tag
    $tag = htmlspecialchars($content['sent_tag_option']);
    $sharedUsers = $content['sharedUsers']; // Assume this is an array of usernames with whom the event will be shared

    // Validate user
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    if ($stmt === false) {
        // Handle error, maybe log it somewhere
        die("Failed preparing statement");
    }
    $stmt->bind_param('s', $currentuser);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_object();
        $userId = $user->id;

        // Check if the event belongs to the user before editing
        $ownershipQuery = "SELECT 1 FROM events WHERE id = ? AND user_id = ?";
        $ownershipStmt = $conn->prepare($ownershipQuery);
        $ownershipStmt->bind_param('ii', $currentevent_id, $userId);
        $ownershipStmt->execute();
        $ownershipResult = $ownershipStmt->get_result();

        if ($ownershipResult->num_rows > 0) {
            // Update the event details
            $query = "UPDATE events SET tags = ?, title = ?, date_column = ?, time_column = ? WHERE id = ? AND user_id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param('ssssii', $tag, $title, $date, $time, $currentevent_id, $userId);
            if ($stmt->execute()) {
                // Handle event sharing
                if (isset($sharedUsers) && is_array($sharedUsers)) {
                    foreach ($sharedUsers as $sharedUsername) {
                        $sharedUsername = htmlspecialchars($sharedUsername); // Sanitize each username
                        // Check if the shared user exists
                        $shareStmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
                        $shareStmt->bind_param('s', $sharedUsername);
                        $shareStmt->execute();
                        $shareResult = $shareStmt->get_result();

                        if ($shareResult->num_rows === 1) {
                            $sharedUserId = $shareResult->fetch_object()->id;

                            // Check if the event is already shared with the user
                            $checkSharedEventStmt = $conn->prepare("SELECT 1 FROM event_shares WHERE event_id = ? AND user_id = ?");
                            $checkSharedEventStmt->bind_param('ii', $currentevent_id, $sharedUserId);
                            $checkSharedEventStmt->execute();
                            $checkSharedEventResult = $checkSharedEventStmt->get_result();

                            if ($checkSharedEventResult->num_rows === 0) {
                                // Share the event if not already shared
                                $insertShareStmt = $conn->prepare("INSERT INTO event_shares (event_id, user_id) VALUES (?, ?)");
                                $insertShareStmt->bind_param('ii', $currentevent_id, $sharedUserId);
                                if ($insertShareStmt->execute()) { // after successfully sharing the event
                                    // Update the 'is_shared' field in the 'events' table
                                    $updateEventStmt = $conn->prepare("UPDATE events SET is_shared = 1 WHERE id = ?");
                                    $updateEventStmt->bind_param('i', $currentevent_id);
                                    $updateEventStmt->execute();
                                }
                            }
                        }
                    }
                }

                $response['statusCode'] = 200;
                $iat = time();
                $exp = $iat + 3600;
                $payload = [
                    'userid' => $userId,
                    'username' => $currentuser,
                    'iat' => $iat,
                    'exp' => $exp,
                ];
                $jwt = JWT::encode($payload, $secret_key, 'HS256');
                $stmt->close();

                echo json_encode(['success' => true, 'token' => $jwt, 'message' => "Your event was edited successfully", 'csrf_hacker' => false]);
            } else {
                // Handle failed event update
                echo json_encode(['success' => false, 'message' => "Failed to edit the event", 'csrf_hacker' => false]);
            }
        } else {
            // The event does not belong to the user
            echo json_encode(['success' => false, 'message' => "You are not authorized to edit this event", 'csrf_hacker' => false]);
        }
    } else {
        // The user does not exist
        echo json_encode(['success' => false, 'message' => "User not found", 'csrf_hacker' => false]);
    }
} else {
    // Request is not POST
    echo json_encode(['success' => false, 'message' => "Invalid request", 'csrf_hacker' => false]);
}


?>
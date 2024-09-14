<?php

require '/home/ec2-user/jsthings/vendor/autoload.php';
use \Firebase\JWT\JWT;

include "/home/ec2-user/config/mod5/connect_db.php" ;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Assuming you're getting JSON content
    $content = json_decode(file_get_contents('php://input'), true);
    $username = $content['username'];
    $password = $content['password']; // This should be hashed before storing in the database

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Prepare SQL statement to insert a new user
    if ($stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)")) {
        $stmt->bind_param('ss', $username, $hashed_password);

        // Execute the query
        if ($stmt->execute()) {
            // The "issued at" time
            $iat = time();
            // JWT expiration time (3600 seconds from the issued time)
            $exp = $iat + 3600;

            $payload = array(
                'username' => $username,
                'iat' => $iat,
                'exp' => $exp,
            );
            
            $jwt = JWT::encode($payload, $secret_key, 'HS256');

            // Send back the JWT to the client
            echo json_encode(['success' => true, 'token' => $jwt]);


        } else {
            // Failed to execute the statement
            echo json_encode(['success' => false, 'message' => 'Failed to register the user.']);
        }
    } else {
        // Failed to prepare the statement
        echo json_encode(['success' => false, 'message' => 'Failed to prepare the statement.']);
    }
} else {
    // Request method not POST
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>
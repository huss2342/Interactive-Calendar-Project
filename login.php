<?php
//import needed libraries
require '/home/ec2-user/jsthings/vendor/autoload.php';
use \Firebase\JWT\JWT;

require "/home/ec2-user/config/mod5/connect_db.php" ;

header('Content-Type: application/json');



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Assuming you're getting JSON content
    $content = json_decode(file_get_contents('php://input'), true);
    //Preventing xss attacks       // (trying to filter the user input)
    $username = htmlspecialchars($content['username']);
    $password = htmlspecialchars($content['password']); // This should be hashed before checking against the database



    // Prepare SQL statement
    if ($stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?")) {
        $stmt->bind_param('s', $username);

        // Execute the query
        if ($stmt->execute()) {
            // Bind the result to variables
            $stmt->bind_result($user_id, $db_password);

            // Fetch the result
            $stmt->fetch();

            // Verify password
            if (password_verify($password, $db_password)) {

                 //GENERATE THE CSRF TOKEN STUFF
                $_SESSION['csrf_token'] = bin2hex(openssl_random_pseudo_bytes(32)); // generate a 32-byte random string


                // The "issued at" time
                $iat = time();
                // JWT expiration time (3600 seconds from the issued time)
                $exp = $iat + 3600;

                $payload = array(
                    'userid' => $user_id,
                    'username' => $username,
                    'iat' => $iat,
                    'exp' => $exp,
                );
                $jwt = JWT::encode($payload, $secret_key, 'HS256');

                // Send back the JWT to the client, SEND CSRF TOKEN TO JAVASCRIPT SIDE
                echo json_encode(['success' => true, 'token' => $jwt, 'currentuserid'=> $user_id, 'current_csrf_token' => $_SESSION['csrf_token'] ]);
            } else {
                // Invalid credentials
                echo json_encode(['success' => false, 'message' => 'Invalid username or password.' ]);
            }
        } else {
            // Failed to execute the statement
            echo json_encode(['success' => false, 'message' => 'Failed to execute the statement.']);
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
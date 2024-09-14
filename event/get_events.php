
<?php
//required libraries and files

require '/home/ec2-user/jsthings/vendor/autoload.php';
use \Firebase\JWT\JWT;

require "/home/ec2-user/config/mod5/connect_db.php";


header('Content-Type: application/json');



//get a post request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

      // Assuming you're getting JSON content
      $content = json_decode(file_get_contents('php://input'), true);
      $currentuser = $content['username'];
      
    //try to get the id of the user 
    $query = "SELECT id FROM users WHERE username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $currentuser);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_object();
       
            $userId = $user->id;


            //database query stuff for components
            // this query will get both the user's events and the group
            $query = 
            "SELECT e.id, e.title, e.date_column AS date, e.time_column AS time,e.tags,
            CASE WHEN es.event_id IS NOT NULL THEN 1 ELSE 0 END as is_shared
            FROM events e
            LEFT JOIN event_shares es ON e.id = es.event_id AND es.user_id = ?
            WHERE e.user_id = ? OR es.event_id IS NOT NULL;
            ";

            $stmt = $conn->prepare($query);
            $stmt->bind_param('ii', $userId, $userId); 
            $stmt->execute();
            $result = $stmt->get_result();
            
            $events = array();
            while($row = $result->fetch_assoc()) {
                // Adjust your array to include 'is_shared' information.
                $events[] = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'date' => $row['date'],
                    'time' => $row['time'],
                    'is_shared' => $row['is_shared'] ,// This is the new data field
                    'tags' => $row['tags'] // This is the new data field
                ];
            }
            
            
            $response['statusCode'] = 200;
            
            // The "issued at" time
            $iat = time();
            // JWT expiration time (3600 seconds from the issued time)
            $exp = $iat + 3600;
            
            $payload = array(
                'userid' => $userId,
                'username' =>  $currentuser,
                'iat' => $iat,
                'exp' => $exp,
            );
            $jwt = JWT::encode($payload, $secret_key, 'HS256');
            
            mysqli_close($conn);
            echo json_encode([ 'success' => true , 'token' => $jwt, 'events' => $events, 'message'=> "Your events have been pulled" ]); //TEST ENCODE
    }
    else {
        //id does not exist



        $response['statusCode'] = 201;
        echo json_encode([ 'success' => false , 'message'=> "The user inputted does not exist" ]); //TEST ENCODE

    }

}
?>
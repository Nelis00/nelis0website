<?php
// contact.php - Simple PHP email handler for Nelis0 contact form
// This file handles the contact form submission and sends emails

// Set content type to JSON for AJAX responses
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
$to_email = 'nilsdaniels00@gmail.com'; // Your Gmail address
$from_email = 'noreply@yourwebsite.com'; // Your website email
$subject_prefix = 'Nelis0 Website Contact: ';

// Get form data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';

// Validate inputs
if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

// Sanitize inputs
$name = htmlspecialchars(strip_tags($name));
$email = htmlspecialchars(strip_tags($email));
$message = htmlspecialchars(strip_tags($message));

// Prepare email content
$subject = $subject_prefix . 'Message from ' . $name;

$email_body = "
New contact form submission from Nelis0 Travel Website

Name: {$name}
Email: {$email}

Message:
{$message}

---
Sent from: {$_SERVER['HTTP_HOST']}
IP Address: {$_SERVER['REMOTE_ADDR']}
User Agent: {$_SERVER['HTTP_USER_AGENT']}
Date: " . date('Y-m-d H:i:s') . "
";

// Email headers
$headers = array(
    'From' => $from_email,
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion(),
    'Content-Type' => 'text/plain; charset=UTF-8'
);

// Convert headers array to string
$headers_string = '';
foreach ($headers as $key => $value) {
    $headers_string .= $key . ': ' . $value . "\r\n";
}

// Send email
if (mail($to_email, $subject, $email_body, $headers_string)) {
    echo json_encode([
        'success' => true, 
        'message' => 'Thank you! Your message has been sent successfully.'
    ]);
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Sorry, there was an error sending your message. Please try again.'
    ]);
}
?>

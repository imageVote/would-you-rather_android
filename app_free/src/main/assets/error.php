<?php
//if called directly, not included
if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {

    if (isset($_POST["error"])) {
        $text = $_POST["error"];
        error($text);
    } else {
        error('warn: not $_POST["error"] received');
    }
    
}

function error($text) {
    if (empty($text)) {
        return;
    }
    $errorText = date('[d-m-Y H:i:s]') . " " . $text . PHP_EOL;

    $url = "/var/www/Public/key/error.log";
    file_put_contents($url, $errorText, FILE_APPEND | LOCK_EX);
}

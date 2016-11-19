<?php

if (isset($_POST["action"])) {
    $action = $_POST["action"];
    $action();
} else {
    include_once "error.php";
    error('warn: not $_POST["action"] received');
}

function addWebUsage() {
    echo "call.. ";

    if (isset($_POST["url"])) {
        $url = $_POST["url"];
        echo "url: $url; ";
    } else {
        include_once "error.php";
        $error = 'warn: not $_POST["url"] received';
        error($error);
        echo $error;
    }

    include_once "DB.php";
    $sql = "INSERT INTO urls (url) VALUES ('$url')";
    sql($sql);
}

echo $sql;

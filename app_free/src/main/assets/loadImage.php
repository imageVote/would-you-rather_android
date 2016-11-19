<?php

$filepath = $_SERVER['REQUEST_URI'];
//$filepath = '.' . $filepath;

$urlArray = $filepath.split("/");
$last = count($urlArray) -1;
$key = $urlArray[$last].split(".")[0];

if (file_exists($filepath)) {
    touch($filepath, filemtime($filepath), time()); // this will just record the time of access in file inode. you can write your own code to do whatever
    $path_parts = pathinfo($filepath);

    header("Content-type: image/jpeg");
    header("Accept-Ranges: bytes");
    header('Content-Length: ' . filesize($filepath));
    header("Last-Modified: Fri, 03 Mar 2004 06:32:31 GMT");
    readfile($filepath);
} else {
    header("HTTP/1.0 404 Not Found");
    header("Content-type: image/jpeg");
    header('Content-Length: ' . filesize("404_files.jpg"));
    header("Accept-Ranges: bytes");
    header("Last-Modified: Fri, 03 Mar 2004 06:32:31 GMT");
    readfile("404_files.jpg");
}
/*
  By Samer Mhana
  www.dorar-aliraq.net
 */
?>
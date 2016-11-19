<?php

//if loaded
if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $phone = $_GET["phone"];
}

//include_once 'phoneCodes.php';
$json_data = file_get_contents('phoneCodes.json');
$phoneCodes = json_decode($json_data, true);

$firstValues = substr($phone, 0, 4);

if (!isset($phoneCodes[$firstValues])) {
    $firstValues = substr($phone, 0, 3);

    if (!isset($phoneCodes[$firstValues])) {
        $firstValues = substr($phone, 0, 2);

        if (!isset($phoneCodes[$firstValues])) {
            $firstValues = substr($phone, 0, 1);            
        }
    }
}

if (!isset($phoneCodes[$firstValues])) {
    echo "_error retrieving phone land of $phone";
    return;
}

$territory = $phoneCodes[$firstValues];
$ISO = $territory["ISO"];

//if loaded
if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    echo $ISO;
}

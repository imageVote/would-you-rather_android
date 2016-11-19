<?php

//get verification header
$verifyHeader = 'HTTP_X_VERIFY_CREDENTIALS_AUTHORIZATION';
if (!isset($_SERVER[$verifyHeader])) {
    echo "_verification header not exists";
    return;
}
$header = $_SERVER[$verifyHeader];

//more headers
$x_auth_service_provider = $_SERVER['HTTP_X_AUTH_SERVICE_PROVIDER'];

//parse values
$oauth_consumer_key = split('"', split('oauth_consumer_key="', $header)[1])[0];

//checks
if ("K4G5F4rG76943qA1wYrmDwXZp" != $oauth_consumer_key) {
    echo "_wrong consumer key on " . $header;
    return;
}
if ("api.digits.com" != split("/", split("//", $x_auth_service_provider)[1])[0]) {
    echo "_wrong uri";
    return;
}

if(!function_exists('curl_init')){
    echo "_error: curl extension is disabled on server. Solve this with: apt-get install php5-curl";
    return;
}

$curl_handle = curl_init();
curl_setopt($curl_handle, CURLOPT_URL, $x_auth_service_provider);
curl_setopt($curl_handle, CURLOPT_HTTPHEADER, array(
    "Authorization: $header"
));
curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, 1);
$query = curl_exec($curl_handle);
curl_close($curl_handle);

//for hash and clean number
include_once 'hash.php';

//bug not checked
if ("" == $query) {
    echo "_error on twitter retrieve.";
    die();
}

//results
$res = json_decode($query, true);
$phoneString = $res["phone_number"];
$id = $res["id"];

//convert to number
preg_match_all('!\d+!', $phoneString, $matches);
$phone = (int) implode("", $matches[0]);

// write separated to debug phones
require 'getISO.php'; //not once!
//ISO returned by $phone key

$userId = hashNumber($phone);
$hashId = hashId($userId, $ISO);
$prefix = substr($phone, 0, 4);

echo "$userId|$hashId|$prefix";

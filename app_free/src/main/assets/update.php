<?php

//TODO: if some offshore uses his phone number to vote in other countries requesting with other countri name

$base = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

//id here can be the public or the private
$userId = $_POST["id"];

if (!isset($_POST["action"])) {
    echo "_error on index.* call: not action";
    die();
}
$action = $_POST["action"];

$key = "";
if (isset($_POST["key"])) {
    $key = $_POST["key"];
}

if (isset($_POST["value"])) {
    $value = $_POST["value"];
}

//define public before newKey
$public = isset($_POST["public"]);

if (empty($key)) {
    $key = newKey();
}

$path = "/var/www/Public/key/";
//before final key -> public and url
if ($public) {
    //ISO is phoneCode countries
    $ISO = strtoupper($_POST["ISO"]);

    //check public key
    include_once('hash.php');

    $doubleHash = $_POST["digitsKey"]; //captcha name to hks
    if (!checkDoubleHash($userId, $ISO, $doubleHash)) {
        echo "_1 Your country residence has changed? $userId, $ISO, $doubleHash"; //hash not works
        die();
    }

    $path .= "public/";

    if (isset($_POST["pollCountry"])) {
        //pollCountry can be org like 'EU'
        $pollCountry = strtolower($_POST["pollCountry"]);

        // needs === if pos is '0'
        $upperCountry = strtoupper($pollCountry);
        if (strpos($ISO, $upperCountry) === false) {

            //check in ORGS
            $json_data = file_get_contents('orgs.json');
            $ORGS = json_decode($json_data, true);

            $isInORG = false;
            $ISOSarray = split(" ", $ISO);
            for ($i = 0; $i < count($ISOSarray); $i++) {
                if (array_search($ISO, $ORGS[$upperCountry]) !== NULL) {
                    $isInORG = true;
                }
            }

            if (false == $isInORG) {
                //bug error or hack
                echo "_not country coincidence '" . $ISO . "' is not in '" . $upperCountry . "' or '" . json_encode($ORGS[$upperCountry]) . "', please contact us";
                die();
            }
        }

        $path .= "~$pollCountry/";
        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }
    }
    $url = $path . $key;

    //
} else {
    $path .= "private/";
    $url = $path . $key;
}

if ("update" == $action) {
    update($url, $value);
//
} else if ("create" == $action) {
    create($key, $value);
//
} else if ("newkey" == $action) {
//nothing else to do
//
} else {
    die("not action defined");
}

echo $key;

function newKey() {

    global $public;

    if ($public) {
        $path = "/var/www/Public/key/public/_last.txt";
    } else {
        $path = "/var/www/Public/key/private/_last.txt";
    }

    $handle = fopen($path, 'r+');
    if (false == $handle) {
        file_put_contents("error.log", "$path file not exists; ", FILE_APPEND | LOCK_EX);
        echo "_error open last key on $path; ";
        return;
    }

    $content = fgets($handle);
    $new = getNextAlphaNumeric($content);
    fseek($handle, 0);
    fwrite($handle, $new);
    fclose($handle);

    if (!isset($content) || (empty($content) && "0" != $content)) { // "0" == empty()
        include_once 'error.php';
        error("illegible $path file; ");
        echo "_error on read last key on $path; ";
        return;
    }

    if ($public) {
        return $new;
    } else {
        global $base;
        return "-$new" . $base[rand(0, 61)]; //62-1
        //return "-$new";
    }
}

function create($key, $value) {
    //for public - and private too
    $arr = json_decode($value . "]");
    if (count($arr) > 4) { //q, opts, style, usrs
        echo "_wrong creation data";
        return;
    }

    global $url;
    if (file_exists($url)) {
        echo "_3 file already exists";
        return;
    }

    //file work only
    $fp = fopen($url, "a");
    $len = fwrite($fp, $value);
    fclose($fp);
    //

    if (false == $fp) {
        echo "_error: cant create file on create() on $url; ";
        return;
    }
    if (false == $len && !empty($value)) {
        echo "_error: SERVER OUT OF SPACE! on $url; ";
        return;
    }

    global $public;
    if ($public) {
        global $path;

        //public search index
        $string = ',"' . $key . '":' . json_encode($arr[0]);

        $fp = fopen($path . "_index.txt", "a");
        $len = fwrite($fp, $string);
        fclose($fp);

        if (false == $fp) {
            echo "_1 error: cant open file _index.txt on $path; ";
            return;
        }
        if (false == $len) {
            echo "_error: _index.txt not writable on $path; ";
            return;
        }
    }
}

function update($url, $value) {
    //for public - and private too
    $arr = json_decode($value);

    global $userId;
    if (!is_array($arr)) {
        echo "_wrong update data: $value";
        die();
    } else if ($arr[0] != $userId) {
        echo "_wrong user id: $arr[0] != $userId";
        die();
    }

    //file work only
    $fp = fopen($url, "a");
    $len = fwrite($fp, ",$value");
    fclose($fp);
    //

    if (false == $fp) {
        echo "_error: cant open file on update() on $url; (not www-data file?)";
        die();
    }
    if (false == $len && !empty($value)) {
        echo "_error: file not writable on update() on $url; "; //caution: is server is out of space?
        die();
    }
}

//for key sort
function getNextAlphaNumeric($code) {
    global $base;
    //tested Mayus correct order on linux biz envirentment
    $base10 = '0123456789';

    include_once("convBase.php");
    $base_ten = convBase($code, $base, $base10);
    return convBase($base_ten + 1, $base10, $base);
}

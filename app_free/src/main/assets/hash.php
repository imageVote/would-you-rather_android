<?php

function hashId($userId, $ISOS) {
    return hash('md4', "pleaseNoKillDemocracy$userId" . $ISOS);
}

function checkDoubleHash($userId, $ISOS, $final) {
    //first if for private key on client
    //second generated only when sending
    $hashId = hashId($userId, $ISOS);
    $double = md5("digitsKey=$hashId");

    if ($final == $double) {
        return true;
    }

    echo "_1; $final != " . $double . " on $userId; ";
    return false;
}

function hashNumber($num) {

    if (strlen((string) $num) < 8) {
        echo "_too short number phone: $num; ";
        return;
    }

    //first '-' to let 0's retrieve values
    $base10 = '-4619738520';
    $base = 'iRuDvz3QGkHIYJFCsWmbq4rAe50acNlxSydoVPT6Lnfwj97pgKZO2MtU18EhBX';    

    include_once("convBase.php");
    $encrypt = convBase($num + 1, $base10, $base);

    $end = "";
    for ($i = 1; $i < strlen($encrypt); $i = $i + 2) {
        $end .= $encrypt[$i];
    }
    for ($i = 0; $i < strlen($encrypt); $i = $i + 2) {
        $end .= $encrypt[$i];
    }

    return $end;
}

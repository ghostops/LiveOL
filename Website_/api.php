<?php
    header('Access-Control-Allow-Origin: *');

    function get_data($url) {
        $ch = curl_init();
        $timeout = 5;
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        $data = curl_exec($ch);
        curl_close($ch);

        // Parse data, remove stupid superscript UTF character
        $data = str_replace('	', '', $data);

        return $data;
    }

    echo get_data('https://liveresultat.orientering.se/api.php?' . http_build_query($_GET));
?>

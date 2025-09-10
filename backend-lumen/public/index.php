<?php
/*
|--------------------------------------------------------------------------
| Lumen - PHP Micro-Framework
|--------------------------------------------------------------------------
|
| This is the entry point for all requests to the Lumen application.
| It loads the Composer autoloader and boots the application.
|
*/

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';

$app->run();



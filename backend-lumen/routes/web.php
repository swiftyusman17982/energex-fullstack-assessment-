<?php

use Illuminate\Http\Request;

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    return $router->app->version();
});

$router->get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'timestamp' => date('c'),
        'service' => 'Lumen API'
    ]);
});

// Test route for API
$router->get('/api/test', function () {
    return response()->json(['message' => 'API routes working']);
});

// Authentication routes - REAL controllers
$router->post('/api/register', 'AuthController@register');
$router->post('/api/login', 'AuthController@login');
$router->get('/api/me', 'AuthController@me');
$router->post('/api/logout', 'AuthController@logout');
$router->post('/api/refresh', 'AuthController@refresh');

// Protected routes with auth middleware
$router->group(['prefix' => 'api', 'middleware' => 'auth'], function () use ($router) {
    // Real posts routes
    $router->get('posts', 'PostController@index');
    $router->post('posts', 'PostController@store');
    $router->get('posts/{id}', 'PostController@show');
    $router->put('posts/{id}', 'PostController@update');
    $router->delete('posts/{id}', 'PostController@destroy');
});

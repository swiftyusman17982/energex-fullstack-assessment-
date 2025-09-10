<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| GraphQL Routes
|--------------------------------------------------------------------------
|
| Here are the GraphQL routes for the application.
|
*/

$router->group(['prefix' => 'graphql'], function () use ($router) {
    // Public GraphQL endpoint (for introspection)
    $router->get('/', 'GraphQLController@query');
    $router->post('/', 'GraphQLController@query');
    
    // Protected GraphQL endpoint
    $router->group(['middleware' => 'auth'], function () use ($router) {
        $router->get('/protected', 'GraphQLController@query');
        $router->post('/protected', 'GraphQLController@query');
    });
});

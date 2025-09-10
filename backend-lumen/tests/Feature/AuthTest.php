<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    /**
     * Test user registration.
     *
     * @return void
     */
    public function test_user_can_register()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
        ];

        $response = $this->post('/api/register', $userData);

        $response->assertResponseStatus(201);
        $response->seeJson([
            'success' => true,
            'message' => 'User registered successfully',
        ]);
        $response->seeJsonStructure([
            'data' => [
                'user' => ['id', 'name', 'email', 'role'],
                'token',
                'token_type',
                'expires_in',
            ],
        ]);
    }

    /**
     * Test user registration with invalid data.
     *
     * @return void
     */
    public function test_user_registration_validation()
    {
        $response = $this->post('/api/register', []);

        $response->assertResponseStatus(422);
        $response->seeJson([
            'success' => false,
            'message' => 'Validation errors',
        ]);
    }

    /**
     * Test user login.
     *
     * @return void
     */
    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $loginData = [
            'email' => 'test@example.com',
            'password' => 'password123',
        ];

        $response = $this->post('/api/login', $loginData);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'success' => true,
            'message' => 'Login successful',
        ]);
        $response->seeJsonStructure([
            'data' => [
                'user' => ['id', 'name', 'email', 'role'],
                'token',
                'token_type',
                'expires_in',
            ],
        ]);
    }

    /**
     * Test user login with invalid credentials.
     *
     * @return void
     */
    public function test_user_login_with_invalid_credentials()
    {
        $loginData = [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ];

        $response = $this->post('/api/login', $loginData);

        $response->assertResponseStatus(401);
        $response->seeJson([
            'success' => false,
            'message' => 'Invalid credentials',
        ]);
    }

    /**
     * Test authenticated user can get profile.
     *
     * @return void
     */
    public function test_authenticated_user_can_get_profile()
    {
        $user = User::factory()->create();
        $token = auth()->login($user);

        $response = $this->get('/api/me', [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'success' => true,
        ]);
        $response->seeJsonStructure([
            'data' => ['id', 'name', 'email', 'role'],
        ]);
    }

    /**
     * Test unauthenticated user cannot get profile.
     *
     * @return void
     */
    public function test_unauthenticated_user_cannot_get_profile()
    {
        $response = $this->get('/api/me');

        $response->assertResponseStatus(401);
        $response->seeJson([
            'success' => false,
            'message' => 'Unauthorized',
        ]);
    }

    /**
     * Test user can logout.
     *
     * @return void
     */
    public function test_user_can_logout()
    {
        $user = User::factory()->create();
        $token = auth()->login($user);

        $response = $this->post('/api/logout', [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'success' => true,
            'message' => 'Successfully logged out',
        ]);
    }
}

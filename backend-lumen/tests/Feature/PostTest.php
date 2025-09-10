<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Tests\TestCase;

class PostTest extends TestCase
{
    /**
     * Test authenticated user can get posts.
     *
     * @return void
     */
    public function test_authenticated_user_can_get_posts()
    {
        $user = User::factory()->create();
        $token = auth()->login($user);

        $response = $this->get('/api/posts', [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'success' => true,
        ]);
    }

    /**
     * Test unauthenticated user cannot get posts.
     *
     * @return void
     */
    public function test_unauthenticated_user_cannot_get_posts()
    {
        $response = $this->get('/api/posts');

        $response->assertResponseStatus(401);
        $response->seeJson([
            'success' => false,
            'message' => 'Unauthorized',
        ]);
    }

    /**
     * Test authenticated user can create post.
     *
     * @return void
     */
    public function test_authenticated_user_can_create_post()
    {
        $user = User::factory()->create();
        $token = auth()->login($user);

        $postData = [
            'title' => 'Test Post',
            'content' => 'This is a test post content.',
        ];

        $response = $this->post('/api/posts', $postData, [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(201);
        $response->seeJson([
            'success' => true,
            'message' => 'Post created successfully',
        ]);
        $response->seeJsonStructure([
            'data' => ['id', 'title', 'content', 'user_id', 'created_at', 'updated_at'],
        ]);
    }

    /**
     * Test post creation validation.
     *
     * @return void
     */
    public function test_post_creation_validation()
    {
        $user = User::factory()->create();
        $token = auth()->login($user);

        $response = $this->post('/api/posts', [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(422);
        $response->seeJson([
            'success' => false,
            'message' => 'Validation errors',
        ]);
    }

    /**
     * Test authenticated user can get single post.
     *
     * @return void
     */
    public function test_authenticated_user_can_get_single_post()
    {
        $user = User::factory()->create();
        $token = auth()->login($user);
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->get('/api/posts/' . $post->id, [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'success' => true,
        ]);
        $response->seeJsonStructure([
            'data' => ['id', 'title', 'content', 'user_id', 'created_at', 'updated_at'],
        ]);
    }

    /**
     * Test post not found.
     *
     * @return void
     */
    public function test_post_not_found()
    {
        $user = User::factory()->create();
        $token = auth()->login($user);

        $response = $this->get('/api/posts/999', [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(404);
        $response->seeJson([
            'success' => false,
            'message' => 'Post not found',
        ]);
    }

    /**
     * Test post owner can update post.
     *
     * @return void
     */
    public function test_post_owner_can_update_post()
    {
        $user = User::factory()->create();
        $token = auth()->login($user);
        $post = Post::factory()->create(['user_id' => $user->id]);

        $updateData = [
            'title' => 'Updated Title',
            'content' => 'Updated content.',
        ];

        $response = $this->put('/api/posts/' . $post->id, $updateData, [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'success' => true,
            'message' => 'Post updated successfully',
        ]);
    }

    /**
     * Test non-owner cannot update post.
     *
     * @return void
     */
    public function test_non_owner_cannot_update_post()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $token = auth()->login($user2);
        $post = Post::factory()->create(['user_id' => $user1->id]);

        $updateData = [
            'title' => 'Updated Title',
            'content' => 'Updated content.',
        ];

        $response = $this->put('/api/posts/' . $post->id, $updateData, [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(403);
        $response->seeJson([
            'success' => false,
            'message' => 'Insufficient permissions to update this post',
        ]);
    }

    /**
     * Test admin can update any post.
     *
     * @return void
     */
    public function test_admin_can_update_any_post()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $token = auth()->login($admin);
        $post = Post::factory()->create(['user_id' => $user->id]);

        $updateData = [
            'title' => 'Updated by Admin',
            'content' => 'Updated by admin.',
        ];

        $response = $this->put('/api/posts/' . $post->id, $updateData, [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'success' => true,
            'message' => 'Post updated successfully',
        ]);
    }

    /**
     * Test post owner can delete post.
     *
     * @return void
     */
    public function test_post_owner_can_delete_post()
    {
        $user = User::factory()->create();
        $token = auth()->login($user);
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->delete('/api/posts/' . $post->id, [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(200);
        $response->seeJson([
            'success' => true,
            'message' => 'Post deleted successfully',
        ]);
    }

    /**
     * Test non-owner cannot delete post.
     *
     * @return void
     */
    public function test_non_owner_cannot_delete_post()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $token = auth()->login($user2);
        $post = Post::factory()->create(['user_id' => $user1->id]);

        $response = $this->delete('/api/posts/' . $post->id, [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertResponseStatus(403);
        $response->seeJson([
            'success' => false,
            'message' => 'Insufficient permissions to delete this post',
        ]);
    }
}

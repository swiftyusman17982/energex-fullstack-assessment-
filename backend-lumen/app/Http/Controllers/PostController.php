<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Display a listing of posts.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            // Try to get cached posts from Node.js service
            $cacheServiceUrl = config('app.cache_service_url', 'http://backend-node:3001');
            $response = Http::timeout(5)->get($cacheServiceUrl . '/cache/posts');

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'data' => $response->json(),
                    'cached' => true
                ]);
            }
        } catch (\Exception $e) {
            // Fallback to direct database query
            \Log::warning('Cache service unavailable, falling back to database', [
                'error' => $e->getMessage()
            ]);
        }

        // Fallback to database
        $posts = Post::with('user')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $posts,
            'cached' => false
        ]);
    }

    /**
     * Store a newly created post.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();

        // Check if user can create posts
        if (!$user->canCreatePosts()) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to create posts'
            ], 403);
        }

        $post = Post::create([
            'title' => $request->title,
            'content' => $request->content,
            'user_id' => $user->id,
        ]);

        $post->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully',
            'data' => $post
        ], 201);
    }

    /**
     * Display the specified post.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            // Try to get cached post from Node.js service
            $cacheServiceUrl = config('app.cache_service_url', 'http://backend-node:3001');
            $response = Http::timeout(5)->get($cacheServiceUrl . '/cache/posts/' . $id);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'data' => $response->json(),
                    'cached' => true
                ]);
            }
        } catch (\Exception $e) {
            // Fallback to direct database query
            \Log::warning('Cache service unavailable, falling back to database', [
                'error' => $e->getMessage()
            ]);
        }

        // Fallback to database
        $post = Post::with('user')->find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $post,
            'cached' => false
        ]);
    }

    /**
     * Update the specified post.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        $user = auth()->user();

        // Check if user can update this post (owner or admin)
        if ($post->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update this post'
            ], 403);
        }

        $post->update($request->only(['title', 'content']));
        $post->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Post updated successfully',
            'data' => $post
        ]);
    }

    /**
     * Remove the specified post.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        $user = auth()->user();

        // Check if user can delete this post (owner or admin)
        if ($post->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to delete this post'
            ], 403);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully'
        ]);
    }
}

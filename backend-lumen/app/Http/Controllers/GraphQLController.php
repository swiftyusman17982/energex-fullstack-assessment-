<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GraphQLController extends Controller
{
    /**
     * Handle GraphQL queries.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function query(Request $request)
    {
        $query = $request->input('query');
        $variables = $request->input('variables', []);
        $operationName = $request->input('operationName');

        try {
            $result = $this->executeQuery($query, $variables, $operationName);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'errors' => [
                    [
                        'message' => $e->getMessage(),
                        'extensions' => [
                            'code' => 'INTERNAL_ERROR'
                        ]
                    ]
                ]
            ], 500);
        }
    }

    /**
     * Execute GraphQL query.
     *
     * @param string $query
     * @param array $variables
     * @param string|null $operationName
     * @return array
     */
    private function executeQuery(string $query, array $variables = [], ?string $operationName = null): array
    {
        // Simple GraphQL implementation
        $query = trim($query);
        
        // Parse query type
        if (strpos($query, 'query') === 0) {
            return $this->handleQuery($query, $variables);
        } elseif (strpos($query, 'mutation') === 0) {
            return $this->handleMutation($query, $variables);
        }

        throw new \Exception('Invalid GraphQL query');
    }

    /**
     * Handle GraphQL queries.
     *
     * @param string $query
     * @param array $variables
     * @return array
     */
    private function handleQuery(string $query, array $variables): array
    {
        $result = [];

        // Handle posts query
        if (strpos($query, 'posts') !== false) {
            $posts = Post::with('user')->orderBy('created_at', 'desc')->get();
            $result['posts'] = $posts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'content' => $post->content,
                    'createdAt' => $post->created_at->toISOString(),
                    'updatedAt' => $post->updated_at->toISOString(),
                    'author' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'email' => $post->user->email,
                        'role' => $post->user->role,
                    ]
                ];
            });
        }

        // Handle post query
        if (strpos($query, 'post(') !== false) {
            preg_match('/post\(id:\s*(\d+)\)/', $query, $matches);
            if (isset($matches[1])) {
                $post = Post::with('user')->find($matches[1]);
                if ($post) {
                    $result['post'] = [
                        'id' => $post->id,
                        'title' => $post->title,
                        'content' => $post->content,
                        'createdAt' => $post->created_at->toISOString(),
                        'updatedAt' => $post->updated_at->toISOString(),
                        'author' => [
                            'id' => $post->user->id,
                            'name' => $post->user->name,
                            'email' => $post->user->email,
                            'role' => $post->user->role,
                        ]
                    ];
                } else {
                    $result['post'] = null;
                }
            }
        }

        // Handle me query
        if (strpos($query, 'me') !== false) {
            $user = Auth::user();
            if ($user) {
                $result['me'] = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'createdAt' => $user->created_at->toISOString(),
                ];
            } else {
                $result['me'] = null;
            }
        }

        return ['data' => $result];
    }

    /**
     * Handle GraphQL mutations.
     *
     * @param string $query
     * @param array $variables
     * @return array
     */
    private function handleMutation(string $query, array $variables): array
    {
        $result = [];

        // Handle createPost mutation
        if (strpos($query, 'createPost') !== false) {
            $user = Auth::user();
            if (!$user) {
                throw new \Exception('Unauthenticated');
            }

            if (!$user->canCreatePosts()) {
                throw new \Exception('Insufficient permissions');
            }

            $post = Post::create([
                'title' => $variables['title'] ?? '',
                'content' => $variables['content'] ?? '',
                'user_id' => $user->id,
            ]);

            $post->load('user');

            $result['createPost'] = [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'createdAt' => $post->created_at->toISOString(),
                'updatedAt' => $post->updated_at->toISOString(),
                'author' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'email' => $post->user->email,
                    'role' => $post->user->role,
                ]
            ];
        }

        // Handle updatePost mutation
        if (strpos($query, 'updatePost') !== false) {
            $user = Auth::user();
            if (!$user) {
                throw new \Exception('Unauthenticated');
            }

            $postId = $variables['id'] ?? null;
            if (!$postId) {
                throw new \Exception('Post ID is required');
            }

            $post = Post::find($postId);
            if (!$post) {
                throw new \Exception('Post not found');
            }

            if ($post->user_id !== $user->id && !$user->isAdmin()) {
                throw new \Exception('Insufficient permissions');
            }

            $post->update([
                'title' => $variables['title'] ?? $post->title,
                'content' => $variables['content'] ?? $post->content,
            ]);

            $post->load('user');

            $result['updatePost'] = [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'createdAt' => $post->created_at->toISOString(),
                'updatedAt' => $post->updated_at->toISOString(),
                'author' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'email' => $post->user->email,
                    'role' => $post->user->role,
                ]
            ];
        }

        // Handle deletePost mutation
        if (strpos($query, 'deletePost') !== false) {
            $user = Auth::user();
            if (!$user) {
                throw new \Exception('Unauthenticated');
            }

            $postId = $variables['id'] ?? null;
            if (!$postId) {
                throw new \Exception('Post ID is required');
            }

            $post = Post::find($postId);
            if (!$post) {
                throw new \Exception('Post not found');
            }

            if ($post->user_id !== $user->id && !$user->isAdmin()) {
                throw new \Exception('Insufficient permissions');
            }

            $post->delete();

            $result['deletePost'] = [
                'success' => true,
                'message' => 'Post deleted successfully'
            ];
        }

        return ['data' => $result];
    }
}

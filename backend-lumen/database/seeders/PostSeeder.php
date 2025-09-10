<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $users = User::all();

        if ($users->count() > 0) {
            $posts = [
                [
                    'title' => 'Welcome to Energex Assessment',
                    'content' => 'This is the first post in our microservice application. It demonstrates the integration between Lumen, Node.js, Redis, and React.',
                    'user_id' => $users->first()->id,
                ],
                [
                    'title' => 'Microservices Architecture',
                    'content' => 'Our application uses a microservices architecture with separate services for API, caching, and frontend. This provides better scalability and maintainability.',
                    'user_id' => $users->first()->id,
                ],
                [
                    'title' => 'Redis Caching Benefits',
                    'content' => 'Redis provides high-performance caching for our posts, reducing database load and improving response times for frequently accessed data.',
                    'user_id' => $users->skip(1)->first()->id ?? $users->first()->id,
                ],
                [
                    'title' => 'JWT Authentication',
                    'content' => 'We use JWT tokens for secure authentication across our microservices. This ensures that only authenticated users can access protected endpoints.',
                    'user_id' => $users->skip(2)->first()->id ?? $users->first()->id,
                ],
                [
                    'title' => 'Docker Containerization',
                    'content' => 'All services are containerized using Docker, making deployment and scaling much easier across different environments.',
                    'user_id' => $users->first()->id,
                ],
            ];

            foreach ($posts as $postData) {
                Post::create($postData);
            }
        }
    }
}

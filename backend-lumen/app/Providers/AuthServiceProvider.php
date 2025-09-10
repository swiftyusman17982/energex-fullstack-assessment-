<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Boot the authentication services for the application.
     *
     * @return void
     */
    public function boot()
    {
        // Define gates for role-based access control
        Gate::define('create-posts', function (User $user) {
            return $user->canCreatePosts();
        });

        Gate::define('admin-access', function (User $user) {
            return $user->isAdmin();
        });
    }
}

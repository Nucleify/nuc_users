<?php

namespace Routes;

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web'])->prefix('api')->group(function (): void {
    Route::get('/user', function () {
        return auth()->user() ?? 'Unauthenticated';
    });

    Route::middleware(['auth'])->group(function (): void {
        /**
         *  Users
         */
        Route::prefix('users')->controller(UserController::class)->group(function (): void {
            Route::get('/', 'index')
                ->name('users.index');
            Route::get('/count-by-created-last-week', 'countByCreatedLastWeek')
                ->name('users.countByCreatedLastWeek');
            Route::get('/{id}', 'show')
                ->name('users.show');
            Route::post('/', 'store')
                ->name('users.store');
            Route::post('/{id}/avatar', 'uploadAvatar')
                ->name('users.uploadAvatar');
            Route::delete('/{id}/avatar', 'deleteAvatar')
                ->name('users.deleteAvatar');
            Route::put('/{id}', 'update')
                ->name('users.update');
            Route::delete('/{id}', 'destroy')
                ->name('users.destroy');
        });
    });
});

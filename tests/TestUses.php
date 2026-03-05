<?php

if (!defined('PEST_RUNNING')) {
    return;
}

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;

if (env('DB_DATABASE') === 'database/database.sqlite') {
    uses(Tests\TestCase::class)
        ->beforeEach(function (): void {
            $this->artisan('migrate:fresh');
        })
        ->in('Feature', 'Database');
} else {
    uses(
        Tests\TestCase::class,
    )
        ->in('Feature', 'Database');

    uses(
        RefreshDatabase::class
    )
        ->in(
            'Feature/Api/User/HTTP302Test.php',
            'Feature/Api/User/HTTP422PostTest.php',
            'Feature/Api/User/HTTP422PutTest.php',
            'Feature/Api/User/HTTP422ChangePasswordTest.php',
            'Database/Models',
        );

    uses(
        DatabaseMigrations::class
    )
        ->in(
            'Feature/Api/User/HTTP200Test.php',
            'Feature/Api/User/HTTP500Test.php',
            'Database/Factories',
            'Database/Migrations',
            'Feature/Controllers',
            'Feature/Services',
        );
}

<?php

if (!defined('PEST_RUNNING')) {
    return;
}

use Illuminate\Support\Facades\Schema;

test('can create table', function (): void {
    expect(Schema::hasTable('users'))
        ->toBeTrue()
        ->and(Schema::hasColumns('users', [
            'id',
            'name',
            'email',
            'phone_number',
            'avatar',
            'language',
            'country',
            'role',
            'password',
            'created_at',
            'updated_at',
        ]))
        ->toBeTrue();
});

test('can be rolled back', function (): void {
    $this->artisan('migrate:rollback');

    expect(Schema::hasTable('users'))->toBeFalse();
});

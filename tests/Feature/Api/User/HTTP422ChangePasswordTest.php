<?php

if (!defined('PEST_RUNNING')) {
    return;
}

uses()->group('user-api-422');
uses()->group('user-api-422-change-password');
uses()->group('api-422');

use App\Models\User;

beforeEach(function (): void {
    $this->createUsers();
    $this->user = User::factory()->create(['password' => bcrypt('password')]);
    $this->actingAs($this->user);
});

describe('422 > Change Password', function (): void {
    apiTestArray([
        'current_password > empty' => [
            'method' => 'PUT',
            'route' => 'users.changePassword',
            'id' => 1,
            'data' => array_merge(changePasswordData, ['current_password' => '']),
            'structure' => ['errors' => ['current_password']],
            'fragment' => ['errors' => ['current_password' => ['The current password field is required.']]],
        ],
        'current_password > wrong password' => [
            'method' => 'PUT',
            'route' => 'users.changePassword',
            'id' => 1,
            'data' => array_merge(changePasswordData, ['current_password' => 'wrongpassword']),
            'structure' => ['errors' => ['current_password']],
            'fragment' => ['errors' => ['current_password' => ['The current password is incorrect.']]],
        ],
        'password > empty' => [
            'method' => 'PUT',
            'route' => 'users.changePassword',
            'id' => 1,
            'data' => array_merge(changePasswordData, ['password' => '']),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field is required.']]],
        ],
        'password > too short' => [
            'method' => 'PUT',
            'route' => 'users.changePassword',
            'id' => 1,
            'data' => array_merge(changePasswordData, ['password' => 'short', 'password_confirmation' => 'short']),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must be at least 8 characters.']]],
        ],
        'password > too long' => [
            'method' => 'PUT',
            'route' => 'users.changePassword',
            'id' => 1,
            'data' => array_merge(changePasswordData, [
                'password' => str_repeat('a', 51),
                'password_confirmation' => str_repeat('a', 51),
            ]),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must not be greater than 50 characters.']]],
        ],
        'password > confirmation mismatch' => [
            'method' => 'PUT',
            'route' => 'users.changePassword',
            'id' => 1,
            'data' => array_merge(changePasswordData, ['password_confirmation' => 'differentpassword']),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['Password confirmation does not match.']]],
        ],
    ]);
});

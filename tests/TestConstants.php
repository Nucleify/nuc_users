<?php

if (!defined('PEST_RUNNING')) {
    return;
}

const userData = [
    'id' => 1,
    'name' => 'User',
    'email' => 'user@example.com',
    'password' => 'password',
    'password_confirmation' => 'password',
    'language' => 'en',
    'country' => 'poland',
    'role' => 'user',
];

const updatedUserData = [
    'id' => 1,
    'name' => 'Updated User',
    'password' => 'password',
    'password_confirmation' => 'password',
    'email' => 'updateduser@example.com',
    'language' => 'en',
    'country' => 'poland',
    'role' => 'user',
];

const changePasswordData = [
    'current_password' => 'password',
    'password' => 'newpassword123',
    'password_confirmation' => 'newpassword123',
];

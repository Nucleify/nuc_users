<?php

if (!defined('PEST_RUNNING')) {
    return;
}

uses()->group('user-api-422');
uses()->group('user-api-422-post');
uses()->group('api-422');
uses()->group('api-422-post');

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
});

describe('422 > POST', function (): void {
    apiTestArray([
        // NAME TESTS
        'name > empty' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['name' => '']),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field is required.']]],
        ],
        'name > false' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['name' => false]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field must be a string.', 'The name field must be at least 3 characters.']]],
        ],
        'name > true' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['name' => true]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field must be a string.', 'The name field must be at least 3 characters.']]],
        ],
        'name > empty array' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['name' => []]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field is required.']]],
        ],

        // EMAIL TESTS
        'email > email format' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['email' => 'admin.example.com']),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must be a valid email address.']]],
        ],
        'email > integer' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['email' => 1]),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must be a valid email address.', 'The email field must be at least 3 characters.']]],
        ],
        'email > false' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['email' => false]),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must be a valid email address.', 'The email field must be at least 3 characters.']]],
        ],
        'email > true' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['email' => true]),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must be a valid email address.', 'The email field must be at least 3 characters.']]],
        ],
        'email > too short' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['email' => '@a']),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must be a valid email address.', 'The email field must be at least 3 characters.']]],
        ],
        'email > too long' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['email' => 'loremipsumdolorsitametconsecteturadipiscingelitseddoetaliqualaborum@exampleemail.com']),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must not be greater than 70 characters.']]],
        ],
        'email > empty array' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['email' => []]),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field is required.']]],
        ],

        // PASSWORD TESTS
        'password > empty password' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['password' => '']),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field is required.']]],
        ],
        'password > integer' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['password' => 1]),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must be at least 8 characters.', 'The password field confirmation does not match.']]],
        ],
        'password > false' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['password' => false]),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must be at least 8 characters.', 'The password field confirmation does not match.']]],
        ],
        'password > true' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['password' => true]),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must be at least 8 characters.', 'The password field confirmation does not match.']]],
        ],
        'password > too short' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['password' => 'L']),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must be at least 8 characters.', 'The password field confirmation does not match.']]],
        ],
        'password > too long' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['password' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do et aliqua laborum.']),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must not be greater than 50 characters.', 'The password field confirmation does not match.']]],
        ],
        'password > empty array' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['password' => []]),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field is required.']]],
        ],

        // PHONE NUMBER TESTS
        'phone_number > too short' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['phone_number' => 'ab']),
            'structure' => ['errors' => ['phone_number']],
            'fragment' => ['errors' => ['phone_number' => ['The phone number field must be at least 3 characters.']]],
        ],
        'phone_number > too long' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['phone_number' => str_repeat('1', 31)]),
            'structure' => ['errors' => ['phone_number']],
            'fragment' => ['errors' => ['phone_number' => ['The phone number field must not be greater than 30 characters.']]],
        ],

        // LANGUAGE TESTS
        'language > too long' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['language' => str_repeat('a', 11)]),
            'structure' => ['errors' => ['language']],
            'fragment' => ['errors' => ['language' => ['The language field must not be greater than 10 characters.']]],
        ],

        // COUNTRY TESTS
        'country > too long' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['country' => str_repeat('a', 51)]),
            'structure' => ['errors' => ['country']],
            'fragment' => ['errors' => ['country' => ['The country field must not be greater than 50 characters.']]],
        ],

        // ROLE TESTS
        'role > empty' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['role' => '']),
            'structure' => ['errors' => ['role']],
            'fragment' => ['errors' => ['role' => ['The role field is required.']]],
        ],
        'role > integer' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['role' => 1]),
            'structure' => ['errors' => ['role']],
            'fragment' => ['errors' => ['role' => ['The selected role is invalid.']]],
        ],
        'role > invalid' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['role' => 'invalid']),
            'structure' => ['errors' => ['role']],
            'fragment' => ['errors' => ['role' => ['The selected role is invalid.']]],
        ],
        'role > empty array' => [
            'method' => 'POST',
            'route' => 'users.store',
            'data' => array_merge(userData, ['role' => []]),
            'structure' => ['errors' => ['role']],
            'fragment' => ['errors' => ['role' => ['The role field is required.']]],
        ],
    ]);
});

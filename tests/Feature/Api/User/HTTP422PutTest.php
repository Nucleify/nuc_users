<?php

if (!defined('PEST_RUNNING')) {
    return;
}

uses()->group('user-api-422');
uses()->group('user-api-422-put');
uses()->group('api-422');
uses()->group('api-422-put');

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
});

describe('422 > PUT', function (): void {
    apiTestArray([
        // NAME TESTS
        'name > empty' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['name' => '']),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field is required.']]],
        ],
        'name > false' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['name' => false]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field must be a string.', 'The name field must be at least 3 characters.']]],
        ],
        'name > true' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['name' => true]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field must be a string.', 'The name field must be at least 3 characters.']]],
        ],
        'name > empty array' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['name' => []]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field is required.']]],
        ],

        // EMAIL TESTS
        'email > email format' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['email' => 'admin.example.com']),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must be a valid email address.']]],
        ],
        'email > integer' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['email' => 1]),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must be a valid email address.', 'The email field must be at least 3 characters.']]],
        ],
        'email > false' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['email' => false]),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must be a valid email address.', 'The email field must be at least 3 characters.']]],
        ],
        'email > true' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['email' => true]),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must be a valid email address.', 'The email field must be at least 3 characters.']]],
        ],
        'email > too short' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['email' => '@a']),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must be a valid email address.', 'The email field must be at least 3 characters.']]],
        ],
        'email > too long' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['email' => 'loremipsumdolorsitametconsecteturadipiscingelitseddoetaliqualaborum@exampleemail.com']),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field must not be greater than 70 characters.']]],
        ],
        'email > empty array' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['email' => []]),
            'structure' => ['errors' => ['email']],
            'fragment' => ['errors' => ['email' => ['The email field is required.']]],
        ],

        // PASSWORD TESTS
        'password > empty password' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['password' => '']),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must be at least 8 characters.']]],
        ],
        'password > integer' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['password' => 1]),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must be at least 8 characters.']]],
        ],
        'password > false' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['password' => false]),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must be at least 8 characters.']]],
        ],
        'password > true' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['password' => true]),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must be at least 8 characters.']]],
        ],
        'password > too short' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['password' => 'L']),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must be at least 8 characters.']]],
        ],
        'password > too long' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['password' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do et aliqua laborum.']),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must not be greater than 50 characters.']]],
        ],
        'password > empty array' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['password' => []]),
            'structure' => ['errors' => ['password']],
            'fragment' => ['errors' => ['password' => ['The password field must be at least 8 characters.']]],
        ],

        // PHONE NUMBER TESTS
        'phone_number > too short' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['phone_number' => 'ab']),
            'structure' => ['errors' => ['phone_number']],
            'fragment' => ['errors' => ['phone_number' => ['The phone number field must be at least 3 characters.']]],
        ],
        'phone_number > too long' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['phone_number' => str_repeat('1', 31)]),
            'structure' => ['errors' => ['phone_number']],
            'fragment' => ['errors' => ['phone_number' => ['The phone number field must not be greater than 30 characters.']]],
        ],

        // LANGUAGE TESTS
        'language > too long' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['language' => str_repeat('a', 11)]),
            'structure' => ['errors' => ['language']],
            'fragment' => ['errors' => ['language' => ['The language field must not be greater than 10 characters.']]],
        ],

        // COUNTRY TESTS
        'country > too long' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['country' => str_repeat('a', 51)]),
            'structure' => ['errors' => ['country']],
            'fragment' => ['errors' => ['country' => ['The country field must not be greater than 50 characters.']]],
        ],

        // ROLE TESTS
        'role > empty' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['role' => '']),
            'structure' => ['errors' => ['role']],
            'fragment' => ['errors' => ['role' => ['The role field is required.']]],
        ],
        'role > integer' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['role' => 1]),
            'structure' => ['errors' => ['role']],
            'fragment' => ['errors' => ['role' => ['The selected role is invalid.']]],
        ],
        'role > invalid' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['role' => 'invalid']),
            'structure' => ['errors' => ['role']],
            'fragment' => ['errors' => ['role' => ['The selected role is invalid.']]],
        ],
        'role > empty array' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'id' => 1,
            'data' => array_merge(updatedUserData, ['role' => []]),
            'structure' => ['errors' => ['role']],
            'fragment' => ['errors' => ['role' => ['The role field is required.']]],
        ],
    ]);
});

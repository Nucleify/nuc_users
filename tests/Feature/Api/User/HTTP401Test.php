<?php

if (!defined('PEST_RUNNING')) {
    return;
}

uses()->group('user-api-401');
uses()->group('api-401');

describe('401', function (): void {
    apiTestArray([
        'index api' => [
            'method' => 'GET',
            'route' => 'users.index',
            'status' => 401,
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
        'countByCreatedLastWeek api' => [
            'method' => 'GET',
            'route' => 'users.countByCreatedLastWeek',
            'status' => 401,
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
        'show api' => [
            'method' => 'SHOW',
            'route' => 'users.show',
            'status' => 401,
            'id' => 1,
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
        'store api with data' => [
            'method' => 'POST',
            'route' => 'users.store',
            'status' => 401,
            'data' => userData,
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
        'store api empty json' => [
            'method' => 'POST',
            'route' => 'users.store',
            'status' => 401,
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
        'update api with data' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'status' => 401,
            'id' => 1,
            'data' => userData,
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
        'update api empty json' => [
            'method' => 'PUT',
            'route' => 'users.update',
            'status' => 401,
            'id' => 1,
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
        'destroy api' => [
            'method' => 'DELETE',
            'route' => 'users.destroy',
            'status' => 401,
            'id' => 1,
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
        'save preferences api' => [
            'method' => 'PATCH',
            'route' => 'users.savePreferences',
            'status' => 401,
            'id' => 1,
            'data' => ['language' => 'pl'],
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
        'change password api' => [
            'method' => 'PUT',
            'route' => 'users.changePassword',
            'status' => 401,
            'id' => 1,
            'data' => changePasswordData,
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
        'upload avatar api' => [
            'method' => 'POST',
            'route' => 'users.uploadAvatar',
            'status' => 401,
            'id' => 1,
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
        'delete avatar api' => [
            'method' => 'DELETE',
            'route' => 'users.deleteAvatar',
            'status' => 401,
            'id' => 1,
            'structure' => ['message'],
            'fragment' => ['message' => 'Unauthenticated.'],
        ],
    ]);
});

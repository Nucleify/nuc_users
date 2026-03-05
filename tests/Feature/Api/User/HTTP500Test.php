<?php

if (!defined('PEST_RUNNING')) {
    return;
}

uses()->group('user-api-500');
uses()->group('api-500');

use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\mock;

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
    $this->service = mock(UserService::class);
});

describe('500', function (): void {
    test('index api', function (): void {
        $this->service
            ->shouldReceive('index')
            ->once()
            ->andThrow(new Exception('Internal Server Error'));

        $this->getJson(route('users.index'))
            ->assertStatus(500)
            ->assertJson(['error' => 'Internal Server Error']);
    });

    test('show api', function (): void {
        $this->service
            ->shouldReceive('show')
            ->with(1)
            ->once()
            ->andThrow(new Exception('Internal Server Error'));

        $this->getJson(route('users.show', ['id' => 1]))
            ->assertStatus(500)
            ->assertJson(['error' => 'Internal Server Error']);
    });

    test('store api', function (): void {
        $this->service
            ->shouldReceive('create')
            ->once()
            ->andThrow(new Exception('Internal Server Error'));

        $this->postJson(route('users.store'), userData)
            ->assertStatus(500)
            ->assertJson(['error' => 'Internal Server Error']);
    });

    test('update api', function (): void {
        $this->service
            ->shouldReceive('update')
            ->with(1, Mockery::any())
            ->once()
            ->andThrow(new Exception('Internal Server Error'));

        $this->putJson(route('users.update', userData['id']), updatedUserData)
            ->assertStatus(500)
            ->assertJson(['error' => 'Internal Server Error']);
    });

    test('destroy api', function (): void {
        $model = User::factory()->create();

        $this->service
            ->shouldReceive('delete')
            ->once()
            ->andThrow(new Exception('Internal Server Error'));

        $this->deleteJson(route('users.destroy', ['id' => $model->id]))
            ->assertStatus(500)
            ->assertJson(['error' => 'Internal Server Error']);
    });

    test('save preferences api', function (): void {
        $this->service
            ->shouldReceive('savePreferences')
            ->once()
            ->andThrow(new Exception('Internal Server Error'));

        $this->patchJson(route('users.savePreferences', ['id' => 1]), ['language' => 'pl'])
            ->assertStatus(500)
            ->assertJson(['error' => 'Internal Server Error']);
    });

    test('change password api', function (): void {
        $this->service
            ->shouldReceive('changePassword')
            ->once()
            ->andThrow(new Exception('Internal Server Error'));

        $this->putJson(route('users.changePassword', ['id' => 1]), changePasswordData)
            ->assertStatus(500)
            ->assertJson(['error' => 'Internal Server Error']);
    });

    test('upload avatar api', function (): void {
        Storage::fake('public');

        $this->service
            ->shouldReceive('uploadAvatar')
            ->once()
            ->andThrow(new Exception('Internal Server Error'));

        $file = UploadedFile::fake()->image('avatar.jpg');

        $this->postJson(route('users.uploadAvatar', ['id' => 1]), ['avatar' => $file])
            ->assertStatus(500);
    });

    test('delete avatar api', function (): void {
        $this->service
            ->shouldReceive('deleteAvatar')
            ->once()
            ->andThrow(new Exception('Internal Server Error'));

        $this->deleteJson(route('users.deleteAvatar', ['id' => 1]))
            ->assertStatus(500)
            ->assertJson(['error' => 'Internal Server Error']);
    });
});

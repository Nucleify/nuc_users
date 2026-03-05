<?php

if (!defined('PEST_RUNNING')) {
    return;
}

uses()->group('user-api-200');
uses()->group('api-200');

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
});

describe('200', function (): void {
    test('index api', function (): void {
        $this->getJson(route('users.index'))
            ->assertOk();
    });

    test('countByCreatedLastWeek api', function (): void {
        User::factory(3)->create();

        $this->getJson(route('users.countByCreatedLastWeek'))
            ->assertOk();
    });

    test('store api', function (): void {
        $this->postJson(route('users.store'), userData)
            ->assertOk();
    });

    test('show api', function (): void {
        $model = User::factory()->create();

        $this->getJson(route('users.show', $model->id))
            ->assertOk();
    });

    test('update api', function (): void {
        $model = User::factory()->create();

        $this->putJson(route('users.update', $model->id), updatedUserData)
            ->assertOk();
    });

    test('destroy api', function (): void {
        $model = User::factory()->create();

        $this->deleteJson(route('users.destroy', $model->id))
            ->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $model->id]);
    });

    test('save preferences api with language', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->patchJson(route('users.savePreferences', $user->id), ['language' => 'pl'])
            ->assertOk();

        expect($user->fresh()->language)->toBe('pl');
    });

    test('save preferences api with country', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->patchJson(route('users.savePreferences', $user->id), ['country' => 'germany'])
            ->assertOk();

        expect($user->fresh()->country)->toBe('germany');
    });

    test('save preferences api with both', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->patchJson(route('users.savePreferences', $user->id), ['language' => 'vn', 'country' => 'france'])
            ->assertOk();

        expect($user->fresh()->language)->toBe('vn')
            ->and($user->fresh()->country)->toBe('france');
    });

    test('change password api', function (): void {
        $user = User::factory()->create(['password' => bcrypt('password')]);
        $this->actingAs($user);

        $this->putJson(route('users.changePassword', $user->id), changePasswordData)
            ->assertOk();
    });

    test('upload avatar api', function (): void {
        Storage::fake('public');
        $model = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg');

        $this->postJson(route('users.uploadAvatar', $model->id), ['avatar' => $file])
            ->assertOk();
    });

    test('delete avatar api', function (): void {
        Storage::fake('public');
        $model = User::factory()->create(['avatar' => 'avatars/test.jpg']);
        Storage::disk('public')->put('avatars/test.jpg', 'fake');

        $this->deleteJson(route('users.deleteAvatar', $model->id))
            ->assertOk();
    });
});

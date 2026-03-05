<?php

if (!defined('PEST_RUNNING')) {
    return;
}

use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
    $this->service = app()->make(UserService::class);
});

describe('index', function (): void {
    test('returns all users', function (): void {
        $result = $this->service->index();

        expect($result)->not->toBeEmpty();
    });

    test('throws when non-staff user fetches all', function (): void {
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user);

        expect(fn () => $this->service->index())->toThrow(Exception::class);
    });
});

describe('show', function (): void {
    test('returns user by id', function (): void {
        $model = User::factory()->create();

        $result = $this->service->show($model->id);

        expect($result->id)->toBe($model->id);
    });

    test('throws when regular user fetches other user', function (): void {
        $user = User::factory()->create(['role' => 'user']);
        $other = User::factory()->create();
        $this->actingAs($user);

        expect(fn () => $this->service->show($other->id))->toThrow(Exception::class);
    });
});

describe('create', function (): void {
    test('creates a user', function (): void {
        $result = $this->service->create(userData);

        expect($result->name)->toBe(userData['name'])
            ->and($result->email)->toBe(userData['email']);
    });

    test('throws when non-staff user creates', function (): void {
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user);

        expect(fn () => $this->service->create(userData))->toThrow(Exception::class);
    });
});

describe('update', function (): void {
    test('updates a user', function (): void {
        $model = User::factory()->create();

        $result = $this->service->update($model->id, updatedUserData);

        expect($result->name)->toBe(updatedUserData['name'])
            ->and($result->email)->toBe(updatedUserData['email']);
    });

    test('regular user can update own data', function (): void {
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user);

        $result = $this->service->update($user->id, [
            'name' => 'New Name',
            'email' => $user->email,
            'role' => 'user',
        ]);

        expect($result->name)->toBe('New Name');
    });

    test('updates user language and country', function (): void {
        $model = User::factory()->create(['language' => 'en', 'country' => 'poland']);

        $result = $this->service->update($model->id, [
            'name' => $model->name,
            'email' => $model->email,
            'role' => $model->role,
            'language' => 'pl',
            'country' => 'germany',
        ]);

        expect($result->language)->toBe('pl')
            ->and($result->country)->toBe('germany');
    });

    test('throws when regular user updates other user', function (): void {
        $user = User::factory()->create(['role' => 'user']);
        $other = User::factory()->create();
        $this->actingAs($user);

        expect(fn () => $this->service->update($other->id, updatedUserData))
            ->toThrow(Exception::class);
    });
});

describe('delete', function (): void {
    test('deletes a user', function (): void {
        $model = User::factory()->create();

        $result = $this->service->delete($model->id);

        expect($result)->toBe(['success' => true]);
        $this->assertDatabaseMissing('users', ['id' => $model->id]);
    });

    test('throws when regular user deletes other user', function (): void {
        $user = User::factory()->create(['role' => 'user']);
        $other = User::factory()->create();
        $this->actingAs($user);

        expect(fn () => $this->service->delete($other->id))->toThrow(Exception::class);
    });
});

describe('savePreferences', function (): void {
    test('saves language only', function (): void {
        $user = User::factory()->create(['language' => 'en']);
        $this->actingAs($user);

        $result = $this->service->savePreferences($user->id, ['language' => 'pl']);

        expect($result->resource->language)->toBe('pl');
    });

    test('saves country only', function (): void {
        $user = User::factory()->create(['country' => 'poland']);
        $this->actingAs($user);

        $result = $this->service->savePreferences($user->id, ['country' => 'germany']);

        expect($result->resource->country)->toBe('germany');
    });

    test('saves both language and country', function (): void {
        $user = User::factory()->create(['language' => 'en', 'country' => 'poland']);
        $this->actingAs($user);

        $result = $this->service->savePreferences($user->id, ['language' => 'vn', 'country' => 'france']);

        expect($result->resource->language)->toBe('vn')
            ->and($result->resource->country)->toBe('france');
    });

    test('ignores non-preference fields', function (): void {
        $user = User::factory()->create(['name' => 'Original Name']);
        $this->actingAs($user);

        $this->service->savePreferences($user->id, ['language' => 'pl', 'name' => 'Hacked']);

        expect($user->fresh()->name)->toBe('Original Name');
    });

    test('throws when saving preferences for another user', function (): void {
        $user = User::factory()->create(['role' => 'user']);
        $other = User::factory()->create();
        $this->actingAs($user);

        expect(fn () => $this->service->savePreferences($other->id, ['language' => 'pl']))
            ->toThrow(Exception::class);
    });
});

describe('changePassword', function (): void {
    test('changes user password', function (): void {
        $user = User::factory()->create(['password' => Hash::make('oldpassword')]);
        $this->actingAs($user);

        $result = $this->service->changePassword($user->id, 'newpassword123');

        expect($result->id)->toBe($user->id);
        expect(Hash::check('newpassword123', $user->fresh()->password))->toBeTrue();
    });

    test('throws when changing other user password', function (): void {
        $user = User::factory()->create(['role' => 'user']);
        $other = User::factory()->create();
        $this->actingAs($user);

        expect(fn () => $this->service->changePassword($other->id, 'newpassword123'))
            ->toThrow(Exception::class);
    });
});

describe('uploadAvatar', function (): void {
    test('uploads avatar for user', function (): void {
        Storage::fake('public');
        $model = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg');

        $result = $this->service->uploadAvatar($model->id, $file);

        expect($result->id)->toBe($model->id);
        expect($model->fresh()->avatar)->not->toBeNull();
    });

    test('replaces existing avatar', function (): void {
        Storage::fake('public');
        $model = User::factory()->create(['avatar' => 'avatars/old.jpg']);
        Storage::disk('public')->put('avatars/old.jpg', 'fake');
        $file = UploadedFile::fake()->image('new-avatar.jpg');

        $this->service->uploadAvatar($model->id, $file);

        Storage::disk('public')->assertMissing('avatars/old.jpg');
        expect($model->fresh()->avatar)->not->toBe('avatars/old.jpg');
    });

    test('throws when user uploads avatar for other user', function (): void {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'user']);
        $other = User::factory()->create();
        $this->actingAs($user);
        $file = UploadedFile::fake()->image('avatar.jpg');

        expect(fn () => $this->service->uploadAvatar($other->id, $file))
            ->toThrow(Exception::class);
    });
});

describe('deleteAvatar', function (): void {
    test('deletes avatar for user', function (): void {
        Storage::fake('public');
        $model = User::factory()->create(['avatar' => 'avatars/test.jpg']);
        Storage::disk('public')->put('avatars/test.jpg', 'fake');

        $result = $this->service->deleteAvatar($model->id);

        expect($result->id)->toBe($model->id);
        expect($model->fresh()->avatar)->toBeNull();
        Storage::disk('public')->assertMissing('avatars/test.jpg');
    });

    test('throws when user deletes avatar for other user', function (): void {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'user']);
        $other = User::factory()->create(['avatar' => 'avatars/test.jpg']);
        $this->actingAs($user);

        expect(fn () => $this->service->deleteAvatar($other->id))
            ->toThrow(Exception::class);
    });
});

describe('showAvatar', function (): void {
    test('returns avatar path for user', function (): void {
        Storage::fake('public');
        $model = User::factory()->create(['avatar' => 'avatars/test.jpg']);
        Storage::disk('public')->put('avatars/test.jpg', 'fake');

        $result = $this->service->showAvatar($model->id);

        expect($result)->toBe('avatars/test.jpg');
    });

    test('throws when avatar not found', function (): void {
        $model = User::factory()->create(['avatar' => null]);

        expect(fn () => $this->service->showAvatar($model->id))
            ->toThrow(Exception::class);
    });

    test('throws when user views avatar for other user', function (): void {
        Storage::fake('public');
        $user = User::factory()->create(['role' => 'user']);
        $other = User::factory()->create(['avatar' => 'avatars/test.jpg']);
        $this->actingAs($user);

        expect(fn () => $this->service->showAvatar($other->id))
            ->toThrow(Exception::class);
    });
});

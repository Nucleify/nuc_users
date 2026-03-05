<?php

if (!defined('PEST_RUNNING')) {
    return;
}

use App\Http\Controllers\UserController;
use App\Http\Requests\User\ChangePasswordRequest;
use App\Http\Requests\User\PostRequest;
use App\Http\Requests\User\PutRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
    $this->controller = app()->makeWith(UserController::class, ['userService' => app()->make(UserService::class)]);
});

describe('200', function (): void {
    test('index method', function (): void {
        $response = $this->controller->index();

        expect($response->getStatusCode(), $response->getData(true))->toEqual(200);
    });

    test('countByCreatedLastWeek method', function (): void {
        $request = new Request;

        $response = $this->controller->countByCreatedLastWeek($request);

        expect($response->getStatusCode())->toEqual(200);
    });

    test('show method', function (): void {
        $model = User::factory()->create();

        $response = $this->controller->show($model->id);

        expect($response->getStatusCode(), $response->getData(true))->toEqual(200);
    });

    test('store method', function (): void {
        $request = Mockery::mock(PostRequest::class);
        $request->shouldReceive('validated')
            ->andReturn(userData);

        $response = $this->controller->store($request);

        expect($response->getStatusCode(), $response->getData(true))->toEqual(200);
    });

    test('update method', function (): void {
        $model = User::factory()->create();

        $request = Mockery::mock(PutRequest::class);
        $request->shouldReceive('validated')
            ->andReturn(updatedUserData);

        $response = $this->controller->update($request, $model->id);

        expect($response->getStatusCode(), $response->getData(true))->toEqual(200);
    });

    test('delete method', function (): void {
        $model = User::factory()->create();

        $response = $this->controller->destroy($model->id);

        expect($response->getStatusCode(), $response->getData(true)['deleted'])
            ->toEqual(200)
            ->and($this->assertDatabaseMissing('users', ['id' => $model->id]));
    });

    test('savePreferences method with language', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = new Request;
        $request->merge(['language' => 'pl']);

        $response = $this->controller->savePreferences($request, $user->id);

        expect($response->getStatusCode())->toEqual(200);
        expect($user->fresh()->language)->toBe('pl');
    });

    test('savePreferences method with country', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $request = new Request;
        $request->merge(['country' => 'germany']);

        $response = $this->controller->savePreferences($request, $user->id);

        expect($response->getStatusCode())->toEqual(200);
        expect($user->fresh()->country)->toBe('germany');
    });

    test('changePassword method', function (): void {
        $user = User::factory()->create(['password' => bcrypt('password')]);
        $this->actingAs($user);

        $request = Mockery::mock(ChangePasswordRequest::class);
        $request->shouldReceive('validated')
            ->andReturn(changePasswordData);

        $response = $this->controller->changePassword($request, $user->id);

        expect($response->getStatusCode())->toEqual(200);
    });

    test('uploadAvatar method', function (): void {
        Storage::fake('public');
        $model = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg');

        $request = new Request;
        $request->files->set('avatar', $file);

        $response = $this->controller->uploadAvatar($request, $model->id);

        expect($response->getStatusCode())->toEqual(200);
    });

    test('deleteAvatar method', function (): void {
        Storage::fake('public');
        $model = User::factory()->create(['avatar' => 'avatars/test.jpg']);
        Storage::disk('public')->put('avatars/test.jpg', 'fake');

        $response = $this->controller->deleteAvatar($model->id);

        expect($response->getStatusCode())->toEqual(200);
    });

    test('showAvatar method', function (): void {
        Storage::fake('public');
        $model = User::factory()->create(['avatar' => 'avatars/test.jpg']);
        Storage::disk('public')->put('avatars/test.jpg', 'fake');

        $response = $this->controller->showAvatar($model->id);

        expect($response->getStatusCode())->toEqual(200);
    });
});

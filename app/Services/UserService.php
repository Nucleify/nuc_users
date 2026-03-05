<?php

namespace App\Services;

use App\Models\User;
use App\Resources\UserResource;
use App\Traits\Setters\RequestSetterTrait;
use App\Traits\Setters\TimeSetterTrait;
use App\Traits\Setters\UserSetterTrait;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserService
{
    use RequestSetterTrait;
    use TimeSetterTrait;
    use UserSetterTrait;

    public function __construct(
        private readonly User $model,
        protected string $entity = 'user',
        private readonly LoggerService $logger = new LoggerService
    ) {}

    /**
     * @return AnonymousResourceCollection
     *
     * @throws Exception
     */
    public function index(): AnonymousResourceCollection
    {
        $this->defineUserData();

        if (!$this->isCauserStaff) {
            $this->logger->logAndThrow(
                "User: ''{$this->causer->name}'' tried to fetch all users data, but he doesn't have permissions",
                'Only admins or tech users can fetch all users data'
            );
        }

        $this->logger->logMessage("User: ''{$this->causer->name}'' has fetched all users data");

        return UserResource::collection($this->model->all());
    }

    /**
     * @param Request $request
     *
     * @return int
     *
     * @throws Exception
     */
    public function countByCreatedLastWeek(Request $request): int
    {
        $this->defineRequestData($request);
        $this->defineTimeData();
        $this->defineUserData();

        if (!$this->isCauserStaff) {
            $this->logger->logAndThrow(
                "User: ''{$this->causer->name}'' tried to fetch all users data, but he doesn't have permissions",
                'Only admins or tech users can fetch all users data'
            );
        }

        $result = $this->model->whereDate('created_at', '>=', $this->lastWeek)->count();

        $this->logger->logIndex($this->causer->name, $this->entity, $this->isRefererAdmin);

        return $result;
    }

    /**
     * @param int $id
     *
     * @return UserResource
     *
     * @throws Exception
     */
    public function show($id): UserResource
    {
        $this->defineUserData();

        $result = $this->model::findOrFail($id);

        if (!$this->isCauserStaff && $this->causer->id !== $result->id) {
            $this->logger->logAndThrow(
                "User: ''{$this->causer->name}'' tried to fetch other user data, but he doesn't have permissions",
                "You don't have permission to fetch this user"
            );
        }

        $this->logger->log($this->causer->name, $result->name, $this->entity, 'showed');

        return new UserResource($result);
    }

    /**
     * @param array $data
     *
     * @return UserResource
     *
     * @throws Exception
     */
    public function create(array $data): UserResource
    {
        $this->defineUserData();

        if (!$this->isCauserStaff) {
            $this->logger->logAndThrow(
                "User: ''{$this->causer->name}'' tried to create a user, but he doesn't have permissions",
                'Only admins can create users'
            );
        }

        $result = $this->model::create($data);

        $this->logger->log($this->causer->name, $result->name, $this->entity, 'created');

        return new UserResource($result);
    }

    /**
     * @param int $id
     * @param array $data
     *
     * @return UserResource
     *
     * @throws Exception
     */
    public function update($id, array $data): UserResource
    {
        $this->defineUserData();

        $result = $this->model::findOrFail($id);

        $conditions = [
            [str_contains($this->causer->name, 'Test Admin') && $this->model->isSuperAdmin(),
                "User: ''{$this->causer->name}'' tried to update super admin data, but he doesn't have permissions",
                "Test Admin can't update super admin",
            ],

            [str_contains($this->causer->name, 'Test Admin') && $this->model->isAdmin(),
                "User: ''{$this->causer->name}'' tried to update admin data, but he doesn't have permissions",
                "Test Admin can't update admin",
            ],

            [str_contains($this->causer->name, 'Test Admin') && str_contains($result->name, 'Test') && $this->causer->id !== $result->id,
                "User: ''{$this->causer->name}'' tried to update test user data, but he can't update test users",
                "Test Admin can't update test users",
            ],

            [$this->causer->isAdmin() && $result->isSuperAdmin(),
                "Admin tried to update super admin data, but he doesn't have permissions",
                "Admin can't update super admin",
            ],

            [$this->causer->isUser() && $this->causer->id !== $result->id,
                "User: ''{$this->causer->name}'' tried to update other user data, but he doesn't have permissions",
                "Can't update other user without admin permissions",
            ],
        ];

        foreach ($conditions as [$condition, $logMessage, $exceptionMessage]) {
            if ($condition) {
                $this->logger->logAndThrow($logMessage, $exceptionMessage);
            }
        }

        $result->update($data);

        $this->logger->log($this->causer->name, $result->name, $this->entity, 'updated');

        return new UserResource($result->fresh());
    }

    /**
     * @throws Exception
     */
    public function changePassword($id, string $newPassword): UserResource
    {
        $this->defineUserData();

        $user = $this->model::findOrFail($id);

        if ($this->causer->id !== $user->id) {
            $this->logger->logAndThrow(
                "User: ''{$this->causer->name}'' tried to change password for another user",
                'You can only change your own password'
            );
        }

        $user->update(['password' => Hash::make($newPassword)]);

        $this->logger->log($this->causer->name, $user->name, $this->entity, 'changed password for');

        return new UserResource($user->fresh());
    }

    /**
     * @throws Exception
     */
    public function savePreferences($id, array $data): UserResource
    {
        $this->defineUserData();

        $user = $this->model::findOrFail($id);

        if ($this->causer->id !== $user->id) {
            $this->logger->logAndThrow(
                "User: ''{$this->causer->name}'' tried to update preferences for another user",
                'You can only update your own preferences'
            );
        }

        $allowed = array_intersect_key($data, array_flip(['language', 'country']));
        $user->update($allowed);

        $this->logger->log($this->causer->name, $user->name, $this->entity, 'updated preferences for');

        return new UserResource($user->fresh());
    }

    /**
     * @throws Exception
     */
    public function uploadAvatar($id, UploadedFile $file): UserResource
    {
        $this->defineUserData();

        $user = $this->model::findOrFail($id);

        if (!$this->isCauserStaff && $this->causer->id !== $user->id) {
            $this->logger->logAndThrow(
                "User: ''{$this->causer->name}'' tried to upload avatar for another user",
                "You don't have permission to update this user's avatar"
            );
        }

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        Storage::disk('public')->makeDirectory('avatars');
        $path = Storage::disk('public')->putFile('avatars', $file);

        if (!$path || !Storage::disk('public')->exists($path)) {
            $this->logger->logAndThrow(
                "User: ''{$this->causer->name}'' avatar upload failed because file was not written to storage",
                'Avatar file was not saved on disk'
            );
        }

        $user->update(['avatar' => $path]);

        $this->logger->log($this->causer->name, $user->name, $this->entity, 'updated avatar for');

        return new UserResource($user->fresh());
    }

    /**
     * @throws Exception
     */
    public function showAvatar($id): string
    {
        $this->defineUserData();

        $user = $this->model::findOrFail($id);

        if (!$this->isCauserStaff && $this->causer->id !== $user->id) {
            $this->logger->logAndThrow(
                "User: ''{$this->causer->name}'' tried to view avatar for another user",
                "You don't have permission to view this user's avatar"
            );
        }

        if (!$user->avatar || !Storage::disk('public')->exists($user->avatar)) {
            $this->logger->logAndThrow(
                "User: ''{$this->causer->name}'' tried to view missing avatar for user: ''{$user->name}''",
                'Avatar not found'
            );
        }

        $this->logger->log($this->causer->name, $user->name, $this->entity, 'viewed avatar for');

        return $user->avatar;
    }

    /**
     * @throws Exception
     */
    public function deleteAvatar($id): UserResource
    {
        $this->defineUserData();

        $user = $this->model::findOrFail($id);

        if (!$this->isCauserStaff && $this->causer->id !== $user->id) {
            $this->logger->logAndThrow(
                "User: ''{$this->causer->name}'' tried to delete avatar for another user",
                "You don't have permission to update this user's avatar"
            );
        }

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        $this->logger->log($this->causer->name, $user->name, $this->entity, 'deleted avatar for');

        return new UserResource($user->fresh());
    }

    /**
     * @param int $id
     *
     * @return true[]
     *
     * @throws Exception
     */
    public function delete($id): array
    {
        $this->defineUserData();

        $result = User::findOrFail($id);

        $conditions = [
            [str_contains($this->causer->name, 'Test Admin') && $result->isSuperAdmin(),
                "User: ''{$this->causer->name}'' tried to delete super admin data, but he doesn't have permissions",
                "Test Admin can't delete super admin",
            ],

            [str_contains($this->causer->name, 'Test Admin') && $result->isAdmin(),
                "User: ''{$this->causer->name}'' tried to delete admin data, but he doesn't have permissions",
                "Test Admin can't delete admin",
            ],

            [str_contains($this->causer->name, 'Test Admin') && str_contains($result->name, 'Test') && $this->causer->id !== $result->id,
                "User: ''{$this->causer->name}'' tried to delete test user data, but he can't delete test users",
                "Test Admin can't delete test users",
            ],

            [$this->causer->isAdmin() && $result->isSuperAdmin(),
                "Admin tried to delete super admin data, but he doesn't have permissions",
                "Admin can't delete super admin",
            ],

            [$this->causer->isUser() && $this->causer->id !== $result->id,
                "User: ''{$this->causer->name}'' tried to delete other user data, but he doesn't have permissions",
                "Can't delete other user without admin permissions",
            ],
        ];

        foreach ($conditions as [$condition, $logMessage, $exceptionMessage]) {
            if ($condition) {
                $this->logger->logAndThrow($logMessage, $exceptionMessage);
            }
        }

        $result->delete();

        $this->logger->log($this->causer->name, $result->name, $this->entity, 'deleted');

        return ['success' => true];
    }
}

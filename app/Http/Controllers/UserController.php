<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\ChangePasswordRequest;
use App\Http\Requests\User\PostRequest;
use App\Http\Requests\User\PutRequest;
use App\Models\User;
use App\Services\UserService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    private UserService $service;

    public function __construct(UserService $service)
    {
        $this->service = $service;
    }

    public function index(): JsonResponse
    {
        try {
            $result = $this->service->index();

            return response()->json($result);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function countByCreatedLastWeek(Request $request): JsonResponse
    {
        try {
            $result = $this->service->countByCreatedLastWeek($request);

            return response()->json($result);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $result = $this->service->show($id);

            return response()->json($result);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(PostRequest $request): JsonResponse
    {
        try {
            $input = $request->validated();
            $result = $this->service->create($input);

            return response()->json([
                $result,
                'message' => 'Successfully created: ' . $result['name'] . ' user',
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(PutRequest $request, $id): JsonResponse
    {
        try {
            $input = $request->validated();
            $result = $this->service->update($id, $input);

            return response()->json([
                $result,
                'message' => 'Successfully updated: ' . $result['name'] . ' user',
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function changePassword(ChangePasswordRequest $request, $id): JsonResponse
    {
        try {
            $input = $request->validated();
            $result = $this->service->changePassword($id, $input['password']);

            return response()->json([
                $result,
                'message' => 'Password changed successfully',
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function savePreferences(Request $request, $id): JsonResponse
    {
        try {
            $input = $request->validate([
                'language' => 'nullable|string|max:10',
                'country' => 'nullable|string|max:50',
            ]);

            $result = $this->service->savePreferences($id, $input);

            return response()->json([
                $result,
                'message' => 'Preferences saved successfully',
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function uploadAvatar(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
            ]);

            $result = $this->service->uploadAvatar($id, $request->file('avatar'));

            return response()->json([
                $result,
                'message' => 'Avatar uploaded successfully',
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteAvatar($id): JsonResponse
    {
        try {
            $result = $this->service->deleteAvatar($id);

            return response()->json([
                $result,
                'message' => 'Avatar removed successfully',
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function showAvatar($id): JsonResponse|StreamedResponse
    {
        try {
            $path = $this->service->showAvatar($id);

            return Storage::disk('public')->response($path);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $result = User::findOrFail($id);
            $this->service->delete($id);

            return response()->json([
                'deleted' => true,
                'message' => 'Successfully deleted: ' . $result->name . ' user',
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

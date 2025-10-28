<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log; // <-- 1. ADD THIS for logging errors
use Exception; // <-- 2. ADD THIS to catch generic errors

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile photo.
     */
    public function updatePhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048', // 2MB Max
        ]);

        try { // <-- 3. ADD try...catch block
            $user = $request->user();
            $old_avatar = $user->avatar;

            // Store the new photo
            $path = $request->file('photo')->store('avatars', 'public');

            // Update the user's avatar path in the database
            $user->update([
                'avatar' => $path,
            ]);

            // Delete the old photo *after* successful update
            if ($old_avatar && str_starts_with($old_avatar, 'avatars/')) {
                if (Storage::disk('public')->exists($old_avatar)) {
                    Storage::disk('public')->delete($old_avatar);
                }
            }

            // Return the full URL and a success message
            return response()->json([
                'path' => Storage::url($path),
                'message' => 'Photo updated successfully!' // <-- 4. Clear success message
            ], 200);

        } catch (Exception $e) {
            // 5. CATCH and log any error
            Log::error('Photo upload failed: ' . $e->getMessage());

            // Return a generic error to the user
            return response()->json([
                'message' => 'Photo upload failed. Please try again.'
            ], 500); // 500 Internal Server Error
        }
    }
    
    /**
     * Revert an uploaded photo.
     */
   public function revertPhoto(Request $request): JsonResponse
    {
        try { // <-- 6. ADD try...catch block
            $url_from_filepond = $request->getContent(); 
            $user = $request->user();
            $db_avatar_path = $user->avatar; 

            if (!$db_avatar_path) {
                return response()->json(['message' => 'No avatar path in database. Revert not needed.'], 200);
            }

            if (str_starts_with($db_avatar_path, 'http')) {
                if ($url_from_filepond === $db_avatar_path) {
                    $user->update(['avatar' => null]);
                    return response()->json(['message' => 'External avatar reverted successfully.'], 200);
                }
            } else {
                $db_avatar_url = Storage::url($db_avatar_path);
                if ($url_from_filepond === $db_avatar_url) {
                    if (Storage::disk('public')->exists($db_avatar_path)) {
                        Storage::disk('public')->delete($db_avatar_path);
                    }
                    $user->update(['avatar' => null]);
                    return response()->json(['message' => 'Internal avatar file reverted successfully.'], 200);
                }
            }
            
            return response()->json(['message' => 'Paths did not match. Revert skipped.'], 200);
            
        } catch (Exception $e) {
            // 7. CATCH and log any error
            Log::error('Photo revert failed: ' . $e->getMessage());

            // Return error to FilePond
            return response()->json([
                'message' => 'Photo revert failed. Please try again.'
            ], 500);
        }
    }

    /**
     * Update the user's main profile (name, email).
     */
     public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        // 8. ADD THIS to send a success flash message
        return to_route('profile.edit')->with('success', 'Profile updated successfully!');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
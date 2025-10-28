<?php

namespace App\Policies;

use App\Models\CsmpScholar;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CsmpScholarPolicy
{
    /**
     * Determine whether the user can view any models.
     * (e.g., in an admin dashboard)
     */
    public function viewAny(User $user): bool
    {
        // Allow any logged-in user to see their *own* list of applications.
        // The controller's query already filters by user_id.
        return true; 
    }

    /**
     * Determine whether the user can view the model.
     * This controls the 'show' page (viewing one specific application).
     */
  
    /**
     * Determine whether the user can view the model.
     * A user can view their own application, or an admin can.
     */
    public function view(User $user, CsmpScholar $csmpScholar): bool
    {
        // Allow a user to view an application if they own it OR if they are an admin.
        return $user->id === $csmpScholar->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     * Any logged-in user can create one.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * Only admins can update (e.g., change status)
     */
   // In app/Policies/CsmpScholarPolicy.php

public function update(User $user, CsmpScholar $csmpScholar): bool
{
    // Allow update if:
    // 1. The user owns the application AND its status is 'Incomplete'
    // OR
    // 2. The user is an Admin
    return ($user->id === $csmpScholar->user_id && $csmpScholar->status === 'Incomplete')
           || $user->isAdmin();
}

    /**
     * Determine whether the user can delete the model.
     * Only admins can delete.
     */
    public function delete(User $user, CsmpScholar $csmpScholar): bool
    {
        return $user->isAdmin();
    }
}
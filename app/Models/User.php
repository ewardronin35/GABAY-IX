<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles; // You already have this
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles; // This trait gives you the ->hasRole() method

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'provider_name',
        'provider_id',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ⬇️ **ADD THIS NEW METHOD** ⬇️
    /**
     * Check if the user has the 'Super Admin' role.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        // This checks if the user has the role named "Super Admin".
        // If your role is just "Admin", change it here.
        return $this->hasRole('Super Admin');
    }
    // ⬆️ **END OF NEW METHOD** ⬆️


    /**
     * Get the user's avatar URL.
     */
    public function getAvatarUrlAttribute(): string
    {
        // If the avatar is a full URL (from Google/Facebook), return it directly.
        if ($this->avatar && str_starts_with($this->avatar, 'http')) {
            return $this->avatar;
        }

        // If the avatar is a path to a file we stored, build the full URL.
        if ($this->avatar) {
            return Storage::disk('public')->url($this->avatar);
        }

        // If no avatar exists, generate a default one with the user's initials.
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF';
    }

    /**
     * Get the scholarship applications submitted by the user.
     */
    public function csmpScholars(): HasMany
    {
        return $this->hasMany(CsmpScholar::class);
    }

    public function travelClaims(): HasMany
    {
        return $this->hasMany(TravelClaim::class);
    }
    public function createdBatches(): HasMany
{
    return $this->hasMany(Batch::class, 'created_by_user_id');
}
}
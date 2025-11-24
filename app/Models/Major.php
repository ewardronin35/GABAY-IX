<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Major extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['major_name'];

    /**
     * The courses that belong to the major.
     */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_major', 'major_id', 'course_id');
    }
}
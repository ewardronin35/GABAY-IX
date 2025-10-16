<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Education extends Model
{
    use HasFactory;

    protected $table = 'education'; // Explicitly set table name to avoid pluralization issues

    protected $fillable = [
        'scholar_id', 'hei_name', 'type_of_heis', 'hei_code', 'program', 
        'priority_program_tagging', 'course_code',
    ];

    public function scholar(): BelongsTo
    {
        return $this->belongsTo(Scholar::class);
    }
}

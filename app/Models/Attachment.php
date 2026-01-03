<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Attachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'attachable_id',
        'attachable_type',
        'filepath',
        'filename',
        'mime_type',
        'size',
        'user_id', // ✨ ADD THIS
        'disk',    // ✨ ADD THIS
        'requirement_id', // ✨ ADD THIS
        'reference_id',    // ✅ Added
        'reference_table', // ✅ Added
    ];

  


    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }
    public function requirement()
    {
        return $this->belongsTo(Requirement::class);
    }
    public function reference()
    {
        return $this->morphTo(__FUNCTION__, 'reference_table', 'reference_id');
    }
}
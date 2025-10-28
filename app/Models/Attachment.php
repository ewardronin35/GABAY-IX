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
        'path',
        'filename',
        'mime_type',
        'size',
    ];

  


    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }
}
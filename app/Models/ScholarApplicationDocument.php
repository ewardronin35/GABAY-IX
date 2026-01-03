<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScholarApplicationDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'scholar_enrollment_id',
        'document_type', // e.g., 'INCOME_PROOF', 'GOOD_MORAL'
        'is_submitted',
        'file_path'
    ];

    public function enrollment()
    {
        return $this->belongsTo(ScholarEnrollment::class, 'scholar_enrollment_id');
    }
}
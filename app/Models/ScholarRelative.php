<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScholarRelative extends Model
{
    use HasFactory;

    protected $fillable = [
        'scholar_id',
        'relationship_type', // 'FATHER', 'MOTHER', 'GUARDIAN'
        'full_name',
        'occupation',
        'educational_attainment',
        'address',
        'is_living',
        'contact_no',
    ];

    public function scholar()
    {
        return $this->belongsTo(Scholar::class);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ThesisGrant extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year_id', 'processed_date', 'details', 'transferred_to_chedros',
        'nta', 'amount', 'disbursement_date', 'final_disbursement_date', 'remarks',
    ];

    protected $casts = [
        'processed_date' => 'date',
        'disbursement_date' => 'date',
        'final_disbursement_date' => 'date',
    ];

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }
}

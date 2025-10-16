<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'scholar_id', 'year', 'cy', 'osds_date_processed', 'transferred_to_chedros',
        'nta_financial_benefits', 'fund_source', 'payment_first_sem', 'first_sem_disbursement_date',
        'first_sem_status', 'first_sem_remarks', 'payment_second_sem', 'second_sem_disbursement_date',
        'second_sem_status', 'second_sem_fund_source'
    ];

    protected $casts = [
        'osds_date_processed' => 'date',
        'first_sem_disbursement_date' => 'date',
        'second_sem_disbursement_date' => 'date',
    ];

    public function scholar(): BelongsTo
    {
        return $this->belongsTo(Scholar::class);
    }

    public function thesisGrant(): HasOne
    {
        return $this->hasOne(ThesisGrant::class);
    }
}

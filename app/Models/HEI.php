<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HEI extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'heis';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'hei_name',
        'hei_code',
        'type_of_heis',
        'city',
        'province',
        'district',
    ];

    /**
     * Get all of the education records for the HEI.
     * An HEI can have many scholars' education records.
     */
    public function educations(): HasMany
    {
        return $this->hasMany(Education::class);
    }
}
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Requirement extends Model
{
    protected $fillable = ['name', 'code', 'is_active'];

    public function programs()
    {
        return $this->belongsToMany(Program::class, 'program_requirements');
    }
}
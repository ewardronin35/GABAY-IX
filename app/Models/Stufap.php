<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stufap extends Model
{
    use HasFactory;



    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    // ✨ FIX 1: Tell Laravel that 'award_number' is the primary key.
    protected $primaryKey = 'award_number';

    /**
     * Indicates if the model's ID is auto-incrementing.
     *
     * @var bool
     */
    // ✨ FIX 2: Tell Laravel that this key is not an auto-incrementing number.
    public $incrementing = false;

    /**
     * The data type of the auto-incrementing ID.
     *
     * @var string
     */
    // ✨ FIX 3: Tell Laravel that the key is a string (text).
    protected $keyType = 'string';

    /**
     * The attributes that aren't mass assignable.
     * This is still needed to allow your fields to be saved.
     * @var array
     */
    protected $guarded = [];


    /**
     * OR, if you prefer to be more explicit, you can use $fillable.
     * Uncomment the block below and list every single column name from your database.
     * Using $guarded = [] is faster to implement for now.
     */
    /*
    protected $fillable = [
        'award_year', 'program_name', 'status_type', 'region', 'award_number',
        'family_name', 'given_name', 'middle_name', 'extension_name', 'sex', 'date_of_birth',
        'registered_coconut_farmer', 'farmer_registry_no', 'special_group',
        'is_solo_parent', 'is_senior_citizen', 'is_pwd', 'is_ip', 'is_first_generation',
        'contact_no', 'email_address', 'brgy_street', 'town_city', 'province', 'congressional_district',
        'hei_name', 'type_of_heis', 'hei_code', 'program', 'priority_program_tagging', 'course_code',
        'cy_2023_2024', 'osds_date_processed_2023', 'transferred_to_chedros_2023',
        'nta_financial_benefits_2023', 'fund_source_2023', 'payment_first_sem_2023',
        'first_sem_2023_disbursement_date', 'first_sem_2023_status', 'first_sem_2023_remarks',
        'payment_second_sem_2023', 'second_sem_2023_disbursement_date', 'second_sem_2023_status',
        'second_sem_2023_fund_source', 'thesis_processed_date_2023', 'thesis_details_2023',
        'thesis_transferred_to_chedros_2023', 'thesis_nta_2023', 'thesis_amount_2023',
        'thesis_disbursement_date_2023', 'thesis_remarks_2023', 'cy_2024_2025',
        'osds_date_processed_2024', 'transferred_to_chedros_2024', 'nta_financial_benefits_2024',
        'fund_source_2024', 'payment_first_sem_2024', 'first_sem_2024_disbursement_date',
        'first_sem_2024_status', 'first_sem_2024_remarks', 'payment_second_sem_2024',
        'second_sem_2024_disbursement_date', 'second_sem_2024_status', 'second_sem_2024_fund_source',
        'thesis_processed_date_2024', 'thesis_details_2024', 'thesis_transferred_to_chedros_2024',
        'thesis_nta_2024', 'thesis_amount_2024', 'thesis_disbursement_date_2024',
        'thesis_final_disbursement_2024', 'thesis_remarks_2024'
    ];
    */
}
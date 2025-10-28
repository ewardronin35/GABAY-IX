<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTravelClaimRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * We'll set this to true. The route-level middleware 
     * ('auth', 'permission:create travel claims') 
     * is already handling authorization.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // --- Itinerary Validation ---
            'itinerary' => 'required|array',
            'itinerary.name' => 'required|string|max:255',
            'itinerary.position' => 'required|string|max:255',
            'itinerary.official_station' => 'required|string|max:255',
            'itinerary.date_of_travel' => 'required|string|max:100',
            'itinerary.purpose' => 'required|string',
            
            'itinerary.items' => 'required|array|min:1',
            'itinerary.items.*.date' => 'required|date',
            'itinerary.items.*.place' => 'required|string|max:255',
            'itinerary.items.*.transport_means' => 'required|string|max:100',
            'itinerary.items.*.fare' => 'required|numeric|min:0',
            'itinerary.items.*.per_diem' => 'required|numeric|min:0',
            'itinerary.items.*.others' => 'required|numeric|min:0',

            // --- Appendix B Validation ---
            'appendixB' => 'required|array',
            'appendixB.name' => 'required|string|max:255',
            'appendixB.position' => 'required|string|max:255',
            'appendixB.travel_order_no' => 'required|string|max:100',
            'appendixB.travel_order_date' => 'required|date',
            'appendixB.travel_condition' => 'required|string',
            'appendixB.date_signed_claimant' => 'required|date',
            'appendixB.attachments' => 'required|array', // The checkbox object

            // --- RER (Expense) Validation ---
            'rer' => 'required|array',
            'rer.items' => 'required|array|min:1',
            'rer.items.*.received_from' => 'required|string|max:255',
            'rer.items.*.amount_figures' => 'required|numeric|gt:0', // must be greater than 0
            'rer.items.*.amount_words' => 'required|string',
            'rer.items.*.payment_for' => 'required|string',

            // --- Optional Fields ---
            'report' => 'nullable|array',
            'attachments' => 'nullable|array',
            'attachments.*' => 'required|string', // Each item must be a string (the temp path)
        ];
    }
}
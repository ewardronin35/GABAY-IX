<?php

namespace App\Http\Controllers;

use App\Models\BillingRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

class BillingRecordController extends Controller
{
    /**
     * Update the specified billing record in storage.
     */
    public function update(Request $request, BillingRecord $billingRecord): RedirectResponse
    {
        // 1. Validate the incoming data
        $validated = $request->validate([
            'status' => 'required|string|in:On-going,Validated,Delisted',
            'remarks' => 'nullable|string|max:1000',
            'date_fund_request' => 'nullable|date',
            'date_sub_aro' => 'nullable|date',
            'date_nta' => 'nullable|date',
            'date_disbursed_hei' => 'nullable|date',
            'date_disbursed_grantee' => 'nullable|date',
            'billing_amount' => 'nullable|numeric|min:0',
        ]);

        // 2. If status is "Validated", set the user who validated it
        if ($validated['status'] === 'Validated') {
            $validated['validated_by_user_id'] = Auth::id();
        } else {
            $validated['validated_by_user_id'] = null;
        }
        
        // 3. Update the record
        $billingRecord->update($validated);

        // 4. Redirect back
        return redirect()->back()->with('success', 'Validation record updated.');
    }
}
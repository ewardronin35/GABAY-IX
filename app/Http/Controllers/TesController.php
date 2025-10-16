<?php

namespace App\Http\Controllers;

use App\Models\Tes;
use Illuminate\Http\Request;

class TesController extends Controller
{
    public function getTesData()
    {
        $tesData = Tes::with('scholar')->get();
        return response()->json($tesData);
    }

    public function updateTesData(Request $request)
    {
        $data = $request->all();

        foreach ($data as $row) {
            if (isset($row['id'])) {
                $tes = Tes::find($row['id']);
                if ($tes) {
                    $tes->update($row);
                }
            } else {
                Tes::create($row);
            }
        }

        return response()->json(['message' => 'TES data updated successfully']);
    }
}
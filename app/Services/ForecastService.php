<?php

namespace App\Services;

use App\Models\Barang;
use App\Models\BarangKeluar;
use App\Models\Forecasting;
use Carbon\Carbon;

class ForecastService
{
    public function forecast(int $barangId, int $periode = 3): array
    {
        $barang = Barang::findOrFail($barangId);

        // Tentukan format tanggal berdasarkan driver database
        $driver = \Illuminate\Support\Facades\DB::connection()->getDriverName();
        if ($driver === 'sqlite') {
            $dateExpr = "strftime('%Y-%m', created_at)";
        } elseif ($driver === 'pgsql') {
            $dateExpr = "to_char(created_at, 'YYYY-MM')";
        } else {
            $dateExpr = "DATE_FORMAT(created_at, '%Y-%m')"; // Fallback MySQL
        }

        // Ambil data keluar per bulan
        $dataKeluar = BarangKeluar::where('barang_id', $barangId)
            ->where('status', 'approved')
            ->where('created_at', '>=', \Carbon\Carbon::now()->subMonths($periode)->startOfMonth())
            ->selectRaw("{$dateExpr} as bulan, SUM(jumlah) as total")
            ->groupBy(\Illuminate\Support\Facades\DB::raw($dateExpr))
            ->orderBy('bulan')
            ->pluck('total', 'bulan')
            ->toArray();

        // Lengkapi bulan kosong dengan 0
        $months = [];
        for ($i = $periode - 1; $i >= 0; $i--) {
            $key          = Carbon::now()->subMonths($i)->format('Y-m');
            $months[$key] = $dataKeluar[$key] ?? 0;
        }

        $values     = array_values($months);
        $n          = count($values);
        $totalBobot = ($n * ($n + 1)) / 2;

        // Weighted Moving Average — bulan terbaru bobot terbesar
        $forecastValue = 0;
        foreach ($values as $index => $val) {
            $bobot          = $index + 1;
            $forecastValue += ($bobot / $totalBobot) * $val;
        }

        $forecastValue = (int) round($forecastValue);
        $safetyStock   = (int) round($forecastValue * 0.2);
        $reorderPoint  = $forecastValue + $safetyStock;

        $historis = array_map(
            fn($bulan, $total) => ['bulan' => $bulan, 'total' => (int) $total],
            array_keys($months),
            $values
        );

        // Simpan ke database
        Forecasting::updateOrCreate(
            [
                'barang_id' => $barangId,
                'periode'   => Carbon::now()->format('Y-m'),
            ],
            [
                'forecast_jumlah' => $forecastValue,
                'safety_stock'    => $safetyStock,
                'reorder_point'   => $reorderPoint,
                'metode'          => 'WMA',
                'data_historis'   => $historis,
            ]
        );

        return [
            'barang'               => $barang->nama_barang,
            'kode_barang'          => $barang->kode_barang,
            'stok_sekarang'        => $barang->stok,
            'stok_minimum'         => $barang->stok_minimum,
            'forecast_bulan_depan' => $forecastValue,
            'safety_stock'         => $safetyStock,
            'reorder_point'        => $reorderPoint,
            'perlu_restock'        => $barang->stok <= $reorderPoint,
            'saran'                => $barang->stok <= $reorderPoint
                ? "Segera restock! Stok ({$barang->stok}) di bawah reorder point ({$reorderPoint})"
                : "Stok aman. Tidak perlu restock sekarang.",
            'data_historis'        => $historis,
            'metode'               => "Weighted Moving Average ({$periode} bulan)",
        ];
    }
}

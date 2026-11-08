<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangKeluar;
use App\Models\User;
use App\Notifications\PendingApprovalNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BarangKeluarController extends Controller
{
    public function index()
    {
        return response()->json(
            BarangKeluar::with(['barang', 'user', 'approver'])
                ->latest()
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barang_id' => 'required|exists:barang,id',
            'jumlah' => 'required|integer|min:1',
            'tanggal' => 'required|date',
            'keterangan' => 'nullable|string',
        ]);

        $barangKeluar = DB::transaction(function () use ($validated, $request) {
            return BarangKeluar::create([
                ...$validated,
                'status' => 'pending',
                'user_id' => $request->user()->id,
            ]);
        });

        $managers = User::role('Manager')->get();

        foreach ($managers as $manager) {
            $manager->notify(
                new PendingApprovalNotification($barangKeluar)
            );
        }

        return response()->json($barangKeluar->load(['barang', 'user']), 201);
    }

    public function approve(Request $request, $id)
    {
        if (! $request->user()->hasRole('Manager')) {
            return response()->json([
                'message' => 'Hanya Manager yang boleh menyetujui pengeluaran barang.',
            ], 403);
        }

        $result = DB::transaction(function () use ($id, $request) {
            $barangKeluar = BarangKeluar::whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($barangKeluar->status !== 'pending') {
                return [
                    'error' => 'Pengajuan ini sudah diproses.',
                    'status' => 409,
                ];
            }

            $barang = Barang::whereKey($barangKeluar->barang_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($barang->stok < $barangKeluar->jumlah) {
                return [
                    'error' => 'Stok tidak cukup.',
                    'status' => 422,
                ];
            }

            $barang->decrement('stok', $barangKeluar->jumlah);

            $barangKeluar->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
            ]);

            return ['data' => $barangKeluar->fresh()->load(['barang', 'user', 'approver'])];
        });

        if (isset($result['error'])) {
            return response()->json([
                'message' => $result['error'],
            ], $result['status']);
        }

        return response()->json([
            'message' => 'Pengeluaran barang berhasil disetujui.',
            'data' => $result['data'],
        ]);
    }

    public function reject(Request $request, $id)
    {
        if (! $request->user()->hasRole('Manager')) {
            return response()->json([
                'message' => 'Hanya Manager yang boleh menolak pengeluaran barang.',
            ], 403);
        }

        $barangKeluar = DB::transaction(function () use ($id) {
            $pengajuan = BarangKeluar::whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($pengajuan->status !== 'pending') {
                return null;
            }

            $pengajuan->update(['status' => 'rejected']);

            return $pengajuan->fresh()->load(['barang', 'user', 'approver']);
        });

        if (! $barangKeluar) {
            return response()->json([
                'message' => 'Pengajuan ini sudah diproses.',
            ], 409);
        }

        return response()->json([
            'message' => 'Pengeluaran barang berhasil ditolak.',
            'data' => $barangKeluar,
        ]);
    }
}

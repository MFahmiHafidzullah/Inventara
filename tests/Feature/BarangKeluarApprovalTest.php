<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BarangKeluarApprovalTest extends TestCase
{
	use RefreshDatabase;

	protected function setUp(): void
	{
		parent::setUp();

		app()[\Spatie\Permission\PermissionRegistrar::class]
			->forgetCachedPermissions();

		Role::firstOrCreate([
			'name' => 'Admin',
			'guard_name' => 'web',
		]);

		Role::firstOrCreate([
			'name' => 'Staff',
			'guard_name' => 'web',
		]);

		Role::firstOrCreate([
			'name' => 'Manager',
			'guard_name' => 'web',
		]);
	}

	public function test_staff_cannot_approve_stock_out(): void
	{
		$staff = User::factory()->create();
		$staff->assignRole('Staff');

		Sanctum::actingAs($staff);

		$response = $this->postJson('/api/barang-keluar/1/approve');

		$response->assertForbidden();
	}

	public function test_admin_cannot_approve_stock_out(): void
	{
		$admin = User::factory()->create();
		$admin->assignRole('Admin');

		Sanctum::actingAs($admin);

		$response = $this->postJson('/api/barang-keluar/1/approve');

		$response->assertForbidden();
	}

	public function test_manager_can_approve_stock_out_and_decrease_stock(): void
	{
		$manager = User::factory()->create();
		$manager->assignRole('Manager');

		$category = \App\Models\Category::create([
			'nama_kategori' => 'Elektronik',
			'deskripsi' => 'Kategori untuk pengujian',
		]);

		$supplier = \App\Models\Supplier::create([
			'nama_supplier' => 'Supplier Test',
			'email' => 'supplier-test@example.com',
		]);

		$barang = \App\Models\Barang::create([
			'kode_barang' => 'TEST-001',
			'nama_barang' => 'Mouse Test',
			'category_id' => $category->id,
			'supplier_id' => $supplier->id,
			'stok' => 10,
			'stok_minimum' => 2,
			'harga_beli' => 50000,
			'harga_jual' => 75000,
		]);

		$pengajuan = \App\Models\BarangKeluar::create([
			'barang_id' => $barang->id,
			'jumlah' => 3,
			'tanggal' => now()->toDateString(),
			'status' => 'pending',
			'user_id' => $manager->id,
		]);

		\Laravel\Sanctum\Sanctum::actingAs($manager);

		$response = $this->postJson(
			"/api/barang-keluar/{$pengajuan->id}/approve"
		);

		$response->assertOk()
			->assertJsonPath('data.status', 'approved')
			->assertJsonPath('data.approved_by', $manager->id);

		$this->assertDatabaseHas('barang', [
			'id' => $barang->id,
			'stok' => 7,
		]);

		// Pengajuan yang sama tidak boleh mengurangi stok untuk kedua kalinya.
		$this->postJson(
			"/api/barang-keluar/{$pengajuan->id}/approve"
		)->assertStatus(409);

		$this->assertDatabaseHas('barang', [
			'id' => $barang->id,
			'stok' => 7,
		]);
	}


	public function test_manager_can_reject_stock_out_without_decreasing_stock(): void
	{
		$manager = User::factory()->create();
		$manager->assignRole('Manager');

		$category = \App\Models\Category::create([
			'nama_kategori' => 'Elektronik',
			'deskripsi' => 'Kategori pengujian',
		]);

		$supplier = \App\Models\Supplier::create([
			'nama_supplier' => 'Supplier Test',
			'email' => 'supplier-test@example.com',
		]);

		$barang = \App\Models\Barang::create([
			'kode_barang' => 'TEST-002',
			'nama_barang' => 'Keyboard Test',
			'category_id' => $category->id,
			'supplier_id' => $supplier->id,
			'stok' => 10,
			'stok_minimum' => 2,
			'harga_beli' => 100000,
			'harga_jual' => 150000,
		]);

		$pengajuan = \App\Models\BarangKeluar::create([
			'barang_id' => $barang->id,
			'jumlah' => 3,
			'tanggal' => now()->toDateString(),
			'status' => 'pending',
			'user_id' => $manager->id,
		]);

		\Laravel\Sanctum\Sanctum::actingAs($manager);

		$this->postJson(
			"/api/barang-keluar/{$pengajuan->id}/reject"
		)
			->assertOk()
			->assertJsonPath('data.status', 'rejected');

		$this->assertDatabaseHas('barang', [
			'id' => $barang->id,
			'stok' => 10,
		]);

		// Pengajuan yang sudah ditolak tidak boleh diproses ulang.
		$this->postJson(
			"/api/barang-keluar/{$pengajuan->id}/reject"
		)->assertStatus(409);

		$this->assertDatabaseHas('barang', [
			'id' => $barang->id,
			'stok' => 10,
		]);
	}


	public function test_manager_cannot_approve_stock_out_when_stock_is_insufficient(): void
	{
		$manager = User::factory()->create();
		$manager->assignRole('Manager');

		$category = \App\Models\Category::create([
			'nama_kategori' => 'Elektronik',
			'deskripsi' => 'Kategori pengujian',
		]);

		$supplier = \App\Models\Supplier::create([
			'nama_supplier' => 'Supplier Test',
			'email' => 'supplier-test@example.com',
		]);

		$barang = \App\Models\Barang::create([
			'kode_barang' => 'TEST-003',
			'nama_barang' => 'Monitor Test',
			'category_id' => $category->id,
			'supplier_id' => $supplier->id,
			'stok' => 2,
			'stok_minimum' => 1,
			'harga_beli' => 1000000,
			'harga_jual' => 1500000,
		]);

		$pengajuan = \App\Models\BarangKeluar::create([
			'barang_id' => $barang->id,
			'jumlah' => 5,
			'tanggal' => now()->toDateString(),
			'status' => 'pending',
			'user_id' => $manager->id,
		]);

		\Laravel\Sanctum\Sanctum::actingAs($manager);

		$this->postJson(
			"/api/barang-keluar/{$pengajuan->id}/approve"
		)
			->assertStatus(422)
			->assertJsonPath('message', 'Stok tidak cukup.');

		$this->assertDatabaseHas('barang', [
			'id' => $barang->id,
			'stok' => 2,
		]);

		$this->assertDatabaseHas('barang_keluar', [
			'id' => $pengajuan->id,
			'status' => 'pending',
		]);
	}
}

<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    protected function ensureAdmin()
    {
        $user = Auth::user();
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }

public function index()
    {
        try {
            // Lấy User kèm theo:
            // 1. orders: danh sách đơn hàng
            // 2. orders.orderDetails.product: chi tiết đơn -> thông tin sản phẩm
            // 3. addresses: địa chỉ
            $users = User::with(['orders.orderDetails.product', 'addresses'])
                        ->latest() // Người mới nhất lên đầu
                        ->get();

            // QUAN TRỌNG: Phải trả về dạng 'data' => $users để khớp với frontend
            return response()->json([
                'status' => 'success',
                'data' => $users
            ], 200);

        } catch (\Exception $e) {
            // Nếu lỗi, trả về 500 để frontend biết
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function lock($id)
    {
        $this->ensureAdmin();

        $user = User::findOrFail($id);
        $user->is_blocked = true;
        $user->save();

        return response()->json(['message' => 'User locked', 'user' => $user]);
    }

    public function promote($id)
    {
        $this->ensureAdmin();

        $user = User::findOrFail($id);
        $user->role = 'admin';
        $user->save();

        return response()->json(['message' => 'User promoted to admin', 'user' => $user]);
    }

    public function revoke($id)
    {
        $this->ensureAdmin();

        $user = User::findOrFail($id);
        $user->role = 'customer';
        $user->save();

        return response()->json(['message' => 'Admin role revoked', 'user' => $user]);
    }
}

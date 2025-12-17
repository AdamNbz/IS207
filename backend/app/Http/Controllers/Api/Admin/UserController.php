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
        $this->ensureAdmin();

        $users = User::where('role', 'customer')
            ->with(['addresses', 'orders.details.product', 'cart.items.product', 'reviews'])
            ->get();

        return response()->json(['data' => $users]);
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

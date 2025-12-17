<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderDetail;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;

class StatsController extends Controller
{
    protected function ensureAdmin()
    {
        $user = Auth::user();
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }

    public function overview()
    {
        $this->ensureAdmin();

        $totalRevenue = Order::where('payment_status', 'paid')->sum('total_amount');
        $totalOrders = Order::count();
        $totalCustomers = \App\Models\User::count();
        $totalProducts = Product::count();

        return response()->json([
            'total_revenue' => (float) $totalRevenue,
            'total_orders' => $totalOrders,
            'total_customers' => $totalCustomers,
            'total_products' => $totalProducts,
        ]);
    }

    public function revenue(Request $request)
    {
        $this->ensureAdmin();

        $start = $request->query('start_date');
        $end = $request->query('end_date');

        $query = Order::where('payment_status', 'paid');
        if ($start) {
            $query->whereDate('created_at', '>=', $start);
        }
        if ($end) {
            $query->whereDate('created_at', '<=', $end);
        }

        $total = $query->sum('total_amount');

        return response()->json(['total_revenue' => (float) $total]);
    }

    public function stock()
    {
        $this->ensureAdmin();

        $products = Product::select('id', 'name', 'stock')->orderBy('stock', 'desc')->get();

        return response()->json(['data' => $products]);
    }

    public function products()
    {
        $this->ensureAdmin();

        $top = OrderDetail::selectRaw('product_id, SUM(quantity) as sold_count')
            ->groupBy('product_id')
            ->orderByDesc('sold_count')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                $product = Product::find($row->product_id);
                return [
                    'product_id' => $row->product_id,
                    'name' => $product?->name,
                    'sold_count' => (int) $row->sold_count,
                ];
            });

        return response()->json(['data' => $top]);
    }

    public function category()
    {
        $this->ensureAdmin();

        $names = ['laptop', 'chuột', 'bàn phím'];

        $result = [];
        foreach ($names as $name) {
            $cat = Category::where('name', 'like', "%{$name}%")->first();
            if (! $cat) {
                $result[$name] = 0;
                continue;
            }

            $sold = OrderDetail::join('products', 'order_details.product_id', '=', 'products.id')
                ->where('products.category_id', $cat->id)
                ->sum('order_details.quantity');

            $result[$name] = (int) $sold;
        }

        return response()->json(['data' => $result]);
    }

    public function lowStock()
    {
        $this->ensureAdmin();

        $items = Product::where('stock', '<=', 5)->orderBy('stock')->get(['id','name','stock']);
        return response()->json(['data' => $items]);
    }
}

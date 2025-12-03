<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Brand;

class BrandController extends Controller
{
    /**
     * GET /api/brands
     * Trả về danh sách hãng (brand) dùng cho filter ở frontend.
     * Optional: ?with_counts=1 để thêm số lượng sản phẩm active mỗi brand.
     */
    public function index(Request $request)
    {
        $withCounts = filter_var($request->query('with_counts'), FILTER_VALIDATE_BOOLEAN);

        $query = Brand::select('id','name','slug','logo_url')->orderBy('name');

        if ($withCounts) {
            // Đếm số sản phẩm đang active
            $query->withCount(['products as active_products_count' => function($q) {
                $q->where('is_active', true);
            }]);
        }

        $brands = $query->get()->map(function($b) use ($withCounts) {
            $item = [
                'id' => $b->id,
                'name' => $b->name,
                'slug' => $b->slug,
                'logo_url' => $b->logo_url,
            ];
            if ($withCounts) {
                $item['active_products_count'] = $b->active_products_count;
            }
            return $item;
        });

        return response()->json(['data' => $brands]);
    }
}

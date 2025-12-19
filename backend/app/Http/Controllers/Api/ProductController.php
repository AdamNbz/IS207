<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * Hỗ trợ lọc: brand (name hoặc slug), min_price, max_price, ram, cpu, search.
     * Hỗ trợ sắp xếp: price_asc, price_desc (mặc định mới nhất).
     */
    public function index(Request $request)
    {
        // Validate query params
        $request->validate([
            'brand'      => 'sometimes|string',
            'min_price'  => 'sometimes|numeric|min:0',
            'max_price'  => 'sometimes|numeric|gte:min_price',
            'ram'        => 'sometimes|string', // ví dụ: 8GB, 16GB
            'cpu'        => 'sometimes|string', // ví dụ: i5, i7
            'search'     => 'sometimes|string',
            'sort'       => 'sometimes|in:price_asc,price_desc',
            'per_page'   => 'sometimes|integer|min:1|max:100',
            // Bổ sung
            'category'      => 'sometimes|string',     // slug hoặc name
            'category_id'   => 'sometimes|integer|exists:categories,id',
            'in_stock'      => 'sometimes|boolean',    // true => stock > 0
            'include_inactive' => 'sometimes|boolean', // true => không lọc is_active
        ]);

        $query = Product::query()
            ->with(['brand:id,name,slug', 'category:id,name,slug'])
            ->with(['images' => function ($q) { $q->select('id','product_id','image_url','display_order'); }])
            ->with(['specs' => function ($q) { $q->select('id','product_id','name','value'); }]);

        // Chỉ lấy sản phẩm đang active theo mặc định
        $includeInactive = filter_var($request->query('include_inactive'), FILTER_VALIDATE_BOOLEAN);
        if (!$includeInactive) {
            $query->where('is_active', true);
        }

        // Lọc brand (dựa trên name hoặc slug)
        if ($request->filled('brand')) {
            $brand = $request->brand;
            $query->whereHas('brand', function ($q) use ($brand) {
                $q->where('slug', $brand)->orWhere('name', $brand);
            });
        }

        // Lọc category (slug/name) hoặc theo category_id
        if ($request->filled('category')) {
            $category = $request->category;
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category)->orWhere('name', $category);
            });
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->get('category_id'));
        }

        // Khoảng giá
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Chỉ sản phẩm còn hàng
        $inStock = $request->has('in_stock') && filter_var($request->query('in_stock'), FILTER_VALIDATE_BOOLEAN);
        if ($inStock) {
            $query->where('stock', '>', 0);
        }

        // RAM lấy từ product_specs (name = 'RAM')
        if ($request->filled('ram')) {
            $ram = $request->ram;
            $query->whereHas('specs', function ($q) use ($ram) {
                $q->where('name', 'RAM')->where('value', 'like', '%' . $ram . '%');
            });
        }

        // CPU lấy từ product_specs (name = 'CPU')
        if ($request->filled('cpu')) {
            $cpu = $request->cpu;
            $query->whereHas('specs', function ($q) use ($cpu) {
                $q->where('name', 'CPU')->where('value', 'like', '%' . $cpu . '%');
            });
        }

        // Tìm theo tên sản phẩm (LIKE)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', '%' . $search . '%');
        }

        // Sắp xếp
        if ($request->filled('sort')) {
            $query->orderBy('price', $request->sort === 'price_asc' ? 'asc' : 'desc');
        } else {
            $query->latest(); // mặc định theo created_at desc
        }

        $perPage = (int) $request->get('per_page', 12);
        $paginator = $query->paginate($perPage);

        // Tuỳ biến dữ liệu trả về (có thể thu gọn) - ví dụ map thêm avg_rating
        $paginator->getCollection()->transform(function ($product) {
            return [
                'id'          => $product->id,
                'name'        => $product->name,
                'slug'        => $product->slug,
                'sku'         => $product->sku,
                'price'       => $product->price,
                'old_price'   => $product->old_price,
                'thumbnail'   => $product->thumbnail,
                'is_active'   => $product->is_active,
                'is_featured' => $product->is_featured,
                'view_count'  => $product->view_count,
                'brand'       => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                    'slug' => $product->brand->slug,
                ] : null,
                'category'    => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
                'images'      => $product->images->map(fn($img) => [
                    'id' => $img->id,
                    'url' => $img->image_url,
                    'order' => $img->display_order,
                ]),
                'specs'       => $product->specs->map(fn($spec) => [
                    'name' => $spec->name,
                    'value' => $spec->value,
                ]),
                'avg_rating'  => $product->avg_rating, // accessor
            ];
        });

        return response()->json($paginator);
    }

    /**
     * GET /api/products/{id}
     * Trả về chi tiết 1 sản phẩm kèm hình ảnh, thông số, đánh giá.
     */
    public function show($id)
    {
        $product = Product::with([
            'brand:id,name,slug,logo_url',
            'category:id,name,slug',
            'images:id,product_id,image_url,display_order',
            'specs:id,product_id,name,value',
            'reviews.user:id,name,avatar',
        ])->findOrFail((int) $id);

        // Lấy một số thông số nhanh (nếu có) từ bảng specs
        $specMap = [
            'CPU' => null,
            'RAM' => null,
            'Storage' => null,
            'Screen' => null,
        ];
        foreach ($product->specs as $s) {
            $key = trim($s->name);
            if (array_key_exists($key, $specMap)) {
                $specMap[$key] = $s->value;
            }
        }

        $data = [
            'id'          => $product->id,
            'name'        => $product->name,
            'slug'        => $product->slug,
            'sku'         => $product->sku,
            'price'       => $product->price,
            'old_price'   => $product->old_price,
            'stock'       => $product->stock,
            'thumbnail'   => $product->thumbnail,
            'description' => $product->description,
            'content'     => $product->content,
            'is_active'   => $product->is_active,
            'is_featured' => $product->is_featured,
            'view_count'  => $product->view_count,
            'brand'       => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
                'slug' => $product->brand->slug,
                'logo_url' => $product->brand->logo_url,
            ] : null,
            'category'    => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'images'      => $product->images->map(fn($img) => [
                'id' => $img->id,
                'url' => $img->image_url,
                'order' => $img->display_order,
            ])->values(),
            'specifications' => [
                'highlights' => [
                    'cpu'     => $specMap['CPU'],
                    'ram'     => $specMap['RAM'],
                    'storage' => $specMap['Storage'],
                    'screen'  => $specMap['Screen'],
                ],
                'list' => $product->specs->map(fn($s) => [
                    'name'  => $s->name,
                    'value' => $s->value,
                ])->values(),
            ],
            'reviews' => $product->reviews->map(fn($r) => [
                'id'         => $r->id,
                'rating'     => $r->rating,
                'comment'    => $r->comment,
                'created_at' => $r->created_at,
                'user'       => $r->user ? [
                    'id' => $r->user->id,
                    'name' => $r->user->name,
                    'avatar' => $r->user->avatar,
                ] : null,
            ])->values(),
            'avg_rating'  => $product->avg_rating,
            'review_count'=> $product->reviews->count(),
        ];

        return response()->json($data);
    }

    // Lấy giá giảm của sản phẩm
    // $products = Product::all();

    // foreach ($products as $product) {
    //     // Tự động kiểm tra xem có khuyến mãi nào đang chạy không
    //     $promo = $product->current_promotion;    
    //     if ($promo) {
    //         echo "Sản phẩm này đang giảm: " . $promo->discount_percent . "%";
    //     }
    // }
}

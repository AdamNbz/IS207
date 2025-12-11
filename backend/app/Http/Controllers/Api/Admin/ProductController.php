<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * GET /api/admin/products
     * Lấy danh sách sản phẩm cho admin (bao gồm cả sản phẩm inactive và hết hàng)
     */
    public function index(Request $request)
    {
        $request->validate([
            'search'     => 'sometimes|string',
            'brand_id'   => 'sometimes|integer|exists:brands,id',
            'category_id'=> 'sometimes|integer|exists:categories,id',
            'is_active'  => 'sometimes|boolean',
            'per_page'   => 'sometimes|integer|min:1|max:100',
        ]);

        $query = Product::query()
            ->with(['brand:id,name,slug', 'category:id,name,slug'])
            ->with(['images' => function ($q) {
                $q->select('id', 'product_id', 'image_url', 'display_order')
                  ->orderBy('display_order');
            }]);

        // Tìm kiếm theo tên hoặc SKU
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('sku', 'like', '%' . $search . '%');
            });
        }

        // Lọc theo brand
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // Lọc theo category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Lọc theo trạng thái active
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $query->latest();

        $perPage = (int) $request->get('per_page', 15);
        $paginator = $query->paginate($perPage);

        // Transform data
        $paginator->getCollection()->transform(function ($product) {
            return [
                'id'          => $product->id,
                'name'        => $product->name,
                'slug'        => $product->slug,
                'sku'         => $product->sku,
                'price'       => $product->price,
                'old_price'   => $product->old_price,
                'stock'       => $product->stock,
                'thumbnail'   => $product->thumbnail,
                'is_active'   => $product->is_active,
                'is_featured' => $product->is_featured,
                'view_count'  => $product->view_count,
                'brand'       => $product->brand ? [
                    'id'   => $product->brand->id,
                    'name' => $product->brand->name,
                ] : null,
                'category'    => $product->category ? [
                    'id'   => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
                'images'      => $product->images->map(fn($img) => [
                    'id'    => $img->id,
                    'url'   => $img->image_url,
                    'order' => $img->display_order,
                ]),
                'created_at'  => $product->created_at,
            ];
        });

        return response()->json($paginator);
    }

    /**
     * POST /api/admin/products
     * Thêm sản phẩm mới
     * Xử lý upload ảnh thumbnail và lưu đường dẫn vào image_url
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'brand_id'    => 'required|integer|exists:brands,id',
            'category_id' => 'required|integer|exists:categories,id',
            'price'       => 'required|numeric|min:0',
            'old_price'   => 'nullable|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'sku'         => 'nullable|string|max:100|unique:products,sku',
            'description' => 'nullable|string',
            'content'     => 'nullable|string',
            'is_active'   => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'thumbnail'   => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // file upload
        ]);

        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/uploads', $filename);
            $validated['thumbnail'] = Storage::url($path);
        }

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Sản phẩm đã được tạo thành công',
            'product' => $product->load('brand:id,name', 'category:id,name'),
        ], 201);
    }

    /**
     * GET /api/admin/products/{id}
     * Xem chi tiết sản phẩm để sử dụng cho API phía dưới
     */
    public function show($id)
    {
        $product = Product::with([
            'brand:id,name,slug',
            'category:id,name,slug',
            'images:id,product_id,image_url,display_order',
            'specs:id,product_id,name,value',
        ])->findOrFail((int) $id);

        return response()->json([
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
            'brand_id'    => $product->brand_id,
            'category_id' => $product->category_id,
            'brand'       => $product->brand,
            'category'    => $product->category,
            'images'      => $product->images,
            'specs'       => $product->specs,
            'created_at'  => $product->created_at,
            'updated_at'  => $product->updated_at,
        ]);
    }

    /**
     * PUT/PATCH /api/admin/products/{id}
     * Cập nhật sản phẩm
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail((int) $id);

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'brand_id'    => 'sometimes|integer|exists:brands,id',
            'category_id' => 'sometimes|integer|exists:categories,id',
            'price'       => 'sometimes|numeric|min:0',
            'old_price'   => 'nullable|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'sku'         => 'nullable|string|max:100|unique:products,sku,' . $id,
            'description' => 'nullable|string',
            'content'     => 'nullable|string',
            'is_active'   => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'thumbnail'   => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Update slug if name changed
        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if exists
            if ($product->thumbnail) {
                $oldPath = str_replace('/storage', 'public', $product->thumbnail);
                Storage::delete($oldPath);
            }

            $file = $request->file('thumbnail');
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/uploads', $filename);
            $validated['thumbnail'] = Storage::url($path);
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Sản phẩm đã được cập nhật',
            'product' => $product->load('brand:id,name', 'category:id,name'),
        ]);
    }

    /**
     * DELETE /api/admin/products/{id}
     * Xóa sản phẩm
     */
    public function destroy($id)
    {
        $product = Product::findOrFail((int) $id);

        // Delete thumbnail
        if ($product->thumbnail) {
            $oldPath = str_replace('/storage', 'public', $product->thumbnail);
            Storage::delete($oldPath);
        }

        // Delete associated images
        foreach ($product->images as $image) {
            $imagePath = str_replace('/storage', 'public', $image->image_url);
            Storage::delete($imagePath);
        }

        $product->delete();

        return response()->json([
            'message' => 'Sản phẩm đã được xóa',
        ]);
    }
}

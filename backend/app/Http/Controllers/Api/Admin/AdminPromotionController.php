<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promotion;
use App\Models\Product;

class AdminPromotionController extends Controller
{
    /**
     * GET /api/admin/promotions
     * Xem danh sách các đợt khuyến mãi
     */
    public function index()
    {
        // Lấy danh sách, sắp xếp mới nhất
        $promotions = Promotion::orderBy('created_at', 'desc')->get();
        return response()->json($promotions);
    }

    /**
     * GET /api/admin/promotions/{id}
     * Xem chi tiết + Danh sách sản phẩm tham gia (kèm stock)
     */
    public function show($id)
    {
        // Tìm Promotion theo ID
        // Hàm with('products') sẽ lấy luôn thông tin sản phẩm
        // Mặc định Laravel sẽ lấy tất cả cột của bảng products (bao gồm cả stock/quantity)
        $promotion = Promotion::with('products')->find($id);

        if (!$promotion) {
            return response()->json(['message' => 'Không tìm thấy chương trình khuyến mãi'], 404);
        }

        return response()->json($promotion);
    }

    /**
     * POST /api/admin/promotions
     * Tạo đợt khuyến mãi mới
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date', // Ngày kết thúc phải sau ngày bắt đầu
        ]);

        $promotion = Promotion::create([
            'name' => $request->name,
            'discount_percent' => $request->discount_percent,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);

        return response()->json([
            'message' => 'Tạo chương trình thành công',
            'promotion' => $promotion
        ], 201);
    }

    /**
     * POST /api/admin/promotions/{id}/add-products
     * Thêm các sản phẩm vào khuyến mãi
     */
    public function addProducts(Request $request, $id)
    {
        $request->validate([
            'product_ids' => 'required|array', // Phải gửi lên danh sách ID dạng mảng
            'product_ids.*' => 'exists:products,id' // Các ID phải tồn tại trong bảng products
        ]);

        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json(['message' => 'Không tìm thấy chương trình'], 404);
        }

        // Dùng hàm syncWithoutDetaching để thêm mới mà không làm mất các sản phẩm đã thêm trước đó
        $promotion->products()->syncWithoutDetaching($request->product_ids);

        return response()->json([
            'message' => 'Đã thêm sản phẩm vào chương trình khuyến mãi',
            'added_products' => $request->product_ids
        ]);
    }

    /**
     * DELETE /api/admin/promotions/{id}
     * Xóa/dừng đợt khuyến mãi
     */
    public function destroy($id)
    {
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json(['message' => 'Không tìm thấy'], 404);
        }

        // Xóa Promotion (Dữ liệu trong bảng trung gian product_promotion cũng sẽ tự mất nhờ setup database)
        $promotion->delete();

        return response()->json(['message' => 'Đã xóa chương trình khuyến mãi']);
    }
}
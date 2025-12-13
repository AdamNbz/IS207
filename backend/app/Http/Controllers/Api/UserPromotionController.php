<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promotion;

class UserPromotionController extends Controller
{
    /**
     * GET /api/promotions/{id}/products
     * Xem danh sách sản phẩm (đang active) của 1 chương trình KM
     */
    public function getProducts($id)
    {
        // 1. Tìm chương trình khuyến mãi
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json(['message' => 'Chương trình khuyến mãi không tồn tại'], 404);
        }

        // 2. Lấy danh sách sản phẩm thuộc chương trình này
        // NHƯNG phải lọc thêm điều kiện: is_active = 1
        $products = $promotion->products()
                              ->where('is_active', 1) // Giả sử trong bảng products có cột này
                              ->get();

        // 3. Trả về kết quả
        // Nên trả về cả thông tin chương trình (tên, ảnh banner...) để Frontend hiển thị tiêu đề
        return response()->json([
            'promotion' => [
                'id' => $promotion->id,
                'name' => $promotion->name,
                'description' => $promotion->description,
                'start_date' => $promotion->start_date,
                'end_date' => $promotion->end_date,
                'discount_percent' => $promotion->discount_percent
            ],
            'products' => $products
        ]);
    }
}
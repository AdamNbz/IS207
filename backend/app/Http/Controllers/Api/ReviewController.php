<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Review; // Import cái Model xịn của bạn vào
use App\Models\Product;

class ReviewController extends Controller
{
    // API: POST /reviews
    public function store(Request $request)
    {
        $user = Auth::user();

        // 1. Validate (Kiểm tra dữ liệu đầu vào)
        $request->validate([
            'product_id' => 'required|exists:products,id', // Sản phẩm phải có thật
            'rating'     => 'required|integer|min:1|max:5', // Chỉ cho chấm từ 1 đến 5 sao
            'comment'    => 'nullable|string',
        ]);

        // 2. Chặn Spam: Kiểm tra xem ông này đã đánh giá sản phẩm này chưa?
        // (Logic: Mỗi người chỉ được review 1 lần cho 1 sản phẩm)
        $exists = Review::where('user_id', $user->id)
                        ->where('product_id', $request->product_id)
                        ->exists();

        if ($exists) {
            return response()->json(['message' => 'Bạn đã đánh giá sản phẩm này rồi, không thể đánh giá lại!'], 400);
        }

        // 3. Lưu vào Database (Dùng Model Review của bạn)
        $review = Review::create([
            'user_id'    => $user->id,
            'product_id' => $request->product_id,
            'rating'     => $request->rating,
            'comment'    => $request->comment
        ]);

        return response()->json([
            'message' => 'Cảm ơn bạn đã đánh giá!',
            'data'    => $review
        ], 201);
    }
    
    // API: GET /reviews/{product_id} (Xem đánh giá của 1 sản phẩm)
    public function index($productId)
    {
        $reviews = Review::where('product_id', $productId)
                         ->with('user') // Lấy luôn tên người đánh giá
                         ->orderBy('created_at', 'desc')
                         ->get();

        return response()->json($reviews);
    }
}
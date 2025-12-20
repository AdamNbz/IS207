<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http; // Quan trọng
use App\Models\Product;

class ChatController extends Controller
{
    public function sendMessage(Request $request)
    {
        $userMessage = $request->input('message');

        // --- BẮT ĐẦU: Lấy dữ liệu sản phẩm ---
        // (Copy lại logic tìm product cũ của bạn vào đây nếu muốn)
        // Ở đây tôi để code tìm kiếm cơ bản để test trước
        $keywords = explode(' ', $userMessage);
        $productsQuery = Product::query();
        foreach ($keywords as $word) {
             if (strlen($word) > 2) {
                 $productsQuery->orWhere('name', 'like', "%{$word}%");
             }
        }
        $products = $productsQuery->take(3)->get();
        
        $contextData = "Chưa tìm thấy sản phẩm nào.";
        if ($products->count() > 0) {
            $contextData = "Sản phẩm có sẵn:\n" . $products->map(function($p) {
                return $p->name . " - Giá: " . $p->price;
            })->implode("\n");
        }
        // --- KẾT THÚC: Lấy dữ liệu ---

$apiKey = env('GROQ_API_KEY');
        
        // URL của Groq
        $url = "https://api.groq.com/openai/v1/chat/completions";

        try {
            $response = Http::withoutVerifying()
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey, // Groq dùng Bearer Token
                    'Content-Type' => 'application/json',
                ])
                ->post($url, [
                    // Chọn model: llama3-8b-8192 (Nhanh, nhẹ) hoặc llama3-70b-8192 (Thông minh hơn)
                    'model' => 'llama-3.3-70b-versatile', 
                    'messages' => [
                        [
                            'role' => 'system', 
                            'content' => "Bạn là nhân viên tư vấn bán hàng. Chỉ trả lời dựa trên dữ liệu sau: $contextData"
                        ],
                        [
                            'role' => 'user', 
                            'content' => $userMessage
                        ]
                    ],
                    'temperature' => 0.7 // Độ sáng tạo
                ]);

            if ($response->successful()) {
                $data = $response->json();
                // Cấu trúc lấy tin nhắn của Groq khác Gemini
                $botReply = $data['choices'][0]['message']['content'] ?? 'Xin lỗi, tôi chưa nghĩ ra câu trả lời.';
                return response()->json(['reply' => $botReply]);
            } else {
                return response()->json([
                    'reply' => 'Lỗi Groq (' . $response->status() . '): ' . $response->body()
                ], $response->status());
            }

        } catch (\Exception $e) {
            return response()->json(['reply' => 'Lỗi kết nối: ' . $e->getMessage()], 500);
        }
    }
}
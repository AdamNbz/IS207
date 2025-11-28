<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSpec;
use App\Models\ProductImage;
use App\Models\Coupon;
use App\Models\Review;
use App\Models\Favorite;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderDetail;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Dọn dẹp dữ liệu cũ (Tránh lỗi trùng lặp khi chạy lại nhiều lần)
        Schema::disableForeignKeyConstraints();
        User::truncate();
        UserAddress::truncate();
        Brand::truncate();
        Category::truncate();
        Product::truncate();
        ProductSpec::truncate();
        ProductImage::truncate();
        Coupon::truncate();
        Review::truncate();
        Favorite::truncate();
        Cart::truncate();
        CartItem::truncate();
        Order::truncate();
        OrderDetail::truncate();
        Schema::enableForeignKeyConstraints();

        // 2. Tạo Users (1 Admin, 1 Khách)
        $admin = User::create([
            'name' => 'Admin Shop',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'admin',
            'phone' => '0909000111',
        ]);

        $customer = User::create([
            'name' => 'Nguyễn Văn Khách',
            'email' => 'khach@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'customer',
            'phone' => '0909000222',
        ]);

        // 3. Tạo Sổ địa chỉ (Cho khách hàng)
        UserAddress::create([
            'user_id' => $customer->id,
            'address_line' => '123 Đường Lê Lợi',
            'city' => 'Hồ Chí Minh',
            'district' => 'Quận 1',
            'is_default' => true
        ]);
        UserAddress::create([
            'user_id' => $customer->id,
            'address_line' => '456 Đường Nguyễn Huệ (Cơ quan)',
            'city' => 'Hồ Chí Minh',
            'district' => 'Quận 1',
            'is_default' => false
        ]);

        // 4. Tạo Hãng (Brands)
        $dell = Brand::create(['name' => 'Dell', 'slug' => 'dell', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg']);
        $apple = Brand::create(['name' => 'Apple', 'slug' => 'apple', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg']);

        // 5. Tạo Danh mục (Categories)
        $laptop = Category::create(['name' => 'Laptop', 'slug' => 'laptop']);
        $accessory = Category::create(['name' => 'Phụ kiện', 'slug' => 'phu-kien']);

        // 6. Tạo Sản phẩm (Products)
        // SP 1: Dell XPS
        $p1 = Product::create([
            'name' => 'Dell XPS 13 9310',
            'slug' => 'dell-xps-13-9310',
            'sku' => 'DELL-XPS-001',
            'brand_id' => $dell->id,
            'category_id' => $laptop->id,
            'price' => 25000000,
            'old_price' => 28000000,
            'stock' => 10,
            'thumbnail' => 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-13-9315/media-gallery/blue/notebook-xps-9315-blue-gallery-3.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=536&qlt=100,1&resMode=sharp2&size=536,402&chrss=full',
            'description' => 'Laptop doanh nhân mỏng nhẹ.',
            'is_featured' => true,
            'view_count' => 100
        ]);

        // SP 2: Macbook Air
        $p2 = Product::create([
            'name' => 'MacBook Air M1',
            'slug' => 'macbook-air-m1',
            'sku' => 'APPLE-M1-001',
            'brand_id' => $apple->id,
            'category_id' => $laptop->id,
            'price' => 18500000,
            'old_price' => null,
            'stock' => 50,
            'thumbnail' => 'https://cdn.tgdd.vn/Products/Images/44/231244/macbook-air-m1-2020-gray-600x600.jpg',
            'description' => 'Chip Apple M1 mạnh mẽ.',
            'is_featured' => false,
            'view_count' => 500
        ]);

        // 7. Tạo Thông số kỹ thuật (Specs)
        // Cho Dell
        ProductSpec::create(['product_id' => $p1->id, 'name' => 'CPU', 'value' => 'Intel Core i7 11th Gen']);
        ProductSpec::create(['product_id' => $p1->id, 'name' => 'RAM', 'value' => '16GB LPDDR4x']);
        // Cho Macbook
        ProductSpec::create(['product_id' => $p2->id, 'name' => 'CPU', 'value' => 'Apple M1']);
        ProductSpec::create(['product_id' => $p2->id, 'name' => 'RAM', 'value' => '8GB Unified']);

        // 8. Tạo Ảnh phụ (Product Images)
        ProductImage::create(['product_id' => $p1->id, 'image_url' => 'https://example.com/dell-mat-ben.jpg', 'display_order' => 1]);
        ProductImage::create(['product_id' => $p2->id, 'image_url' => 'https://example.com/mac-mat-ben.jpg', 'display_order' => 1]);

        // 9. Tạo Mã giảm giá (Coupons)
        Coupon::create(['code' => 'SALE50K', 'type' => 'fixed', 'value' => 50000, 'quantity' => 100, 'expires_at' => '2025-12-31']);
        Coupon::create(['code' => 'SALE10', 'type' => 'percent', 'value' => 10, 'quantity' => 50, 'expires_at' => '2025-12-31']);

        // 10. Tạo Đánh giá (Reviews)
        Review::create(['user_id' => $customer->id, 'product_id' => $p1->id, 'rating' => 5, 'comment' => 'Máy rất đẹp, chạy nhanh!']);
        Review::create(['user_id' => $customer->id, 'product_id' => $p2->id, 'rating' => 4, 'comment' => 'Pin trâu nhưng hơi nóng khi render.']);

        // 11. Tạo Yêu thích (Favorites)
        Favorite::create(['user_id' => $customer->id, 'product_id' => $p1->id]);
        Favorite::create(['user_id' => $customer->id, 'product_id' => $p2->id]);

        // 12. Tạo Giỏ hàng (Carts)
        $cart = Cart::create(['user_id' => $customer->id]);
        
        // Thêm 2 món vào giỏ
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $p1->id, 'quantity' => 1]);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $p2->id, 'quantity' => 2]);

        // 13. Tạo Đơn hàng (Orders)
        // Đơn hàng 1: Đã hoàn thành (Mua Dell)
        $order1 = Order::create([
            'user_id' => $customer->id,
            'customer_name' => 'Nguyễn Văn Khách',
            'customer_phone' => '0909000222',
            'shipping_address' => '123 Đường Lê Lợi, Q1',
            'city' => 'HCM',
            'subtotal' => 25000000,
            'total_amount' => 25000000,
            'payment_method' => 'VNPAY',
            'payment_status' => 'paid',
            'status' => 'completed'
        ]);
        OrderDetail::create(['order_id' => $order1->id, 'product_id' => $p1->id, 'quantity' => 1, 'price' => 25000000]);

        // Đơn hàng 2: Đang giao (Mua Macbook)
        $order2 = Order::create([
            'user_id' => $customer->id,
            'customer_name' => 'Nguyễn Văn Khách',
            'customer_phone' => '0909000222',
            'shipping_address' => '456 Đường Nguyễn Huệ, Q1',
            'city' => 'HCM',
            'subtotal' => 18500000,
            'total_amount' => 18500000,
            'payment_method' => 'COD',
            'payment_status' => 'unpaid',
            'status' => 'shipping'
        ]);
        OrderDetail::create(['order_id' => $order2->id, 'product_id' => $p2->id, 'quantity' => 1, 'price' => 18500000]);
    }
}
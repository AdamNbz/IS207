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
        $asus = Brand::create(['name' => 'Asus', 'slug' => 'asus', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg']);
        $hp = Brand::create(['name' => 'HP', 'slug' => 'hp', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg']);
        $lenovo = Brand::create(['name' => 'Lenovo', 'slug' => 'lenovo', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg']);

        // 5. Tạo Danh mục (Categories)
        $laptop = Category::create(['name' => 'Laptop', 'slug' => 'laptop']);
        $gaming = Category::create(['name' => 'Gaming', 'slug' => 'gaming', 'parent_id' => $laptop->id]);
        $ultrabook = Category::create(['name' => 'Ultrabook', 'slug' => 'ultrabook', 'parent_id' => $laptop->id]);
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
            'thumbnail' => 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600',
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
            'category_id' => $ultrabook->id,
            'price' => 18500000,
            'old_price' => null,
            'stock' => 50,
            'thumbnail' => 'https://cdn.tgdd.vn/Products/Images/44/231244/macbook-air-m1-2020-gray-600x600.jpg',
            'description' => 'Chip Apple M1 mạnh mẽ.',
            'is_featured' => false,
            'view_count' => 500
        ]);

        // SP 3: Asus ROG Strix G15
        $p3 = Product::create([
            'name' => 'Asus ROG Strix G15',
            'slug' => 'asus-rog-strix-g15',
            'sku' => 'ASUS-ROG-001',
            'brand_id' => $asus->id,
            'category_id' => $gaming->id,
            'price' => 32000000,
            'old_price' => 35000000,
            'stock' => 15,
            'thumbnail' => 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6466/6466550ld.jpg',
            'description' => 'Laptop gaming hiệu năng cao với RTX 3060.',
            'is_featured' => true,
            'view_count' => 320
        ]);

        // SP 4: HP Pavilion 15
        $p4 = Product::create([
            'name' => 'HP Pavilion 15',
            'slug' => 'hp-pavilion-15',
            'sku' => 'HP-PAV-001',
            'brand_id' => $hp->id,
            'category_id' => $laptop->id,
            'price' => 15500000,
            'old_price' => 17000000,
            'stock' => 25,
            'thumbnail' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
            'description' => 'Laptop đa năng cho sinh viên và văn phòng.',
            'is_featured' => false,
            'view_count' => 180
        ]);

        // SP 5: Lenovo ThinkPad X1 Carbon
        $p5 = Product::create([
            'name' => 'Lenovo ThinkPad X1 Carbon Gen 10',
            'slug' => 'lenovo-thinkpad-x1-carbon-gen10',
            'sku' => 'LENOVO-X1-001',
            'brand_id' => $lenovo->id,
            'category_id' => $ultrabook->id,
            'price' => 42000000,
            'old_price' => 45000000,
            'stock' => 8,
            'thumbnail' => 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600',
            'description' => 'Ultrabook cao cấp cho doanh nhân.',
            'is_featured' => true,
            'view_count' => 450
        ]);

        // SP 6: Dell Inspiron 15
        $p6 = Product::create([
            'name' => 'Dell Inspiron 15 3520',
            'slug' => 'dell-inspiron-15-3520',
            'sku' => 'DELL-INS-001',
            'brand_id' => $dell->id,
            'category_id' => $laptop->id,
            'price' => 12000000,
            'old_price' => null,
            'stock' => 30,
            'thumbnail' => 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600',
            'description' => 'Laptop giá rẻ cho học tập.',
            'is_featured' => false,
            'view_count' => 250
        ]);

        // SP 7: MacBook Pro 14 M2
        $p7 = Product::create([
            'name' => 'MacBook Pro 14 M2 Pro',
            'slug' => 'macbook-pro-14-m2-pro',
            'sku' => 'APPLE-M2-001',
            'brand_id' => $apple->id,
            'category_id' => $laptop->id,
            'price' => 52000000,
            'old_price' => 55000000,
            'stock' => 12,
            'thumbnail' => 'https://cdn.mos.cms.futurecdn.net/ybU2vqdV6MSB37mSwuVEvV.jpg',
            'description' => 'Laptop Pro cho sáng tạo nội dung chuyên nghiệp.',
            'is_featured' => true,
            'view_count' => 680
        ]);

        // SP 8: Asus Vivobook 15
        $p8 = Product::create([
            'name' => 'Asus Vivobook 15 X1502',
            'slug' => 'asus-vivobook-15-x1502',
            'sku' => 'ASUS-VIVO-001',
            'brand_id' => $asus->id,
            'category_id' => $laptop->id,
            'price' => 13500000,
            'old_price' => null,
            'stock' => 40,
            'thumbnail' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
            'description' => 'Laptop mỏng nhẹ giá tốt.',
            'is_featured' => false,
            'view_count' => 150
        ]);

        // SP 9: HP Omen 16
        $p9 = Product::create([
            'name' => 'HP Omen 16',
            'slug' => 'hp-omen-16',
            'sku' => 'HP-OMEN-001',
            'brand_id' => $hp->id,
            'category_id' => $gaming->id,
            'price' => 38000000,
            'old_price' => 42000000,
            'stock' => 10,
            'thumbnail' => 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600',
            'description' => 'Gaming laptop với màn hình 165Hz.',
            'is_featured' => true,
            'view_count' => 290
        ]);

        // SP 10: Lenovo IdeaPad Gaming 3
        $p10 = Product::create([
            'name' => 'Lenovo IdeaPad Gaming 3',
            'slug' => 'lenovo-ideapad-gaming-3',
            'sku' => 'LENOVO-GAMING-001',
            'brand_id' => $lenovo->id,
            'category_id' => $gaming->id,
            'price' => 19500000,
            'old_price' => 22000000,
            'stock' => 20,
            'thumbnail' => 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600',
            'description' => 'Gaming laptop giá tốt với GTX 1650.',
            'is_featured' => false,
            'view_count' => 340
        ]);

        // Accessories under 5 million for price filter testing
        $brandLogitech = Brand::firstOrCreate(['slug' => 'logitech'], ['name' => 'Logitech']);
        $brandRazer = Brand::firstOrCreate(['slug' => 'razer'], ['name' => 'Razer']);
        $brandSony = Brand::firstOrCreate(['slug' => 'sony'], ['name' => 'Sony']);
        $catAccessory = Category::firstOrCreate(['slug' => 'phu-kien'], ['name' => 'Phụ kiện']);

        $mouse = Product::create([
            'name' => 'Logitech G305 Wireless Mouse',
            'slug' => 'logitech-g305-wireless-mouse',
            'brand_id' => $brandLogitech->id,
            'category_id' => $catAccessory->id,
            'price' => 890000,
            'stock' => 120,
            'thumbnail' => 'https://tse1.mm.bing.net/th/id/OIP.mbC9B7NNGHpDwJjO4xcZgQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
            'description' => 'Chuột không dây gaming giá rẻ.',
            'is_featured' => false,
            'view_count' => 50
        ]);
        ProductImage::create(['product_id' => $mouse->id, 'image_url' => 'https://tse1.mm.bing.net/th/id/OIP.mbC9B7NNGHpDwJjO4xcZgQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3', 'display_order' => 1]);

        $keyboard = Product::create([
            'name' => 'Razer Cynosa V2 Gaming Keyboard',
            'slug' => 'razer-cynosa-v2-gaming-keyboard',
            'brand_id' => $brandRazer->id,
            'category_id' => $catAccessory->id,
            'price' => 1490000,
            'stock' => 80,
            'thumbnail' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop',
            'description' => 'Bàn phím gaming giá tốt.',
            'is_featured' => false,
            'view_count' => 40
        ]);
        ProductImage::create(['product_id' => $keyboard->id, 'image_url' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop', 'display_order' => 1]);

        $headphones = Product::create([
            'name' => 'Sony WH-CH520 Wireless Headphones',
            'slug' => 'sony-wh-ch520-wireless-headphones',
            'brand_id' => $brandSony->id,
            'category_id' => $catAccessory->id,
            'price' => 1990000,
            'stock' => 65,
            'thumbnail' => 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6533/6533161_rd.jpg',
            'description' => 'Tai nghe không dây giá rẻ.',
            'is_featured' => false,
            'view_count' => 35
        ]);
        ProductImage::create(['product_id' => $headphones->id, 'image_url' => 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6533/6533161_rd.jpg', 'display_order' => 1]);

        // 7. Tạo Thông số kỹ thuật (Specs)
        // P1: Dell XPS
        ProductSpec::create(['product_id' => $p1->id, 'name' => 'CPU', 'value' => 'Intel Core i7-1165G7']);
        ProductSpec::create(['product_id' => $p1->id, 'name' => 'RAM', 'value' => '16GB LPDDR4x']);
        ProductSpec::create(['product_id' => $p1->id, 'name' => 'Storage', 'value' => '512GB NVMe SSD']);
        ProductSpec::create(['product_id' => $p1->id, 'name' => 'Screen', 'value' => '13.4" FHD+']);

        // P2: MacBook Air
        ProductSpec::create(['product_id' => $p2->id, 'name' => 'CPU', 'value' => 'Apple M1']);
        ProductSpec::create(['product_id' => $p2->id, 'name' => 'RAM', 'value' => '8GB Unified']);
        ProductSpec::create(['product_id' => $p2->id, 'name' => 'Storage', 'value' => '256GB SSD']);
        ProductSpec::create(['product_id' => $p2->id, 'name' => 'Screen', 'value' => '13.3" Retina']);

        // P3: Asus ROG
        ProductSpec::create(['product_id' => $p3->id, 'name' => 'CPU', 'value' => 'AMD Ryzen 7 5800H']);
        ProductSpec::create(['product_id' => $p3->id, 'name' => 'RAM', 'value' => '16GB DDR4']);
        ProductSpec::create(['product_id' => $p3->id, 'name' => 'Storage', 'value' => '512GB SSD']);
        ProductSpec::create(['product_id' => $p3->id, 'name' => 'Screen', 'value' => '15.6" FHD 144Hz']);

        // P4: HP Pavilion
        ProductSpec::create(['product_id' => $p4->id, 'name' => 'CPU', 'value' => 'Intel Core i5-1135G7']);
        ProductSpec::create(['product_id' => $p4->id, 'name' => 'RAM', 'value' => '8GB DDR4']);
        ProductSpec::create(['product_id' => $p4->id, 'name' => 'Storage', 'value' => '256GB SSD']);
        ProductSpec::create(['product_id' => $p4->id, 'name' => 'Screen', 'value' => '15.6" FHD']);

        // P5: ThinkPad X1
        ProductSpec::create(['product_id' => $p5->id, 'name' => 'CPU', 'value' => 'Intel Core i7-1260P']);
        ProductSpec::create(['product_id' => $p5->id, 'name' => 'RAM', 'value' => '16GB LPDDR5']);
        ProductSpec::create(['product_id' => $p5->id, 'name' => 'Storage', 'value' => '512GB SSD']);
        ProductSpec::create(['product_id' => $p5->id, 'name' => 'Screen', 'value' => '14" WUXGA']);

        // P6: Dell Inspiron
        ProductSpec::create(['product_id' => $p6->id, 'name' => 'CPU', 'value' => 'Intel Core i3-1215U']);
        ProductSpec::create(['product_id' => $p6->id, 'name' => 'RAM', 'value' => '8GB DDR4']);
        ProductSpec::create(['product_id' => $p6->id, 'name' => 'Storage', 'value' => '256GB SSD']);
        ProductSpec::create(['product_id' => $p6->id, 'name' => 'Screen', 'value' => '15.6" HD']);

        // P7: MacBook Pro
        ProductSpec::create(['product_id' => $p7->id, 'name' => 'CPU', 'value' => 'Apple M2 Pro']);
        ProductSpec::create(['product_id' => $p7->id, 'name' => 'RAM', 'value' => '16GB Unified']);
        ProductSpec::create(['product_id' => $p7->id, 'name' => 'Storage', 'value' => '512GB SSD']);
        ProductSpec::create(['product_id' => $p7->id, 'name' => 'Screen', 'value' => '14.2" Liquid Retina XDR']);

        // P8: Asus Vivobook
        ProductSpec::create(['product_id' => $p8->id, 'name' => 'CPU', 'value' => 'Intel Core i5-1235U']);
        ProductSpec::create(['product_id' => $p8->id, 'name' => 'RAM', 'value' => '8GB DDR4']);
        ProductSpec::create(['product_id' => $p8->id, 'name' => 'Storage', 'value' => '512GB SSD']);
        ProductSpec::create(['product_id' => $p8->id, 'name' => 'Screen', 'value' => '15.6" FHD']);

        // P9: HP Omen
        ProductSpec::create(['product_id' => $p9->id, 'name' => 'CPU', 'value' => 'Intel Core i7-12700H']);
        ProductSpec::create(['product_id' => $p9->id, 'name' => 'RAM', 'value' => '16GB DDR5']);
        ProductSpec::create(['product_id' => $p9->id, 'name' => 'Storage', 'value' => '1TB SSD']);
        ProductSpec::create(['product_id' => $p9->id, 'name' => 'Screen', 'value' => '16.1" QHD 165Hz']);

        // P10: Lenovo Gaming
        ProductSpec::create(['product_id' => $p10->id, 'name' => 'CPU', 'value' => 'AMD Ryzen 5 5600H']);
        ProductSpec::create(['product_id' => $p10->id, 'name' => 'RAM', 'value' => '8GB DDR4']);
        ProductSpec::create(['product_id' => $p10->id, 'name' => 'Storage', 'value' => '512GB SSD']);
        ProductSpec::create(['product_id' => $p10->id, 'name' => 'Screen', 'value' => '15.6" FHD 120Hz']);

        // 8. Tạo Ảnh phụ (Product Images)
        ProductImage::create(['product_id' => $p1->id, 'image_url' => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600', 'display_order' => 1]);
        ProductImage::create(['product_id' => $p2->id, 'image_url' => 'https://cdn.tgdd.vn/Products/Images/44/231244/macbook-air-m1-2020-gray-2.jpg', 'display_order' => 1]);
        ProductImage::create(['product_id' => $p3->id, 'image_url' => 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600', 'display_order' => 1]);
        ProductImage::create(['product_id' => $p7->id, 'image_url' => 'https://cdn.tgdd.vn/Products/Images/44/282828/macbook-pro-14-m2-pro-2023-xam-2.jpg', 'display_order' => 1]);

        // 9. Tạo Mã giảm giá (Coupons)
        Coupon::create(['code' => 'SALE50K', 'type' => 'fixed', 'value' => 50000, 'quantity' => 100, 'expires_at' => '2025-12-31']);
        Coupon::create(['code' => 'SALE10', 'type' => 'percent', 'value' => 10, 'quantity' => 50, 'expires_at' => '2025-12-31']);

        // 10. Tạo Đánh giá (Reviews)
        Review::create(['user_id' => $customer->id, 'product_id' => $p1->id, 'rating' => 5, 'comment' => 'Máy rất đẹp, chạy nhanh!']);
        Review::create(['user_id' => $customer->id, 'product_id' => $p2->id, 'rating' => 4, 'comment' => 'Pin trâu nhưng hơi nóng khi render.']);
        Review::create(['user_id' => $admin->id, 'product_id' => $p3->id, 'rating' => 5, 'comment' => 'Gaming mượt mà, màn hình đẹp!']);
        Review::create(['user_id' => $customer->id, 'product_id' => $p4->id, 'rating' => 4, 'comment' => 'Tốt cho giá tiền, phù hợp sinh viên.']);
        Review::create(['user_id' => $admin->id, 'product_id' => $p5->id, 'rating' => 5, 'comment' => 'Bàn phím tuyệt vời, pin lâu.']);
        Review::create(['user_id' => $customer->id, 'product_id' => $p7->id, 'rating' => 5, 'comment' => 'Xứng đáng từng đồng, render video cực nhanh!']);
        Review::create(['user_id' => $admin->id, 'product_id' => $p9->id, 'rating' => 4, 'comment' => 'Màn hình 165Hz siêu mượt.']);
        Review::create(['user_id' => $customer->id, 'product_id' => $p10->id, 'rating' => 3, 'comment' => 'Ổn cho tầm giá, nhưng hơi nặng.']);

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

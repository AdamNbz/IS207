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
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('vi_VN'); // Fake dữ liệu tiếng Việt

        // 1. Dọn dẹp dữ liệu cũ
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

        // =================================================================
        // 2. CORE DATA (Dữ liệu Admin & Cấu hình)
        // =================================================================

        // Admin
        $admin = User::create([
            'name' => 'Admin Shop',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'admin',
            'phone' => '0909000111',
            'avatar' => 'https://ui-avatars.com/api/?name=Admin+Shop&background=0D8ABC&color=fff',
            'is_blocked' => false,
        ]);

        // Khách mẫu
        $customer = User::create([
            'name' => 'Nguyễn Văn Khách',
            'email' => 'khach@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'customer',
            'phone' => '0909000222',
            'avatar' => 'https://ui-avatars.com/api/?name=Nguyen+Khach&background=random',
            'is_blocked' => false,
        ]);

        // Brands (Hãng)
        $brandsData = [
            ['name' => 'Dell', 'slug' => 'dell', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg'],
            ['name' => 'Apple', 'slug' => 'apple', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'],
            ['name' => 'Asus', 'slug' => 'asus', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg'],
            ['name' => 'HP', 'slug' => 'hp', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg'],
            ['name' => 'Lenovo', 'slug' => 'lenovo', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg'],
            ['name' => 'MSI', 'slug' => 'msi', 'logo' => 'https://upload.wikimedia.org/wikipedia/commons/c/c3/MSI_Logo_2019.svg'],
        ];

        $brandIds = [];
        foreach ($brandsData as $b) {
            $brand = Brand::create(['name' => $b['name'], 'slug' => $b['slug'], 'logo_url' => $b['logo']]);
            $brandIds[] = $brand->id;
        }

        // Categories (Danh mục)
        $laptop = Category::create(['name' => 'Laptop', 'slug' => 'laptop']);
        $gaming = Category::create(['name' => 'Gaming Laptop', 'slug' => 'gaming', 'parent_id' => $laptop->id]);
        $office = Category::create(['name' => 'Văn phòng', 'slug' => 'van-phong', 'parent_id' => $laptop->id]);
        $accessory = Category::create(['name' => 'Phụ kiện', 'slug' => 'phu-kien']);
        
        $categoryIds = [$gaming->id, $office->id, $accessory->id, $laptop->id];

        // =================================================================
        // 3. MASS DATA (Dữ liệu số lượng lớn)
        // =================================================================

        echo "Đang tạo 50 Users...\n";
        $userIds = [$customer->id];
        for ($i = 0; $i < 50; $i++) {
            $u = User::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('123456'),
                'role' => 'customer',
                'phone' => $faker->phoneNumber,
                'is_blocked' => $faker->boolean(5), // 5% bị khóa
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($faker->name) . '&background=random'
            ]);
            $userIds[] = $u->id;

            // Tạo địa chỉ
            UserAddress::create([
                'user_id' => $u->id,
                'address_line' => $faker->streetAddress,
                'city' => $faker->city,
                'district' => 'Quận ' . $faker->numberBetween(1, 12), // <--- ĐÃ SỬA: Thay $faker->state bằng chuỗi Quận giả
                'is_default' => true
            ]);
        }

// =================================================================
        // TẠO 50 SẢN PHẨM THỦ CÔNG (TÊN THẬT - ẢNH THẬT)
        // =================================================================
        echo "Đang tạo 50 sản phẩm thủ công chuẩn chỉnh...\n";

        // 1. Lấy ID của các Hãng và Danh mục để gán cho nhanh
        // Lưu ý: Đảm bảo slug trong mảng này khớp với phần tạo Category/Brand ở trên
        $b = Brand::pluck('id', 'slug')->toArray(); // ['apple' => 1, 'dell' => 2, ...]
        $c = Category::pluck('id', 'slug')->toArray(); // ['laptop' => 1, 'phu-kien' => 5, ...]

        // 2. Danh sách 50 sản phẩm cụ thể
        $manualProducts = [
            // --- APPLE (6 sp) ---
            ['name' => 'MacBook Air M1 2020 256GB', 'brand' => 'apple', 'cat' => 'van-phong', 'price' => 18990000, 'img' => 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800'],
            ['name' => 'MacBook Air M2 2022 13.6 inch', 'brand' => 'apple', 'cat' => 'van-phong', 'price' => 26990000, 'img' => 'https://cdn2.fptshop.com.vn/unsafe/828x0/filters:format(webp):quality(75)/2022_6_9_637903794789323641_Macbook%20Air%20M2%20-3.jpg'],
            ['name' => 'MacBook Pro 14 inch M3 Pro', 'brand' => 'apple', 'cat' => 'gaming', 'price' => 49990000, 'img' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
            ['name' => 'MacBook Pro 16 inch M3 Max', 'brand' => 'apple', 'cat' => 'gaming', 'price' => 89990000, 'img' => 'https://cdn.tgdd.vn/Products/Images/44/327690/macbook-pro-16-inch-m3-max-64gb-1tb-40gpu-den-1-750x500.jpg'],
            ['name' => 'iMac 24 inch 4.5K Retina M3', 'brand' => 'apple', 'cat' => 'van-phong', 'price' => 36990000, 'img' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'],
            ['name' => 'Mac Mini M2 2023', 'brand' => 'apple', 'cat' => 'van-phong', 'price' => 14990000, 'img' => 'https://cdn.tgdd.vn/Products/Images/5698/302152/mac-mini-m2-600x600.jpg'],

            // --- DELL (6 sp) ---
            ['name' => 'Dell XPS 13 Plus 9320', 'brand' => 'dell', 'cat' => 'van-phong', 'price' => 45000000, 'img' => 'https://www.laptopvip.vn/images/ab__webp/detailed/40/xs9320nt-xnb-shot-5-2-gy-www.laptopvip.vn-1733279605.webp'],
            ['name' => 'Dell XPS 15 9530 OLED', 'brand' => 'dell', 'cat' => 'gaming', 'price' => 62000000, 'img' => 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800'],
            ['name' => 'Dell Inspiron 14 7430 2-in-1', 'brand' => 'dell', 'cat' => 'van-phong', 'price' => 19500000, 'img' => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'],
            ['name' => 'Dell Inspiron 16 5630', 'brand' => 'dell', 'cat' => 'van-phong', 'price' => 22000000, 'img' => 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=800'],
            ['name' => 'Dell Latitude 7440 Ultralight', 'brand' => 'dell', 'cat' => 'van-phong', 'price' => 38000000, 'img' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
            ['name' => 'Dell Alienware m16 R1', 'brand' => 'dell', 'cat' => 'gaming', 'price' => 55000000, 'img' => 'https://images.unsplash.com/photo-1580522154071-c6ca47a859ad?w=800'],

            // --- ASUS (6 sp) ---
            ['name' => 'Asus ROG Strix G16 (2024)', 'brand' => 'asus', 'cat' => 'gaming', 'price' => 42000000, 'img' => 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800'],
            ['name' => 'Asus ROG Zephyrus G14 OLED', 'brand' => 'asus', 'cat' => 'gaming', 'price' => 48000000, 'img' => 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=800'],
            ['name' => 'Asus TUF Gaming F15 FX507', 'brand' => 'asus', 'cat' => 'gaming', 'price' => 21000000, 'img' => 'https://cdn2.fptshop.com.vn/unsafe/2022_asus_tuf_gaming_f15_fx507_jaeger_gray_c8fc1c350e.png'],
            ['name' => 'Asus Zenbook 14 OLED', 'brand' => 'asus', 'cat' => 'van-phong', 'price' => 24500000, 'img' => 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800'],
            ['name' => 'Asus Vivobook 15X OLED', 'brand' => 'asus', 'cat' => 'van-phong', 'price' => 16500000, 'img' => 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800'],
            ['name' => 'Asus Vivobook Go 14', 'brand' => 'asus', 'cat' => 'van-phong', 'price' => 10500000, 'img' => 'https://cdn2.fptshop.com.vn/unsafe/asus_vivobook_go_14_e1404f_1_abda26c500.png'],

            // --- HP (5 sp) ---
            ['name' => 'HP Spectre x360 14', 'brand' => 'hp', 'cat' => 'van-phong', 'price' => 42000000, 'img' => 'https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?w=800'],
            ['name' => 'HP Envy 13 ba1536TU', 'brand' => 'hp', 'cat' => 'van-phong', 'price' => 21000000, 'img' => 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=800'],
            ['name' => 'HP Pavilion 15 eg3000', 'brand' => 'hp', 'cat' => 'van-phong', 'price' => 15500000, 'img' => 'https://cdn.ankhang.vn/media/product/23727_laptop_hp_pavilion_15_eg3000tu_8c6l7pa_1.jpg'],
            ['name' => 'HP Omen 16 (Ryzen 7)', 'brand' => 'hp', 'cat' => 'gaming', 'price' => 38000000, 'img' => 'https://images.unsplash.com/photo-1595327656903-2f54e37ce09b?w=800'],
            ['name' => 'HP Victus 15 fa1139TX', 'brand' => 'hp', 'cat' => 'gaming', 'price' => 19000000, 'img' => 'https://cdn.tgdd.vn/Products/Images/44/318163/hp-victus-15-fa1139tx-i5-8y6w3pa-glr-1-1-750x500.jpg'],

            // --- LENOVO (5 sp) ---
            ['name' => 'Lenovo ThinkPad X1 Carbon Gen 11', 'brand' => 'lenovo', 'cat' => 'van-phong', 'price' => 48000000, 'img' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800'],
            ['name' => 'Lenovo ThinkPad T14s Gen 4', 'brand' => 'lenovo', 'cat' => 'van-phong', 'price' => 32000000, 'img' => 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800'],
            ['name' => 'Lenovo Legion 5 Pro 16ARH7H', 'brand' => 'lenovo', 'cat' => 'gaming', 'price' => 35000000, 'img' => 'https://product.hstatic.net/200000722513/product/ovo-legion-5-pro-16arh7h-82rg008svn-3_cfc3626f830a42259854e10d4e3d0233_140e8dc818f94315976a57da0db84306_master.png'],
            ['name' => 'Lenovo Legion Slim 7', 'brand' => 'lenovo', 'cat' => 'gaming', 'price' => 41000000, 'img' => 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800'],
            ['name' => 'Lenovo IdeaPad Slim 5 Light', 'brand' => 'lenovo', 'cat' => 'van-phong', 'price' => 14000000, 'img' => 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800'],

            // --- MSI (4 sp) ---
            ['name' => 'MSI Titan GT77 HX', 'brand' => 'msi', 'cat' => 'gaming', 'price' => 110000000, 'img' => 'https://bizweb.dktcdn.net/thumb/grande/100/386/607/products/laptop-msi-titan-gt77-cong-ket-noi-phai.png?v=1675072481497'],
            ['name' => 'MSI Raider GE78 HX', 'brand' => 'msi', 'cat' => 'gaming', 'price' => 75000000, 'img' => 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800'],
            ['name' => 'MSI Modern 14 C7M', 'brand' => 'msi', 'cat' => 'van-phong', 'price' => 12500000, 'img' => 'https://cdn2.cellphones.com.vn/x/media/catalog/product/t/e/text_ng_n_-_2023-04-27t221511.576_4_1.png'],
            ['name' => 'MSI Prestige 14 Evo', 'brand' => 'msi', 'cat' => 'van-phong', 'price' => 25000000, 'img' => 'https://storage-asset.msi.com/global/picture/image/feature/nb/Prestige/Prestige14-Evo-B13M/images/kv-laptop.png'],

            // --- PHỤ KIỆN & KHÁC (18 sp) ---
            ['name' => 'Chuột Logitech MX Master 3S', 'brand' => 'logitech', 'cat' => 'phu-kien', 'price' => 2600000, 'img' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800'],
            ['name' => 'Chuột Gaming Logitech G502 X', 'brand' => 'logitech', 'cat' => 'phu-kien', 'price' => 1800000, 'img' => 'https://product.hstatic.net/200000722513/product/g502x-plus-gallery-2-black_1db5bbb43d2f443ea2eaf758a6f97e77_ba770c37d454493f986eaaf4e81bddcf.png'],
            ['name' => 'Bàn phím cơ Keychron K2 Pro', 'brand' => 'logitech', 'cat' => 'phu-kien', 'price' => 2300000, 'img' => 'https://bizweb.dktcdn.net/thumb/1024x1024/100/329/122/products/ban-phim-co-khong-day-keychron-k2-pro-rgb-hotswap-05.jpg?v=1719559237667'],
            ['name' => 'Bàn phím cơ Logitech G Pro X', 'brand' => 'logitech', 'cat' => 'phu-kien', 'price' => 2900000, 'img' => 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800'],
            ['name' => 'Tai nghe Sony WH-1000XM5', 'brand' => 'sony', 'cat' => 'am-thanh', 'price' => 7500000, 'img' => 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800'],
            ['name' => 'Tai nghe Sony WF-1000XM5', 'brand' => 'sony', 'cat' => 'am-thanh', 'price' => 5500000, 'img' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'],
            ['name' => 'Loa Bluetooth JBL Flip 6', 'brand' => 'sony', 'cat' => 'am-thanh', 'price' => 2800000, 'img' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'],
            ['name' => 'Loa Marshall Stanmore III', 'brand' => 'sony', 'cat' => 'am-thanh', 'price' => 9500000, 'img' => 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800'],
            ['name' => 'Apple AirPods Pro 2 MagSafe', 'brand' => 'apple', 'cat' => 'am-thanh', 'price' => 5600000, 'img' => 'https://cdn.tgdd.vn/Products/Images/54/315014/tai-nghe-bluetooth-airpods-pro-2nd-gen-usb-c-charge-apple-1-750x500.jpg'],
            ['name' => 'Apple Magic Mouse 2 Black', 'brand' => 'apple', 'cat' => 'phu-kien', 'price' => 2400000, 'img' => 'https://images.unsplash.com/photo-1563191911-e65f8655ebf9?w=800'],
            ['name' => 'Màn hình Dell UltraSharp U2723QE', 'brand' => 'dell', 'cat' => 'phu-kien', 'price' => 14500000, 'img' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'],
            ['name' => 'Màn hình LG UltraGear 27GP850', 'brand' => 'asus', 'cat' => 'phu-kien', 'price' => 9500000, 'img' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'],
            ['name' => 'Giá đỡ Laptop Nhôm Z1', 'brand' => 'asus', 'cat' => 'phu-kien', 'price' => 350000, 'img' => 'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=800'],
            ['name' => 'Balo Laptop Chống Sốc', 'brand' => 'hp', 'cat' => 'phu-kien', 'price' => 450000, 'img' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
            ['name' => 'Cổng chuyển USB-C Hub 8in1', 'brand' => 'dell', 'cat' => 'phu-kien', 'price' => 850000, 'img' => 'https://cdn2.cellphones.com.vn/x/media/catalog/product/h/u/hub-chuyen-doi-hyperdrive-next-8-in-1-cong-usb-c-hd4004_3_.png'],
            ['name' => 'Sạc dự phòng Anker 20000mAh', 'brand' => 'dell', 'cat' => 'phu-kien', 'price' => 1100000, 'img' => 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800'],
            ['name' => 'Ổ cứng SSD Samsung T7 1TB', 'brand' => 'msi', 'cat' => 'phu-kien', 'price' => 2500000, 'img' => 'https://product.hstatic.net/200000722513/product/vn-portable-ssd-t7-mu-pc1t0t-ww__4__861f7362c78348268cae624035ad57e2_master.png'],
            ['name' => 'Webcam Logitech C920 Pro', 'brand' => 'logitech', 'cat' => 'phu-kien', 'price' => 1600000, 'img' => 'https://cdn2.cellphones.com.vn/x/media/catalog/product/w/e/webcam-logitech-c920-hd-1.jpg'],
        ];

        $productIds = [];
        
        foreach ($manualProducts as $mp) {
            // Xử lý lấy brand_id và category_id (dùng fallback nếu không tìm thấy key)
            // Nếu trong mảng $b không có key 'apple' thì lấy id của brand đầu tiên, tương tự với category
            $brandId = $b[$mp['brand']] ?? array_values($b)[0];
            $catId = $c[$mp['cat']] ?? array_values($c)[0];

            // Tính toán giá cũ (ảo)
            $oldPrice = $faker->boolean(60) ? $mp['price'] + rand(10, 30) * 100000 : null;

            $product = Product::create([
                'name' => $mp['name'],
                'slug' => Str::slug($mp['name']) . '-' . rand(1000, 9999),
                'sku' => strtoupper(Str::random(3)) . rand(10000, 99999),
                'brand_id' => $brandId,
                'category_id' => $catId,
                'price' => $mp['price'],
                'old_price' => $oldPrice,
                'stock' => rand(5, 50),
                'thumbnail' => $mp['img'], // Ảnh thủ công chuẩn 100%
                'description' => "Sản phẩm " . $mp['name'] . " chính hãng, bảo hành 12 tháng.",
                'content' => $faker->paragraph(5), // Nội dung chi tiết giả
                'is_featured' => $faker->boolean(20),
                'is_active' => true,
                'view_count' => rand(100, 5000),
                'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
            ]);

            $productIds[] = $product->id;

            // Tạo Specs theo loại sản phẩm
            if (Str::contains($mp['cat'], ['phu-kien', 'am-thanh'])) {
                 ProductSpec::create(['product_id' => $product->id, 'name' => 'Màu sắc', 'value' => 'Đen / Trắng']);
                 ProductSpec::create(['product_id' => $product->id, 'name' => 'Bảo hành', 'value' => '12 Tháng']);
            } else {
                // Là Laptop
                ProductSpec::create(['product_id' => $product->id, 'name' => 'CPU', 'value' => Str::contains($mp['name'], 'M1') ? 'Apple M1' : (Str::contains($mp['name'], 'i7') ? 'Core i7' : 'Core i5')]);
                ProductSpec::create(['product_id' => $product->id, 'name' => 'RAM', 'value' => '16GB']);
                ProductSpec::create(['product_id' => $product->id, 'name' => 'Ổ cứng', 'value' => '512GB SSD']);
            }

            // Tạo ảnh phụ (Gallery) - lấy lại ảnh thumbnail làm ảnh 1
            ProductImage::create([
                'product_id' => $product->id,
                'image_url' => $mp['img'],
                'display_order' => 1
            ]);

            // Specs
            ProductSpec::create(['product_id' => $product->id, 'name' => 'CPU', 'value' => $faker->randomElement(['Core i5', 'Core i7', 'Ryzen 5', 'Ryzen 7', 'Apple M2'])]);
            ProductSpec::create(['product_id' => $product->id, 'name' => 'RAM', 'value' => $faker->randomElement(['8GB', '16GB', '32GB'])]);
            
            // Ảnh phụ
            ProductImage::create([
                'product_id' => $product->id,
                'image_url' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
                'display_order' => 1
            ]);
        }

        echo "Đang tạo 500 Orders (Doanh thu)...\n";
        $statuses = ['completed', 'completed', 'completed', 'cancelled', 'shipping', 'pending'];
        
        for ($i = 0; $i < 500; $i++) {
            $buyerId = $faker->randomElement($userIds);
            $orderDate = $faker->dateTimeBetween('-12 months', 'now');

            // Logic tính tiền
            $subtotal = 0;
            $items = [];
            $itemCount = rand(1, 3);

            for ($k = 0; $k < $itemCount; $k++) {
                $prodId = $faker->randomElement($productIds);
                $prod = Product::find($prodId);
                $qty = rand(1, 2);
                $subtotal += $prod->price * $qty;
                $items[] = ['id' => $prodId, 'qty' => $qty, 'price' => $prod->price];
            }

            $shipping = 30000;
            $discount = $faker->boolean(20) ? 50000 : 0;
            $total = $subtotal + $shipping - $discount;

            $status = $faker->randomElement($statuses);
            if ($orderDate > now()->subDays(5)) $status = $faker->randomElement(['pending', 'shipping']);

            $order = Order::create([
                'user_id' => $buyerId,
                'customer_name' => User::find($buyerId)->name,
                'customer_phone' => $faker->phoneNumber,
                'shipping_address' => $faker->streetAddress,
                'city' => $faker->city,
                'note' => $faker->boolean(30) ? 'Giao giờ hành chính' : null,
                'subtotal' => $subtotal,
                'shipping_fee' => $shipping,
                'discount_amount' => $discount,
                'total_amount' => $total,
                'coupon_code' => $discount > 0 ? 'SALE50K' : null,
                'payment_method' => $faker->randomElement(['COD', 'VNPAY', 'MOMO']),
                'payment_status' => ($status == 'completed') ? 'paid' : 'unpaid',
                'status' => $status,
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            foreach ($items as $item) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $item['id'],
                    'quantity' => $item['qty'],
                    'price' => $item['price']
                ]);
            }
        }

        echo "Đang tạo 300 Reviews...\n";
        for ($i = 0; $i < 300; $i++) {
            Review::create([
                'user_id' => $faker->randomElement($userIds),
                'product_id' => $faker->randomElement($productIds),
                'rating' => $faker->numberBetween(3, 5),
                'comment' => $faker->sentence(10),
                'created_at' => $faker->dateTimeBetween('-6 months', 'now')
            ]);
        }

        echo "Đã tạo xong dữ liệu mẫu! \n";
    }
}
<?php

use Illuminate\Support\Facades\Hash;
use App\Models\User;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check if admin exists
$admin = User::where('email', 'admin@lapstore.vn')->first();

if (!$admin) {
    $admin = User::create([
        'name' => 'Admin',
        'email' => 'admin@lapstore.vn',
        'password' => Hash::make('admin123'),
        'role' => 'admin',
        'phone' => '0123456789',
    ]);
    echo "✅ Admin user created successfully!\n";
    echo "Email: admin@lapstore.vn\n";
    echo "Password: admin123\n";
} else {
    echo "✅ Admin user already exists!\n";
    echo "Email: {$admin->email}\n";
    echo "Role: {$admin->role}\n";

    // Update password if needed
    $admin->password = Hash::make('admin123');
    $admin->role = 'admin';
    $admin->save();
    echo "✅ Password reset to: admin123\n";
}

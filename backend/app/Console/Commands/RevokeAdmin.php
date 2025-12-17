<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class RevokeAdmin extends Command
{
    protected $signature = 'user:revoke-admin {email}';
    protected $description = 'Revoke admin role from a user by email';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();
        if (! $user) {
            $this->error('User not found: '.$email);
            return 1;
        }

        $user->role = 'customer';
        $user->save();

        $this->info('Admin role revoked for: '.$email);
        return 0;
    }
}

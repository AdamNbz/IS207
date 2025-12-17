<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class MakeAdmin extends Command
{
    protected $signature = 'user:make-admin {email}';
    protected $description = 'Promote a user to admin by email';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();
        if (! $user) {
            $this->error('User not found: '.$email);
            return 1;
        }

        $user->role = 'admin';
        $user->save();

        $this->info('User promoted to admin: '.$email);
        return 0;
    }
}

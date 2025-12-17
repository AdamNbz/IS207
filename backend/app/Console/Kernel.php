<?php
namespace App\Console;

use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        \App\Console\Commands\MakeAdmin::class,
        \App\Console\Commands\RevokeAdmin::class,
    ];
}

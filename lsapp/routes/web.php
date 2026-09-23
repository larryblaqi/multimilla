<?php

use Illuminate\Support\Facades\Route;

// Dedicated subdomain routes
Route::domain('ios.multimilla.com')->group(function () {
    Route::get('{any?}', function () {
        if (file_exists(public_path('ios/index.html'))) {
            return response(file_get_contents(public_path('ios/index.html')))->header('Content-Type', 'text/html');
        }
        return response(file_get_contents(public_path('index.html')))->header('Content-Type', 'text/html');
    })->where('any', '.*');
});

Route::domain('android.multimilla.com')->group(function () {
    Route::get('{any?}', function () {
        if (file_exists(public_path('android/index.html'))) {
            return response(file_get_contents(public_path('android/index.html')))->header('Content-Type', 'text/html');
        }
        return response(file_get_contents(public_path('index.html')))->header('Content-Type', 'text/html');
    })->where('any', '.*');
});

// Dedicated path routes
Route::get('/ios', function () {
    if (file_exists(public_path('ios/index.html'))) {
        return response(file_get_contents(public_path('ios/index.html')))->header('Content-Type', 'text/html');
    }
    return response(file_get_contents(public_path('index.html')))->header('Content-Type', 'text/html');
});

Route::get('/android', function () {
    if (file_exists(public_path('android/index.html'))) {
        return response(file_get_contents(public_path('android/index.html')))->header('Content-Type', 'text/html');
    }
    return response(file_get_contents(public_path('index.html')))->header('Content-Type', 'text/html');
});

Route::get('/', function () {
    if (file_exists(public_path('index.html'))) {
        return response(file_get_contents(public_path('index.html')))->header('Content-Type', 'text/html');
    }
    return view('welcome');
});

Route::post('/public/api/v1/webhooks/monnify', [\App\Http\Controllers\Api\V1\MonnifyWebhookController::class, 'handleWebhook']);
Route::post('/public/api/v1/payout-webhooks/monnify', [\App\Http\Controllers\Api\V1\WithdrawalWebhookController::class, 'handleWithdrawalWebhook']);

Route::get('/{any}', function () {
    if (file_exists(public_path('index.html'))) {
        return response(file_get_contents(public_path('index.html')))->header('Content-Type', 'text/html');
    }
    return view('welcome');
})->where('any', '^(?!api|admin).*$');


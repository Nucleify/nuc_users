<?php

if (!defined('PEST_RUNNING')) {
    return;
}

use App\Models\User;

test('can create record', function (): void {
    $model = User::factory()->create();

    $this->assertDatabaseCount('users', 1)
        ->assertDatabaseHas('users', ['id' => $model->id]);
});

test('can create multiple records', function (): void {
    $models = User::factory()->count(3)->create();

    $this->assertDatabaseCount('users', 3);
    foreach ($models as $model) {
        $this->assertDatabaseHas('users', ['id' => $model->id]);
    }
});

test('can create record with phone number', function (): void {
    $model = User::factory()->create(['phone_number' => '+48123456789']);

    $this->assertDatabaseHas('users', [
        'id' => $model->id,
        'phone_number' => '+48123456789',
    ]);
});

test('can create record with nullable phone number', function (): void {
    $model = User::factory()->create(['phone_number' => null]);

    $this->assertDatabaseHas('users', [
        'id' => $model->id,
        'phone_number' => null,
    ]);
});

test('can create record with language', function (): void {
    $model = User::factory()->create(['language' => 'pl']);

    $this->assertDatabaseHas('users', [
        'id' => $model->id,
        'language' => 'pl',
    ]);
});

test('can create record with country', function (): void {
    $model = User::factory()->create(['country' => 'germany']);

    $this->assertDatabaseHas('users', [
        'id' => $model->id,
        'country' => 'germany',
    ]);
});

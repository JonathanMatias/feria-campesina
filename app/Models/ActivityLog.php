<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = ['user_id', 'action', 'description', 'model_type', 'model_id', 'metadata', 'level'];
    protected $casts = ['metadata' => 'array'];
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function log($action, $description = null, $metadata = [], $level = 'info')
    {
        return self::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'description' => $description,
            'metadata' => $metadata,
            'level' => $level,
        ]);
    }
}

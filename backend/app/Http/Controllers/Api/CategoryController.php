<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     * Trả về danh sách danh mục (có thể dạng cây) theo chuẩn REST.
     * Query optional: ?tree=1 để trả về cấu trúc lồng nhau.
     */
    public function index(Request $request)
    {
        $asTree = filter_var($request->query('tree'), FILTER_VALIDATE_BOOLEAN);

        if ($asTree) {
            // Lấy tất cả và build cây nhanh (O(n))
            $all = Category::select('id','name','slug','parent_id')->orderBy('name')->get();
            $byParent = [];
            foreach ($all as $c) {
                $byParent[$c->parent_id ?? 0][] = $c;
            }
            $build = function($parentId) use (&$build, $byParent) {
                $nodes = $byParent[$parentId] ?? [];
                return collect($nodes)->map(function($cat) use ($build) {
                    return [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                        'children' => $build($cat->id),
                    ];
                })->values();
            };
            return response()->json(['data' => $build(0)]);
        }

        // Dạng phẳng
        $categories = Category::select('id','name','slug','parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'parent_id' => $c->parent_id,
            ]);

        return response()->json(['data' => $categories]);
    }
}

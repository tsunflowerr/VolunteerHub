import Category from '../../models/categoryModel.js';
import { invalidateCache } from '../../utils/cacheHelper.js';

export async function createCategory(req, res) {
    const {name, slug, description} = req.body;
    try {
        const existingCategory = await Category.findOne({$or:[{slug}, {name}]});
        if(existingCategory) {
            return res.status(400).json({success:false, message:"Category with the same name or slug already exists"});
        }
        const category = new Category({name, slug, description: description || ""});
        const saved = await category.save();
        
        // Xóa cache sau khi tạo category mới
        await invalidateCache('categories:all');
        
        res.status(201).json({success:true, category: saved})
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({success:false, message:"Failed to create category"});
    }
}

export async function updateCategory(req, res) {
    const id = req.params.id;
    const {name, slug, description} = req.body;
    try {
        // Lấy category cũ để xóa cache theo slug cũ
        const oldCategory = await Category.findById(id);
        
        const updatedCategory = await Category.findByIdAndUpdate(
            id, 
            {name, slug, description}, 
            {new: true, runValidators: true}
        );
        if(!updatedCategory) {
            return res.status(404).json({success:false, message:"Category not found"});
        }
        
        // Xóa cache sau khi update
        await invalidateCache(
            'categories:all',
            `category:id:${id}`,
            `category:slug:${oldCategory?.slug}`,
            `category:slug:${slug}` // slug mới nếu đổi
        );
        
        res.status(200).json({success:true, category: updatedCategory});
    }
    catch(error) {
        console.error("Error updating category:", error);
        res.status(500).json({success:false, message:"Server error"});
    }
}

import Category from '../models/Category.js';

export async function createCategory(req, res) {
    const {name, slug, description} = req.body;
    try {
        const existingCategory = await Category.findOne({$or:[{slug}, {name}]});
        if(existingCategory) {
            return res.status(400).json({success:false, message:"Category with the same name or slug already exists"});
        }
        const category = new Category({name, slug, description: description || ""});
        const saved = await category.save();
        res.status(201).json({success:true, category: saved})
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({success:false, message:"Failed to create category"});
    }
}
export async function getAllCategories(req, res) {
    try {
        const categories = await Category.find().sort({createdAt: -1});
        if(categories.length === 0) {
            return res.status(200).json({success:true, message:"No categories found", categories: []});
        }
        res.status(200).json({success:true, categories});
    }
    catch(error) {
        console.error("Error fetching categories:", error)
        res.status(500).json({success:false, message:"Server error"});
    }
}

export async function getCategoryById(req, res) {
    const categoryId = req.params.id;
    try {
        const category = await Category.findById(categoryId);
        if(!category) {
            return res.status(404).json({success:false, message:"Category not found"});
        }
        res.status(200).json({success:true, category});
    }
    catch(error) {
        console.error("Error fetching category by id:", error)
        res.status(500).json({success:false, message:"Server error"});
    }
}

export async function getCategoryBySlug(req, res) {
    const categorySlug = req.params.slug;
    try {
        const category = await Category.findOne({slug: categorySlug});
        if(!category) {
            return res.status(404).json({success:false, message:"Category not found"});
        }
        res.status(200).json({success:true, category});
    }
    catch(error) {
        console.error("Error fetching category by slug:", error)
        res.status(500).json({success:false, message:"Server error"});
    }
}

export async function updateCategory(req, res) {
    const id = req.params.id;
    const {name, slug, description} = req.body;
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            id, 
            {name, slug, description}, 
            {new: true, runValidators: true}
        );
        if(!updatedCategory) {
            return res.status(404).json({success:false, message:"Category not found"});
        }
        res.status(200).json({success:true, category: updatedCategory});
    }
    catch(error) {
        console.error("Error updating category:", error);
        res.status(500).json({success:false, message:"Server error"});
    }
}
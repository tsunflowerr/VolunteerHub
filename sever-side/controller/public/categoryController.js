import Category from '../../models/categoryModel.js';

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

import Event from '../../models/eventModel.js';
import User from '../../models/userModel.js';
import Post from '../../models/postModel.js';
import Category from '../../models/categoryModel.js';
import { getOrSetCache, CACHE_TTL } from '../../utils/cacheHelper.js';

export async function searchEvents(req, res) {
  try {
    const { keyword, location, startDate, endDate, status, sort, page, limit } =
      req.query;

    let { category } = req.query;
    // Fallback for category[] if not parsed correctly
    if (!category && req.query['category[]']) {
      category = req.query['category[]'];
    }

    const skip = (page - 1) * limit;

    const filter = {};

    if (keyword) {
      filter.$text = { $search: keyword };
    }
    if (category) {
      let categorySlugs = [];
      if (Array.isArray(category)) {
        categorySlugs = category;
      } else if (typeof category === 'string') {
        categorySlugs = category.split(',').map((s) => s.trim());
      }

      if (categorySlugs.length > 0) {
        const categoryDocs = await Category.find({
          slug: { $in: categorySlugs },
        }).lean();

        if (categoryDocs.length > 0) {
          filter.categories = { $in: categoryDocs.map((doc) => doc._id) };
        } else {
          // If categories provided but none found, return empty or 404?
          // Here returning 404 to be consistent with previous logic,
          // or we could let the query run and return 0 events.
          // Let's let the query run with a non-matching ID to return 0 results
          // effectively "no events found for these categories".
          filter.categories = { $in: [] };
        }
      }
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) {
        filter.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.startDate.$lte = new Date(endDate);
      }
    }
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ['approved', 'completed'] };
    }

    let sortOptions = {};
    switch (sort) {
      case 'relevance':
        // Sort by text search relevance score (only works with text search)
        sortOptions = keyword
          ? { score: { $meta: 'textScore' } }
          : { createdAt: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'trending':
        sortOptions = { registrationsCount: -1, likesCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const cacheKey = `search:events:${JSON.stringify({
      keyword,
      category,
      location,
      startDate,
      endDate,
      status,
      sort,
      page,
      limit,
    })}`;

    const result = await getOrSetCache(
      cacheKey,
      CACHE_TTL.EVENTS_LIST,
      async () => {
        // Build query with optional text score projection
        let query = Event.find(filter);

        // Add text score projection if sorting by relevance
        if (sort === 'relevance' && keyword) {
          query = query.select({ score: { $meta: 'textScore' } });
        }

        const [events, total] = await Promise.all([
          query
            .populate('managerId', 'username email avatar')
            .populate('categories', 'name slug color description')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean(),
          Event.countDocuments(filter),
        ]);

        return {
          events,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalEvents: total,
            limit,
          },
          filters: {
            keyword: keyword || null,
            category: category || null,
            location: location || null,
            startDate: startDate || null,
            endDate: endDate || null,
            status: status || 'approved,completed',
            sort: sort || 'newest',
          },
        };
      }
    );

    if (!result.events || result.events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching events found',
      });
    }

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('Error searching events:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while searching events',
    });
  }
}

export async function searchUsers(req, res) {
  try {
    const { keyword, role, status, page, limit } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};

    if (keyword) {
      filter.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -pushSubscription')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching users found',
      });
    }

    res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        limit,
      },
      filters: {
        keyword: keyword || null,
        role: role || null,
        status: status || null,
      },
    });
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users',
    });
  }
}

export async function searchPosts(req, res) {
  try {
    const { eventId } = req.params;
    const { keyword, sort, page, limit } = req.query;
    const skip = (page - 1) * limit;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const filter = { eventId };

    if (keyword) {
      // Use text search for better performance with indexed fields
      filter.$text = { $search: keyword };
    }

    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { likesCount: -1, commentsCount: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'username email avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching posts found',
      });
    }

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        limit,
      },
      filters: {
        keyword: keyword || null,
        sort: sort || 'newest',
      },
    });
  } catch (err) {
    console.error('Error searching posts:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while searching posts',
    });
  }
}

export async function advancedSearch(req, res) {
  try {
    const keyword = req.query.q;
    const type = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // CASE 1: Tìm theo type cụ thể (có pagination đầy đủ)
    if (type && type !== 'all') {
      if (type === 'events') {
        const [events, total] = await Promise.all([
          Event.find({
            $text: { $search: keyword },
            status: { $in: ['approved', 'completed'] },
          })
            .select(
              'name description location startDate endDate categories viewCount likesCount registrationsCount'
            )
            .populate('categories', 'name slug color description')
            .populate('managerId', 'username avatar')
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
          Event.countDocuments({
            $text: { $search: keyword },
            status: { $in: ['approved', 'completed'] },
          }),
        ]);

        return res.status(200).json({
          success: true,
          keyword,
          type: 'events',
          data: events,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            limit: parseInt(limit),
          },
        });
      }

      if (type === 'posts') {
        const [posts, total] = await Promise.all([
          Post.find({
            $text: { $search: keyword },
          })
            .select(
              'title content author eventId likesCount commentsCount createdAt'
            )
            .populate('author', 'username avatar')
            .populate('eventId', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
          Post.countDocuments({
            $text: { $search: keyword },
          }),
        ]);

        return res.status(200).json({
          success: true,
          keyword,
          type: 'posts',
          data: posts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            limit: parseInt(limit),
          },
        });
      }

      if (type === 'users') {
        const userFilter = {
          $or: [
            { username: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } },
          ],
          status: 'active',
        };

        const [users, total] = await Promise.all([
          User.find(userFilter)
            .select('username email avatar role')
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
          User.countDocuments(userFilter),
        ]);

        return res.status(200).json({
          success: true,
          keyword,
          type: 'users',
          data: users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            limit: parseInt(limit),
          },
        });
      }
    }

    // CASE 2: Tìm tất cả (type = 'all') - Preview mode (5 items mỗi loại)
    const userFilter = {
      $or: [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ],
      status: 'active',
    };

    const [events, users, posts, eventCount, userCount, postCount] =
      await Promise.all([
        Event.find({
          $text: { $search: keyword },
          status: { $in: ['approved', 'completed'] },
        })
          .select(
            'name description location startDate endDate categories viewCount likesCount thumbnail registrationsCount'
          )
          .populate('categories', 'name slug color description')
          .populate('managerId', 'username avatar')
          .limit(5)
          .lean(),

        User.find(userFilter)
          .select('username email avatar role')
          .limit(5)
          .lean(),

        Post.find({
          $text: { $search: keyword },
        })
          .select(
            'title content author eventId likesCount commentsCount createdAt'
          )
          .populate('author', 'username avatar')
          .populate('eventId', 'name')
          .limit(5)
          .lean(),

        // Count totals
        Event.countDocuments({
          $text: { $search: keyword },
          status: { $in: ['approved', 'completed'] },
        }),
        User.countDocuments(userFilter),
        Post.countDocuments({
          $text: { $search: keyword },
        }),
      ]);

    const results = [
      {
        type: 'events',
        count: eventCount,
        preview: events,
        hasMore: eventCount > 5,
      },
      {
        type: 'users',
        count: userCount,
        preview: users,
        hasMore: userCount > 5,
      },
      {
        type: 'posts',
        count: postCount,
        preview: posts,
        hasMore: postCount > 5,
      },
    ];

    res.status(200).json({
      success: true,
      keyword,
      totalResults: eventCount + userCount + postCount,
      results,
    });
  } catch (err) {
    console.error('Error in advanced search:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while performing advanced search',
    });
  }
}

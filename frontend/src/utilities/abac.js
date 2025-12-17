// Define role-based permissions with ABAC support
// Each role can have resources (e.g., events) and actions (e.g., manage, register)
// Permissions can be boolean (true/false) or functions (user, resource) => boolean

const ROLES = {
  admin: {
    events: {
      manage: false, // Admins do not manage events directly
      register: false,
      bookmark: false, // Admins manage, don't bookmark
      discussion: (user, event) =>
        event.status === 'approved' || event.status === 'completed',
    },
    dashboard: {
      view: true,
    },
    posts: {
      edit: false,
      delete: true, // Admin can delete any post
    },
  },
  manager: {
    events: {
      manage: (user, event) => {
        const userId = user.id || user._id;
        const managerId = event.managerId?._id || event.managerId;
        return managerId === userId;
      },
      register: false,
      bookmark: true,
      discussion: (user, event) => {
        const userId = user.id || user._id;
        const managerId = event.managerId?._id || event.managerId;
        return (
          managerId === userId &&
          (event.status === 'approved' || event.status === 'completed')
        );
      },
    },
    dashboard: {
      view: true,
    },
    posts: {
      edit: (user, post) => {
        const userId = user._id || user.id;
        const authorId = post.author?._id || post.author?.id;
        return authorId === userId;
      },
      delete: true,
    },
  },
  user: {
    events: {
      manage: false,
      register: true,
      bookmark: true,
      discussion: (user, event) =>
        (event.currentUserState === 'approved' ||
          event.currentUserState === 'confirmed') &&
        (event.status === 'approved' || event.status === 'completed'),
    },
    dashboard: {
      view: false,
    },
    posts: {
      edit: (user, post) => {
        const userId = user.id || user._id;
        const authorId = post.author?._id || post.author;
        return authorId === userId; // User can edit their own posts
      },
      delete: (user, post) => {
        const userId = user.id || user._id;
        const authorId = post.author?._id || post.author;
        return authorId === userId; // User can delete their own posts
      },
    },
  },
};

/**
 * Checks if a user has permission to perform an action on a resource.
 *
 * @param {Object} user - The user object containing 'role' and 'id'.
 * @param {string} resource - The resource key (e.g., 'events').
 * @param {string} action - The action key (e.g., 'manage').
 * @param {Object} [data] - The resource data (e.g., event object) for attribute checks.
 * @returns {boolean} - True if the user has permission, false otherwise.
 */
export function checkPermission(user, resource, action, data) {
  if (!user || !user.role) return false;

  const rolePermissions = ROLES[user.role];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  const permission = resourcePermissions[action];
  if (permission === undefined) return false;

  if (typeof permission === 'function') {
    return permission(user, data);
  }

  return permission;
}

// Helper constants to avoid magic strings
export const RESOURCES = {
  EVENTS: 'events',
  DASHBOARD: 'dashboard',
  POSTS: 'posts',
};

export const ACTIONS = {
  MANAGE: 'manage',
  REGISTER: 'register',
  BOOKMARK: 'bookmark',
  VIEW: 'view',
  DISCUSSION: 'discussion',
  EDIT: 'edit',
  DELETE: 'delete',
};

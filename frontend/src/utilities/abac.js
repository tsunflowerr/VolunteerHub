// Define role-based permissions with ABAC support
// Each role can have resources (e.g., events) and actions (e.g., manage, register)
// Permissions can be boolean (true/false) or functions (user, resource) => boolean

const ROLES = {
  admin: {
    events: {
      manage: false, // Admins do not manage events directly
      register: false,
      bookmark: false, // Admins manage, don't bookmark
      discussion: true,
    },
    dashboard: {
      view: true,
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
        return managerId === userId;
      },
    },
    dashboard: {
      view: true,
    },
  },
  user: {
    events: {
      manage: false,
      register: true,
      bookmark: true,
      discussion: (user, event) =>
        event.currentUserState === 'approved' ||
        event.currentUserState === 'confirmed',
    },
    dashboard: {
      view: false,
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
};

export const ACTIONS = {
  MANAGE: 'manage',
  REGISTER: 'register',
  BOOKMARK: 'bookmark',
  VIEW: 'view',
  DISCUSSION: 'discussion',
};

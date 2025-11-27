import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Get stored users or empty array
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Find user by email and password
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const userWithoutPassword = {
        id: foundUser.id,
        fullName: foundUser.fullName,
        email: foundUser.email,
        phone: foundUser.phone,
        location: foundUser.location,
        bio: foundUser.bio,
        aboutMe: foundUser.aboutMe,
        avatar: foundUser.avatar,
      };
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return { success: true };
    }

    return { success: false, message: 'Invalid email or password' };
  };

  const register = (fullName, email, password) => {
    // Get stored users or empty array
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return { success: false, message: 'User already exists with this email' };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      password,
      phone: null,
      location: null,
      bio: null,
      aboutMe: null,
      avatar: `https://ui-avatars.com/api/?name=${fullName}&background=random`,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login after registration
    const userWithoutPassword = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      location: newUser.location,
      bio: newUser.bio,
      aboutMe: newUser.aboutMe,
      avatar: newUser.avatar,
    };
    setUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUserInfo = (updatedData) => {
    if (!user) {
      return { success: false, message: 'No user logged in' };
    }

    // Get stored users
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Find and update the user in users array
    const userIndex = users.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      // Preserve password when updating
      const existingPassword = users[userIndex].password;
      users[userIndex] = {
        ...users[userIndex],
        ...updatedData,
        password: existingPassword,
        id: user.id,
        email: user.email, // Email should not be changed
      };
      localStorage.setItem('users', JSON.stringify(users));
    }

    // Update current user (without password)
    const updatedUser = {
      id: user.id,
      email: user.email,
      fullName:
        updatedData.fullName !== undefined
          ? updatedData.fullName
          : user.fullName,
      phone: updatedData.phone !== undefined ? updatedData.phone : user.phone,
      location:
        updatedData.location !== undefined
          ? updatedData.location
          : user.location,
      bio: updatedData.bio !== undefined ? updatedData.bio : user.bio,
      aboutMe:
        updatedData.aboutMe !== undefined ? updatedData.aboutMe : user.aboutMe,
      avatar:
        updatedData.avatar !== undefined ? updatedData.avatar : user.avatar,
    };

    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUserInfo, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'manager' | 'employee' | 'hr';

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  [key: string]: Permission[];
}

const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    { resource: 'dashboard', actions: ['read', 'write', 'delete'] },
    { resource: 'attendance', actions: ['read', 'write', 'delete', 'approve'] },
    { resource: 'leave', actions: ['read', 'write', 'delete', 'approve', 'reject'] },
    { resource: 'employees', actions: ['read', 'write', 'delete', 'create'] },
    { resource: 'reports', actions: ['read', 'write', 'export'] },
    { resource: 'settings', actions: ['read', 'write'] },
    { resource: 'notifications', actions: ['read', 'write', 'delete'] },
    { resource: 'analytics', actions: ['read', 'write'] },
    { resource: 'system', actions: ['read', 'write', 'delete'] }
  ],
  manager: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'attendance', actions: ['read', 'write', 'approve'] },
    { resource: 'leave', actions: ['read', 'write', 'approve', 'reject'] },
    { resource: 'employees', actions: ['read'] },
    { resource: 'reports', actions: ['read', 'export'] },
    { resource: 'notifications', actions: ['read', 'write'] },
    { resource: 'analytics', actions: ['read'] }
  ],
  hr: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'attendance', actions: ['read', 'write'] },
    { resource: 'leave', actions: ['read', 'write', 'approve', 'reject'] },
    { resource: 'employees', actions: ['read', 'write'] },
    { resource: 'reports', actions: ['read', 'export'] },
    { resource: 'notifications', actions: ['read', 'write'] },
    { resource: 'analytics', actions: ['read'] }
  ],
  employee: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'attendance', actions: ['read', 'write'] },
    { resource: 'leave', actions: ['read', 'write'] },
    { resource: 'notifications', actions: ['read'] },
    { resource: 'profile', actions: ['read', 'write'] }
  ]
};

interface RoleContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  hasPermission: (resource: string, action: string) => boolean;
  canAccess: (resource: string) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isHR: boolean;
  isEmployee: boolean;
  getRolePermissions: () => Permission[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('employee');

  useEffect(() => {
    // Load role from localStorage or user data
    const savedRole = localStorage.getItem('userRole') as UserRole;
    if (savedRole && ROLE_PERMISSIONS[savedRole]) {
      setCurrentRole(savedRole);
    }
  }, []);

  const setRole = (role: UserRole) => {
    if (ROLE_PERMISSIONS[role]) {
      setCurrentRole(role);
      localStorage.setItem('userRole', role);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    const permissions = ROLE_PERMISSIONS[currentRole] || [];
    const resourcePermission = permissions.find(p => p.resource === resource);
    return resourcePermission?.actions.includes(action) || false;
  };

  const canAccess = (resource: string): boolean => {
    const permissions = ROLE_PERMISSIONS[currentRole] || [];
    return permissions.some(p => p.resource === resource);
  };

  const getRolePermissions = (): Permission[] => {
    return ROLE_PERMISSIONS[currentRole] || [];
  };

  const value: RoleContextType = {
    currentRole,
    setRole,
    hasPermission,
    canAccess,
    isAdmin: currentRole === 'admin',
    isManager: currentRole === 'manager',
    isHR: currentRole === 'hr',
    isEmployee: currentRole === 'employee',
    getRolePermissions
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

// Higher-order component for role-based access control
export function withRoleAccess(
  WrappedComponent: React.ComponentType<any>,
  requiredResource: string,
  requiredAction: string = 'read'
) {
  return function RoleProtectedComponent(props: any) {
    const { hasPermission } = useRole();
    
    if (!hasPermission(requiredResource, requiredAction)) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-primary-red-dark mb-2">
              Access Denied
            </h3>
            <p className="text-text-light">
              You don't have permission to access this resource.
            </p>
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}

// Hook for conditional rendering based on permissions
export function usePermission(resource: string, action: string = 'read') {
  const { hasPermission } = useRole();
  return hasPermission(resource, action);
}

// Hook for conditional rendering based on role
export function useRoleCheck(role: UserRole) {
  const { currentRole } = useRole();
  return currentRole === role;
} 
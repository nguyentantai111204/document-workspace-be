export enum PermissionCode {
    AUTH_READ = 'auth.read',
    AUTH_UPDATE = 'auth.update',

    USER_READ = 'user.read',
    USER_CREATE = 'user.create',
    USER_UPDATE = 'user.update',
    USER_DELETE = 'user.delete',

    ROLE_CREATE = 'role.create',
    ROLE_UPDATE = 'role.update',

    PERMISSION_ASSIGN = 'permission.assign',

    FILE_READ = 'file.read',
    FILE_UPLOAD = 'file.upload',
    FILE_DELETE = 'file.delete',

    WORKSPACE_READ = 'workspace.read',
    WORKSPACE_CREATE = 'workspace.create',
    WORKSPACE_UPDATE = 'workspace.update',
    WORKSPACE_DELETE = 'workspace.delete',
}

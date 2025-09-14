# Commercial Upgrade Migration Instructions

This document provides step-by-step instructions to complete the migration from the basic version to the commercial version of the application.

## Prerequisites

- Make sure you have a backup of your database
- Make sure the application is not running during migration
- Update all dependencies with `npm install`

## Migration Steps

### 1. Run the Migration Script

```bash
# Navigate to the backend directory
cd backend

# Run the migration script
npm run migrate:commercial
```

This script will:
1. Create a backup of your current schema.prisma
2. Replace it with the commercial version schema
3. Generate and execute the migration

### 2. Update Required Services

After the migration is complete, some services need to be updated to work with the new schema:

#### Organization Service

The temporary implementation needs to be replaced with the full implementation that works with the new schema. The key changes include:
- Organization CRUD operations with proper relationships
- User-organization management
- Organization permissions and roles

#### User Service

Update the user service to include:
- Relationship with organizations
- Team membership handling
- Updated user roles

#### Host Service

Update the host service to include:
- Organization ownership
- Team-based access
- Proper permission checks

### 3. Testing the Migration

After completing the migration, verify the following:

1. Existing users can log in
2. Existing hosts are accessible 
3. Organization features are working
4. Teams can be created and managed
5. Subscription features are working

### 4. Rollback Procedure (if needed)

If you encounter issues with the migration, you can roll back using the backup:

1. Stop the application
2. Restore the schema.prisma file from the backup
3. Connect to your database and restore the database from backup

## Support

If you encounter any issues during the migration, please contact support at support@example.com.

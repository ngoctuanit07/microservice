# Commercial Upgrade Migration Plan

## Current State
- Simple User and Host management system
- No organization structure (direct user-host relationship)
- No subscription management
- Basic schema without multi-tenant capabilities

## Target State
- Multi-tenant system with Organizations as the top-level entity
- Subscription management with Stripe integration
- Team-based access control within organizations
- Proper relationships between User, Organization, Team, and Host entities

## Migration Steps

### 1. Create the Migration File

```bash
# Navigate to the backend directory
cd backend

# Create a migration based on the schema-update.prisma file
cp src/prisma/schema-update.prisma src/prisma/schema.prisma

# Generate the migration with Prisma
npx prisma migrate dev --name commercial_upgrade
```

### 2. Update Application Modules

#### Update or Create Required Modules:
- Organization Module
  - Organization Controller
  - Organization Service
  
- Subscription Module
  - Subscription Controller
  - Subscription Service
  - Stripe Service

- Team Module
  - Team Controller
  - Team Service

#### Update Existing Modules:
- User Module
  - Update to work with organizations
  - Add organization relationships

- Host Module
  - Update to work with organizations and teams
  - Add proper ownership model

### 3. Database Migration Strategy

1. Create new tables:
   - Organization
   - Team
   - UserTeam
   - HostTeam
   - ApiKey
   - Session
   - Alert
   - Notification

2. Modify existing tables:
   - User (add organizationId)
   - Host (add organizationId)
   - AuditLog (expand fields)

3. Data Migration:
   - Create default organization for existing users
   - Associate existing hosts with appropriate organizations
   - Update permissions and roles

### 4. Testing Plan

1. Verify all existing functionality works with the new schema
2. Test organization management
3. Test subscription management with Stripe
4. Test team-based access control
5. Verify host management within organizations

### 5. Deployment

1. Back up the database
2. Run migrations
3. Deploy updated application code
4. Verify functionality in production environment

### 6. Rollback Plan

1. Keep backup of pre-migration database
2. Prepare rollback migration script
3. Test rollback procedure in staging environment

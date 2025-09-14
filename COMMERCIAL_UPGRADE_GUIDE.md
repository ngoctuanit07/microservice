# Commercial Version Upgrade Guide

## Overview

This guide will walk you through the process of upgrading your application from the basic version to the commercial version. The commercial version includes:

1. Multi-tenant architecture with Organizations
2. Team-based access control
3. Subscription management with Stripe integration
4. Enhanced security and audit features

## Prerequisites

Before starting the upgrade, ensure you have:

- Backed up your database
- Committed all changes to version control
- Updated all dependencies with `npm install`
- Stopped the application

## Step 1: Run the Migration Script

```bash
# Navigate to the backend directory
cd backend

# Run the migration script
npm run migrate:commercial
```

This script will:
1. Back up your current schema.prisma
2. Replace it with the commercial version schema
3. Generate and execute the database migration

## Step 2: Update Frontend Routes

Update your frontend routes to include the new commercial features:

```tsx
// In router.tsx
import OrganizationDashboard from './pages/organization/OrganizationDashboard';
import CreateOrganization from './pages/organization/CreateOrganization';
import OrganizationMembers from './pages/organization/OrganizationMembers';
import SubscriptionManagement from './pages/subscription/SubscriptionManagement';
import SubscriptionSuccess from './pages/subscription/SubscriptionSuccess';

// Add these routes
{
  path: 'organization',
  element: <PrivateRoute><OrganizationDashboard /></PrivateRoute>
},
{
  path: 'organization/create',
  element: <PrivateRoute><CreateOrganization /></PrivateRoute>
},
{
  path: 'organization/members',
  element: <PrivateRoute><OrganizationMembers /></PrivateRoute>
},
{
  path: 'subscription',
  element: <PrivateRoute><SubscriptionManagement /></PrivateRoute>
},
{
  path: 'subscription/success',
  element: <PrivateRoute><SubscriptionSuccess /></PrivateRoute>
}
```

## Step 3: Configure Environment Variables

Add the following environment variables to your .env file:

```
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Subscription Plans (IDs from Stripe)
STRIPE_PLAN_BASIC=price_...
STRIPE_PLAN_PRO=price_...
STRIPE_PLAN_ENTERPRISE=price_...
```

## Step 4: Install Required Packages

```bash
# Backend dependencies
cd backend
npm install stripe @nestjs/schedule

# Frontend dependencies
cd ../frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## Step 5: Update Services

After the migration, update the following services:

1. Organization Service
   - Update to work with the new schema
   - Implement proper organization CRUD

2. User Service
   - Update user model to work with organizations
   - Add organization membership management

3. Host Service
   - Update to support organization ownership
   - Implement team-based access control

4. Team Service
   - Ensure it works with the new schema

## Step 6: Migrate Existing Data

Run the data migration script to organize your existing users and hosts:

```bash
npm run migrate:data-commercial
```

This will:
1. Create default organizations for existing users
2. Associate existing hosts with their organizations
3. Setup appropriate permissions

## Step 7: Test the Upgrade

Test the following functionality:

1. User login and authentication
2. Organization management
   - Creating organizations
   - Managing organization members
   - Organization settings
3. Team management
   - Creating teams
   - Adding members to teams
   - Team permissions
4. Host management within organizations
5. Subscription features
   - Choosing a plan
   - Payment processing
   - Plan limitations

## Step 8: Deploy the Commercial Version

Once testing is complete:

1. Deploy the updated backend
2. Deploy the updated frontend
3. Monitor logs for any issues

## Rollback Plan

If issues are encountered:

1. Restore the database backup
2. Roll back code changes
3. Revert to the previous schema

## Support

For assistance with the upgrade process, please contact:
support@example.com

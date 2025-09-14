# Commercial Upgrade Test Plan

## Overview
This test plan outlines the steps to validate the successful upgrade from the basic version to the commercial version of the application. It covers functionality testing, data migration verification, and performance checks.

## Test Environment
- **Environment**: Staging/Test
- **Database**: Copy of production database with migration applied
- **Backend**: Commercial version of the API
- **Frontend**: Commercial version of the web application

## Pre-Upgrade Tests
Run these tests before performing the migration to establish a baseline:

1. **Authentication**
   - [ ] User login
   - [ ] JWT token generation and validation
   - [ ] Password reset functionality

2. **Host Management**
   - [ ] List all hosts
   - [ ] Create a new host
   - [ ] Edit host details
   - [ ] Delete a host

3. **User Management**
   - [ ] List all users
   - [ ] Create a new user
   - [ ] Edit user details
   - [ ] Delete a user

## Migration Tests
Tests to perform during the migration process:

1. **Schema Migration**
   - [ ] Run `npm run migrate:commercial` without errors
   - [ ] Verify all new tables are created in the database
   - [ ] Verify existing tables are properly modified

2. **Data Migration**
   - [ ] Run `npm run migrate:data-commercial` without errors
   - [ ] Verify organizations are created for all users
   - [ ] Verify hosts are associated with correct organizations
   - [ ] Verify free subscriptions are created for all organizations

## Post-Migration Functionality Tests

### 1. Authentication & Authorization
- [ ] User login still works
- [ ] Role-based access control works (admin vs regular users)
- [ ] Organization-based permissions work

### 2. Organization Management
- [ ] List organizations
- [ ] Create a new organization
- [ ] Update organization details
- [ ] Delete an organization
- [ ] Add users to an organization
- [ ] Remove users from an organization
- [ ] Change user roles within an organization

### 3. Team Management
- [ ] List teams within an organization
- [ ] Create a new team
- [ ] Update team details
- [ ] Delete a team
- [ ] Add users to a team
- [ ] Remove users from a team
- [ ] Assign hosts to a team
- [ ] Remove hosts from a team

### 4. Host Management (Commercial)
- [ ] List hosts within an organization
- [ ] Create a new host within an organization
- [ ] Edit host details
- [ ] Delete a host
- [ ] Transfer host between teams
- [ ] Host access respects team permissions

### 5. Subscription Management
- [ ] View current subscription
- [ ] Change subscription plan
- [ ] Process payment
- [ ] View payment history
- [ ] View/update payment methods
- [ ] Cancel subscription
- [ ] Verify subscription limits (hosts, users, features)

### 6. UI/UX Testing
- [ ] Organization selector works
- [ ] Team selector works
- [ ] Commercial navigation items appear correctly
- [ ] Plan features are correctly displayed
- [ ] Responsive design works on mobile devices

### 7. API Testing
- [ ] All commercial API endpoints return correct responses
- [ ] Error handling works properly
- [ ] Rate limiting works correctly
- [ ] CORS settings work correctly

## Performance Tests
- [ ] Application load time with commercial features
- [ ] Response time for organization operations
- [ ] Response time for team operations
- [ ] Database query performance with new schema

## Security Tests
- [ ] Organization data isolation works correctly
- [ ] Users cannot access other organizations' data
- [ ] API endpoints properly validate permissions
- [ ] Subscription data is properly secured

## Recovery Test
- [ ] Verify rollback procedure works by restoring from backup
- [ ] Application functions correctly after rollback

## Test Reporting
Document any issues found during testing using the following format:

**Issue Title**:
- **Severity**: (Critical, High, Medium, Low)
- **Description**:
- **Steps to Reproduce**:
- **Expected Result**:
- **Actual Result**:
- **Screenshots/Logs**:

## Sign-Off
The commercial upgrade is ready for production deployment when all critical and high-severity issues are resolved, and at least 90% of all test cases pass.

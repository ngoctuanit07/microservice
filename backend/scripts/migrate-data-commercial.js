#!/usr/bin/env node

/**
 * Commercial Data Migration Script
 * 
 * This script migrates existing data to work with the new commercial schema:
 * 1. Creates default organizations for users without one
 * 2. Associates existing hosts with their organizations
 * 3. Sets appropriate permissions
 * 
 * Usage: 
 *   npm run migrate:data-commercial
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');
const crypto = require('crypto');

// Initialize Prisma client
const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate a slug from a string
function generateSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Add random suffix to ensure uniqueness
function ensureUniqueSlug(slug) {
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `${slug}-${randomSuffix}`;
}

async function confirmAction(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function migrateData() {
  console.log('📋 Commercial Data Migration');
  console.log('============================');
  
  // Confirm action
  const confirmed = await confirmAction('⚠️  This will migrate your data to the commercial structure. Make sure you have a backup. Continue?');
  if (!confirmed) {
    console.log('Migration cancelled.');
    rl.close();
    process.exit(0);
  }

  try {
    // 1. Get all users without organizations
    console.log('🔍 Finding users without organizations...');
    const users = await prisma.user.findMany({
      where: {
        organizationId: null
      }
    });
    
    console.log(`Found ${users.length} users without organizations.`);

    // 2. Create organizations for each user
    console.log('🏢 Creating default organizations...');
    for (const user of users) {
      const orgName = `${user.name || user.email}'s Organization`;
      // Create organization
      const organization = await prisma.organization.create({
        data: {
          name: orgName,
          ownerId: user.id
        }
      });
      
      
      
      console.log(`✅ Created organization "${orgName}" for user ${user.email}`);
    }
    
    // 3. Associate hosts with organizations
    console.log('🖥️ Associating hosts with organizations...');
    const hosts = await prisma.host.findMany({
      where: {
        organizationId: null
      },
      include: {
        user: true
      }
    });
    
    console.log(`Found ${hosts.length} hosts without organizations.`);
    
    for (const host of hosts) {
      // Find user's organization
      const userOrg = await prisma.organizationMember.findFirst({
        where: {
          userId: host.userId
        },
        include: {
          organization: true
        }
      });
      
      if (userOrg) {
        // Update host with organization
        await prisma.host.update({
          where: {
            id: host.id
          },
          data: {
            orgId: userOrg.organizationId
          }
        });
        
        console.log(`✅ Associated host ID ${host.id} with organization "${userOrg.organization.name}"`);
      } else {
        console.log(`⚠️ Could not find organization for host ID ${host.id} - skipping`);
      }
    }
    
    console.log('\n🎉 Data migration completed successfully!');
    console.log('\n🔍 Post-migration summary:');
    
    const orgCount = await prisma.organization.count();
    const userCount = await prisma.user.count();
    const hostedHostCount = await prisma.host.count({
      where: {
        organizationId: { not: null }
      }
    });
    
    console.log(`- Organizations: ${orgCount}`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Hosts associated with organizations: ${hostedHostCount}`);
    
  } catch (error) {
    console.error('❌ Error during data migration:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run migration
migrateData();

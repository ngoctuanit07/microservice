#!/usr/bin/env node

/**
 * Commercial Schema Migration Script
 * 
 * This script performs the schema migration from the basic version to the commercial version.
 * It copies the schema-update.prisma to schema.prisma and runs the migration.
 * 
 * Usage: 
 *   npm run migrate:commercial
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Paths
const BASE_DIR = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(BASE_DIR, 'src', 'prisma', 'schema.prisma');
const SCHEMA_UPDATE_PATH = path.join(BASE_DIR, 'src', 'prisma', 'schema-update.prisma');
const BACKUP_PATH = path.join(BASE_DIR, 'src', 'prisma', 'schema.prisma.bak');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function confirmAction(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function run() {
  console.log('📋 Commercial Schema Migration Script');
  console.log('====================================');
  
  // Check if files exist
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error('❌ Error: schema.prisma not found!');
    process.exit(1);
  }
  
  if (!fs.existsSync(SCHEMA_UPDATE_PATH)) {
    console.error('❌ Error: schema-update.prisma not found!');
    process.exit(1);
  }
  
  // Confirm action
  const confirmed = await confirmAction('⚠️  This will update your database schema to the commercial version. Make sure you have a backup. Continue?');
  if (!confirmed) {
    console.log('Operation cancelled.');
    rl.close();
    process.exit(0);
  }

  try {
    // Backup the original schema
    console.log('📦 Backing up original schema...');
    fs.copyFileSync(SCHEMA_PATH, BACKUP_PATH);
    console.log('✅ Schema backup created at ' + BACKUP_PATH);

    // Copy the update schema to the main schema
    console.log('🔄 Copying new schema...');
    fs.copyFileSync(SCHEMA_UPDATE_PATH, SCHEMA_PATH);
    console.log('✅ Schema updated');

    // Generate migration
    console.log('⚡ Generating migration...');
    const migrationName = 'commercial_upgrade';
    execSync(`npx prisma migrate dev --name ${migrationName}`, { 
      stdio: 'inherit',
      cwd: BASE_DIR
    });
    
    console.log('✅ Migration complete!');
    console.log('\n🎉 Your database has been upgraded to the commercial version.');
    console.log('\n⚠️  Remember to update your services to use the new schema.');
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    
    // Ask if we should restore the backup
    const shouldRestore = await confirmAction('Would you like to restore the original schema?');
    if (shouldRestore && fs.existsSync(BACKUP_PATH)) {
      console.log('🔄 Restoring original schema...');
      fs.copyFileSync(BACKUP_PATH, SCHEMA_PATH);
      console.log('✅ Original schema restored');
    }
  } finally {
    rl.close();
  }
}

run();

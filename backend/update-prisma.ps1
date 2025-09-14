# Run this script to update the database schema and regenerate the Prisma client

# Force Prisma to generate the client from scratch
Write-Host "Deleting the existing Prisma client..."
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue ./node_modules/.prisma

# Generate a new migration
Write-Host "Generating new migration for role-permission schema..."
npx prisma migrate dev --name role_permission_relationships

# Generate the Prisma client
Write-Host "Generating Prisma client..."
npx prisma generate

Write-Host "Migration and client generation completed"
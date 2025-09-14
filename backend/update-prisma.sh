# Run this script to update the database schema and regenerate the Prisma client

# Force Prisma to generate the client from scratch
echo "Deleting the existing Prisma client..."
rm -rf ./node_modules/.prisma

# Generate a new migration
echo "Generating new migration for role-permission schema..."
npx prisma migrate dev --name role_permission_relationships

# Generate the Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "Migration and client generation completed"
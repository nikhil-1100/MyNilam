import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'
import process from 'node:process'

const prisma = new PrismaClient()

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,
  parallelism: 1,
}

async function main() {
  console.log('🌱  Starting database seeding with updated developer test data...')

  // Clear existing records
  await prisma.authUserOTP.deleteMany()
  await prisma.authRefreshToken.deleteMany()
  await prisma.authUserProfile.deleteMany()
  await prisma.authUser.deleteMany()
  await prisma.hostelPricing.deleteMany()
  await prisma.hostel.deleteMany()
  await prisma.listListing.deleteMany()
  await prisma.listCategory.deleteMany()

  console.log('🧹  Cleared existing auth and listing database records')

  const hashedPassword = await argon2.hash('password', ARGON2_OPTIONS)

  // =============================================================================
  // CREATE USERS
  // =============================================================================
  console.log('👤  Creating developer test users...')

  // 1. Normal User
  await prisma.authUser.create({
    data: {
      email: 'normal@rentel.com',
      password_hash: hashedPassword,
      role: 'NORMAL',
      is_active: true,
      is_deleted: false,
      profile: {
        create: {
          display_name: 'Normal User',
          phone_number: '+919999999999',
          email_confirmed: true,
        }
      }
    }
  })

  // Create Hostel Category
  const hostelCategory = await prisma.listCategory.upsert({
    where: { slug: 'hostel' },
    update: {},
    create: {
      name: 'Hostel',
      slug: 'hostel',
      listing_type: 'HOSTEL',
      is_active: true,
    }
  })

  // 2. Hostel Admin
  const hostelAdmin = await prisma.authUser.create({
    data: {
      email: 'hostel@rentel.com',
      password_hash: hashedPassword,
      role: 'HOSTEL_ADMIN',
      is_active: true,
      is_deleted: false,
      profile: {
        create: {
          display_name: 'Nest Hostel Admin',
          phone_number: '+918888888888',
          email_confirmed: true,
        }
      }
    }
  })

  // Create Listing for Nest Hostel
  const hostelListing = await prisma.listListing.create({
    data: {
      user_id: hostelAdmin.id,
      category_id: hostelCategory.id,
      title: 'Nest Hostel',
      slug: 'nest-hostel',
      purpose: 'RENT',
      price: 150.00,
      status: 'Published',
      is_published: true,
      is_active: true,
      description: 'Premium student and working professional hostel in prime location with modern amenities.',
    }
  })

  // Create Hostel config linked to Listing
  const hostelDetails = await prisma.hostel.create({
    data: {
      property_id: hostelListing.id,
      name: 'Nest Hostel',
      total_bed_spaces: 50,
      total_rooms: 20,
      bathroom_count: 10,
      attached_bathrooms: true,
      vacant_beds: 12,
      vacant_rooms: 4,
    }
  })

  // Associate Hostel to Admin
  await prisma.authUser.update({
    where: { id: hostelAdmin.id },
    data: {
      assigned_hostel_id: hostelDetails.id
    }
  })

  // Add default pricing configurations
  await prisma.hostelPricing.createMany({
    data: [
      { hostel_id: hostelDetails.id, share_type: 'SINGLE', price: 250.00 },
      { hostel_id: hostelDetails.id, share_type: 'DOUBLE', price: 180.00 },
      { hostel_id: hostelDetails.id, share_type: 'TRIPLE', price: 130.00 },
    ]
  })

  // 3. Employee
  await prisma.authUser.create({
    data: {
      email: 'employee@rentel.com',
      password_hash: hashedPassword,
      role: 'EMPLOYEE',
      is_active: true,
      is_deleted: false,
      profile: {
        create: {
          display_name: 'Employee User',
          phone_number: '+917777777777',
          email_confirmed: true,
        }
      }
    }
  })

  // 4. Super Admin
  await prisma.authUser.create({
    data: {
      email: 'admin@rentel.com',
      password_hash: hashedPassword,
      role: 'SUPER_ADMIN',
      is_active: true,
      is_deleted: false,
      profile: {
        create: {
          display_name: 'Super Admin',
          phone_number: '+916666666666',
          email_confirmed: true,
        }
      }
    }
  })

  console.log('✅  Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌  Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

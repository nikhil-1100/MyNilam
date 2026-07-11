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

  console.log('🧹  Cleared existing auth database records')

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

  // 2. Hostel Admin
  await prisma.authUser.create({
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

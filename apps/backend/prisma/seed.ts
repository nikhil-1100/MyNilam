/// <reference types="node" />
import { PrismaClient, UserRole, PropertyType, ListingType, PropertyStatus, GenderType, SharingOccupancy, GenderPreference, InquiryStatus, VisitStatus } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,
  parallelism: 1,
}

async function main() {
  console.log('🌱  Starting database seeding with rich developer test data...')

  // Clear existing records in correct order to avoid constraint violations
  await prisma.visit.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.review.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.propertyView.deleteMany()
  await prisma.propertyVideo.deleteMany()
  await prisma.propertyImage.deleteMany()
  await prisma.hostelPricing.deleteMany()
  await prisma.hostel.deleteMany()
  await prisma.property.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹  Cleared existing database records')

  const hashedPassword = await argon2.hash('password', ARGON2_OPTIONS)

  // =============================================================================
  // 1. CREATE USERS
  // =============================================================================
  console.log('👤  Creating developer test users...')

  const normalUser = await prisma.user.create({
    data: {
      email: 'normal@rentel.com',
      password_hash: hashedPassword,
      full_name: 'Normal User',
      phone: '+91 99999 99999',
      role: UserRole.NORMAL,
      email_verified: true,
    }
  })

  const hostelAdmin = await prisma.user.create({
    data: {
      email: 'hostel@rentel.com',
      password_hash: hashedPassword,
      full_name: 'Nest Hostel Admin',
      phone: '+91 88888 88888',
      role: UserRole.HOSTEL_ADMIN,
      email_verified: true,
    }
  })

  const employeeUser = await prisma.user.create({
    data: {
      email: 'employee@rentel.com',
      password_hash: hashedPassword,
      full_name: 'Employee User',
      phone: '+91 77777 77777',
      role: UserRole.EMPLOYEE,
      email_verified: true,
    }
  })

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@rentel.com',
      password_hash: hashedPassword,
      full_name: 'Super Admin',
      phone: '+91 66666 66666',
      role: UserRole.SUPER_ADMIN,
      email_verified: true,
    }
  })

  // Additional mock users to serve as reviewers, inquiries, and buyers
  const mockUser1 = await prisma.user.create({
    data: {
      email: 'amit@example.com',
      password_hash: hashedPassword,
      full_name: 'Amit Sharma',
      phone: '+91 98765 43210',
      role: UserRole.NORMAL,
      email_verified: true,
    }
  })

  const mockUser2 = await prisma.user.create({
    data: {
      email: 'priya@example.com',
      password_hash: hashedPassword,
      full_name: 'Priya Patel',
      phone: '+91 98123 45678',
      role: UserRole.NORMAL,
      email_verified: true,
    }
  })

  console.log('✅  Developer test users created')

  // =============================================================================
  // 2. CREATE USER PROFILES
  // =============================================================================
  console.log('📝  Creating user profiles...')
  await prisma.userProfile.create({
    data: {
      user_id: normalUser.id,
      bio: 'Software engineer at a tech startup. Loves clean spaces and quiet neighborhoods.',
      preferred_locations: ['Indiranagar', 'Koramangala', 'HSR Layout'],
      budget_min: 8000,
      budget_max: 25000,
      property_types: [PropertyType.FLAT, PropertyType.PG],
    }
  })

  await prisma.userProfile.create({
    data: {
      user_id: mockUser1.id,
      bio: 'Moving to Bangalore for work. Looking for roommate options or PG bookings.',
      preferred_locations: ['Whitefield', 'Marathahalli'],
      budget_min: 5000,
      budget_max: 15000,
      property_types: [PropertyType.PG, PropertyType.HOSTEL, PropertyType.FLAT],
    }
  })

  await prisma.userProfile.create({
    data: {
      user_id: mockUser2.id,
      bio: 'Product Designer. Clean, friendly, and looking for sharing options.',
      preferred_locations: ['Indiranagar', 'HSR Layout'],
      budget_min: 10000,
      budget_max: 30000,
      property_types: [PropertyType.FLAT, PropertyType.PG],
    }
  })

  // =============================================================================
  // 3. CREATE PROPERTIES
  // =============================================================================
  console.log('🏠  Creating rich property listings...')

  // Property 1: Indiranagar 2BHK Flat
  const p1 = await prisma.property.create({
    data: {
      title: 'Cozy 2 BHK Flat near Metro Station',
      description: 'Well-ventilated and fully furnished 2 BHK apartment in a premium location in Indiranagar. Features modular kitchen, spacious balcony, secure gated entry, and proximity to major restaurants and supermarkets.',
      price: 24000,
      property_type: PropertyType.FLAT,
      listing_type: ListingType.RENT,
      bedrooms: 2,
      bathrooms: 2,
      area_sqft: 1200,
      address: '12th Main Rd, Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      zip_code: '560038',
      latitude: 12.971898,
      longitude: 77.641151,
      status: PropertyStatus.PUBLISHED,
      is_published: true,
      is_featured: true,
      user_id: normalUser.id,
      is_furnished: true,
      furniture_list: ['Sofa', 'Dining Table', 'King Bed', 'Single Bed', '2 Wardrobes', 'Refrigerator', 'Geyser'],
      water_source: 'Municipal & Borewell',
      power_backup: 'Generator backup for lifts & common area',
      parking: 'Covered Car Parking',
      gated_community: true,
      security_features: ['24/7 Security Guard', 'CCTV Cameras', 'Intercom'],
      preferred_tenant: 'Families or Working Professionals',
    }
  })

  // Property 2: Luxury Koramangala Penthouse
  const p2 = await prisma.property.create({
    data: {
      title: 'Luxury 3 BHK Penthouse with Private Terrace',
      description: 'Exclusive 3 BHK penthouse located in Koramangala 3rd Block. Private terrace garden, state-of-the-art bathrooms, double-door refrigerator, modular wardrobes, and floor-to-ceiling glass windows offering beautiful sunset views.',
      price: 55000,
      property_type: PropertyType.FLAT,
      listing_type: ListingType.RENT,
      bedrooms: 3,
      bathrooms: 3,
      area_sqft: 2200,
      address: '4th Cross Rd, Koramangala 3rd Block',
      city: 'Bangalore',
      state: 'Karnataka',
      zip_code: '560034',
      latitude: 12.930491,
      longitude: 77.622432,
      status: PropertyStatus.PUBLISHED,
      is_published: true,
      is_featured: true,
      user_id: normalUser.id,
      is_furnished: true,
      furniture_list: ['Premium L-shaped Sofa', '6-Seater Marble Dining Table', '3 King Beds', 'Modular Kitchen with chimney', 'Washing Machine', 'Smart TV'],
      water_source: 'Cauvery Water',
      power_backup: '100% Power Backup',
      parking: '2 Covered Car Spaces',
      gated_community: true,
      security_features: ['Smart Door Lock', 'Video Door Phone', '24/7 Security Patrol'],
      preferred_tenant: 'Corporate Executives or Families',
    }
  })

  // Property 3: Whitefield 4BHK Villa for Sale
  const p3 = await prisma.property.create({
    data: {
      title: 'Stunning 4 BHK Independent Villa for Sale',
      description: 'Modern architectural masterpiece. Spacious 4 BHK villa located in a premium gated villa community in Whitefield. Includes personal lawn, double-height ceiling in the living area, private study room, and modular kitchen.',
      price: 28500000, // 2.85 Crore
      property_type: PropertyType.HOUSE,
      listing_type: ListingType.SALE,
      bedrooms: 4,
      bathrooms: 4,
      area_sqft: 3800,
      address: 'ECC Road, near Outer Ring Road, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      zip_code: '560066',
      latitude: 12.978241,
      longitude: 77.749321,
      status: PropertyStatus.PUBLISHED,
      is_published: true,
      is_featured: true,
      user_id: normalUser.id,
      is_furnished: false,
      water_source: 'Borewell & Water Treatment Plant',
      power_backup: 'Individual UPS & Generator backup',
      parking: 'Private Garage (2 Cars)',
      gated_community: true,
      security_features: ['Electric Fencing', 'Biometric Access control', 'CCTV monitoring'],
    }
  })

  // Property 4: Shared Roommate Option in HSR Layout
  const p4 = await prisma.property.create({
    data: {
      title: 'Looking for Female Roommate in HSR Layout Sector 3',
      description: 'Looking for a friendly and clean female roommate to share a beautiful 2 BHK flat. You will get a private bedroom with an attached bathroom. The living room, kitchen, and balcony are shared. Close to gyms, cafes, and HSR Sector 3 park.',
      price: 12000,
      property_type: PropertyType.FLAT,
      listing_type: ListingType.ROOMMATE,
      bedrooms: 1, // Sharing space
      bathrooms: 1,
      area_sqft: 400,
      address: 'Sector 3, 24th Main Road, HSR Layout',
      city: 'Bangalore',
      state: 'Karnataka',
      zip_code: '560102',
      latitude: 12.910398,
      longitude: 77.645012,
      status: PropertyStatus.PUBLISHED,
      is_published: true,
      is_featured: false,
      user_id: normalUser.id,
      is_furnished: true,
      furniture_list: ['Washing Machine', 'Microwave', 'Wifi Router', 'Geyser', 'Bed & Mattress'],
      water_source: 'Borewell',
      power_backup: 'None',
      parking: 'Bike Parking Only',
      gated_community: false,
      preferred_tenant: 'Female student or working professional',
      preferred_gender: GenderPreference.FEMALE,
    }
  })

  // Property 5: Men's Premium Hostel (Managed by Hostel Admin)
  const p5 = await prisma.property.create({
    data: {
      title: 'Nest Men\'s Luxury Hostel & PG',
      description: 'Ultra-modern boys hostel/PG situated in Koramangala. Features dynamic pricing, high-speed Wi-Fi, attached restrooms, gym access, air conditioning, and full security. Includes 3 nutritious meals daily.',
      price: 8500, // base price
      property_type: PropertyType.HOSTEL,
      listing_type: ListingType.RENT,
      bedrooms: 20,
      bathrooms: 20,
      area_sqft: 6000,
      address: '223, 7th Block, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      zip_code: '560095',
      latitude: 12.935192,
      longitude: 77.624462,
      status: PropertyStatus.PUBLISHED,
      is_published: true,
      is_featured: true,
      user_id: hostelAdmin.id,
      total_rooms: 40,
    }
  })

  // Property 6: Girls Premium PG (Managed by Hostel Admin)
  const p6 = await prisma.property.create({
    data: {
      title: 'Nest Premium Girls Hostel & PG',
      description: 'Safe, premium Girls PG near Indiranagar Metro Station. Highly secure biometric access, CCTV monitoring, rooftop cafeteria, common lounge, housekeeping, and study room facilities.',
      price: 9000,
      property_type: PropertyType.PG,
      listing_type: ListingType.RENT,
      bedrooms: 15,
      bathrooms: 15,
      area_sqft: 4500,
      address: '45, 100 Feet Rd, Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      zip_code: '560008',
      latitude: 12.964921,
      longitude: 77.638291,
      status: PropertyStatus.PUBLISHED,
      is_published: true,
      is_featured: true,
      user_id: hostelAdmin.id,
      total_rooms: 30,
    }
  })

  // Property 7: Commercial Plot for Sale
  const p7 = await prisma.property.create({
    data: {
      title: 'Prime Commercial Plot near Nandi Hills',
      description: 'Excellent investment opportunity. Corner commercial plot of 4000 sqft available for sale with clear titles, close to the upcoming airport expansion and Nandi Hills tourist zone.',
      price: 12000000, // 1.2 Crore
      property_type: PropertyType.PLOT,
      listing_type: ListingType.SALE,
      area_sqft: 4000,
      address: 'Nandi Hills Main Road, Devanahalli',
      city: 'Bangalore',
      state: 'Karnataka',
      zip_code: '562110',
      latitude: 13.370123,
      longitude: 77.680412,
      status: PropertyStatus.PUBLISHED,
      is_published: true,
      is_featured: false,
      user_id: normalUser.id,
    }
  })

  // Property 8: Office Space in MG Road
  const p8 = await prisma.property.create({
    data: {
      title: 'Fully Furnished Coworking Office Space',
      description: 'Plug-and-play office space on MG Road with 50 workstations, 2 conference rooms, high-speed fiber internet, central air conditioning, and receptionist desks.',
      price: 150000,
      property_type: PropertyType.COMMERCIAL,
      listing_type: ListingType.RENT,
      bedrooms: 0,
      bathrooms: 4,
      area_sqft: 3500,
      address: 'Trinity Circle, MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zip_code: '560001',
      latitude: 12.973412,
      longitude: 77.615219,
      status: PropertyStatus.PUBLISHED,
      is_published: true,
      is_featured: false,
      user_id: normalUser.id,
      is_furnished: true,
      water_source: 'Municipal Connection',
      power_backup: '100% Central Generator Backup',
      parking: '4 Reserved Car slots',
      security_features: ['Biometric Access Control', 'Fire Sprinklers', 'CCTV System'],
    }
  })

  console.log('✅  Property listings created')

  // =============================================================================
  // 4. PROPERTY IMAGES (CAROUSELS & COVERS)
  // =============================================================================
  console.log('🖼️  Adding cover and carousel photos to listings...')

  const imagesData = [
    // P1
    { property_id: p1.id, is_cover: true, url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', storage_path: 'p1_cover.jpg' },
    { property_id: p1.id, is_cover: false, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', storage_path: 'p1_img1.jpg' },
    { property_id: p1.id, is_cover: false, url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', storage_path: 'p1_img2.jpg' },

    // P2
    { property_id: p2.id, is_cover: true, url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', storage_path: 'p2_cover.jpg' },
    { property_id: p2.id, is_cover: false, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', storage_path: 'p2_img1.jpg' },
    { property_id: p2.id, is_cover: false, url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', storage_path: 'p2_img2.jpg' },

    // P3
    { property_id: p3.id, is_cover: true, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', storage_path: 'p3_cover.jpg' },
    { property_id: p3.id, is_cover: false, url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', storage_path: 'p3_img1.jpg' },

    // P4
    { property_id: p4.id, is_cover: true, url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800', storage_path: 'p4_cover.jpg' },
    
    // P5 (Men's Hostel)
    { property_id: p5.id, is_cover: true, url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', storage_path: 'p5_cover.jpg' },
    { property_id: p5.id, is_cover: false, url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', storage_path: 'p5_img1.jpg' },

    // P6 (Girls PG)
    { property_id: p6.id, is_cover: true, url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', storage_path: 'p6_cover.jpg' },
    { property_id: p6.id, is_cover: false, url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', storage_path: 'p6_img1.jpg' },

    // P7
    { property_id: p7.id, is_cover: true, url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', storage_path: 'p7_cover.jpg' },

    // P8
    { property_id: p8.id, is_cover: true, url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', storage_path: 'p8_cover.jpg' }
  ]

  for (const img of imagesData) {
    await prisma.propertyImage.create({ data: img })
  }

  console.log('✅  Photos successfully linked')

  // =============================================================================
  // 5. CONFIGURING HOSTELS & DYNAMIC PRICING CHARTS
  // =============================================================================
  console.log('⚙️  Configuring hostels and pricing scales...')

  // Hostel 1 (Men's - P5)
  const h1 = await prisma.hostel.create({
    data: {
      property_id: p5.id,
      name: 'Nest Men\'s Luxury Hostel',
      total_bed_spaces: 120,
      total_rooms: 40,
      bathroom_count: 20,
      attached_bathrooms: true,
      gender_type: GenderType.BOYS,
      wifi_enabled: true,
      wifi_speed: '150 Mbps',
      hot_water: true,
      water_filter: true,
      mess_food: true,
      laundry_enabled: true,
      ac_available: true,
      water_source: 'Cauvery & Borewell',
      vacant_beds: 15,
      vacant_rooms: 4,
      allowed_sharings: ['ONE', 'TWO', 'THREE', 'FOUR', 'DORM'],
    }
  })

  // Pricing scales for Men's Hostel
  const h1Pricing = [
    { share_type: SharingOccupancy.ONE, price: 15000 },
    { share_type: SharingOccupancy.TWO, price: 10000 },
    { share_type: SharingOccupancy.THREE, price: 8000 },
    { share_type: SharingOccupancy.FOUR, price: 6500 },
    { share_type: SharingOccupancy.DORM, price: 4500 },
  ]
  for (const item of h1Pricing) {
    await prisma.hostelPricing.create({
      data: {
        hostel_id: h1.id,
        share_type: item.share_type,
        price: item.price,
      }
    })
  }

  // Hostel 2 (Girls - P6)
  const h2 = await prisma.hostel.create({
    data: {
      property_id: p6.id,
      name: 'Nest Girls Premium PG',
      total_bed_spaces: 90,
      total_rooms: 30,
      bathroom_count: 15,
      attached_bathrooms: true,
      gender_type: GenderType.GIRLS,
      wifi_enabled: true,
      wifi_speed: '200 Mbps',
      hot_water: true,
      water_filter: true,
      mess_food: true,
      laundry_enabled: true,
      ac_available: false,
      water_source: 'Cauvery',
      vacant_beds: 22,
      vacant_rooms: 8,
      allowed_sharings: ['ONE', 'TWO', 'THREE'],
    }
  })

  // Pricing scales for Girls PG
  const h2Pricing = [
    { share_type: SharingOccupancy.ONE, price: 14000 },
    { share_type: SharingOccupancy.TWO, price: 9500 },
    { share_type: SharingOccupancy.THREE, price: 7500 },
  ]
  for (const item of h2Pricing) {
    await prisma.hostelPricing.create({
      data: {
        hostel_id: h2.id,
        share_type: item.share_type,
        price: item.price,
      }
    })
  }

  // Bind the Men's hostel config as the primary management console for our Hostel Admin user
  await prisma.user.update({
    where: { id: hostelAdmin.id },
    data: { assigned_hostel_id: h1.id }
  })

  console.log('✅  Hostels configured')

  // =============================================================================
  // 6. REVIEWS
  // =============================================================================
  console.log('⭐️  Writing review entries...')
  await prisma.review.create({
    data: {
      user_id: mockUser1.id,
      property_id: p1.id,
      rating: 5,
      comment: 'Excellent flat. Extremely neat and clean, right next to the metro station. Landlord was super helpful.'
    }
  })

  await prisma.review.create({
    data: {
      user_id: mockUser2.id,
      property_id: p1.id,
      rating: 4,
      comment: 'Great property. The neighborhood gets slightly noisy on weekends but the flat itself is fantastic.'
    }
  })

  await prisma.review.create({
    data: {
      user_id: mockUser2.id,
      property_id: p5.id,
      rating: 5,
      comment: 'Amazing amenities! Safe, comfortable rooms, high-speed internet, and very decent food.'
    }
  })

  console.log('✅  Reviews successfully populated')

  // =============================================================================
  // 7. INQUIRIES
  // =============================================================================
  console.log('📬  Seeding guest inquiries...')
  await prisma.inquiry.create({
    data: {
      user_id: mockUser1.id,
      property_id: p1.id,
      message: 'Hello, is this flat available for immediate rent? I would like to schedule a visit tomorrow.',
      status: InquiryStatus.PENDING,
    }
  })

  await prisma.inquiry.create({
    data: {
      user_id: mockUser2.id,
      property_id: p5.id,
      message: 'Hi, does the single room option have AC available? And can I pay the deposit in installments?',
      status: InquiryStatus.RESPONDED,
      response: 'Hi Priya, yes, AC is available in single sharing. Installment options are allowed for the safety deposit.',
      responded_by: hostelAdmin.id,
      responded_at: new Date(),
    }
  })

  console.log('✅  Inquiries successfully populated')

  // =============================================================================
  // 8. VISIT REQUESTS
  // =============================================================================
  console.log('📅  Booking site visit appointments...')
  
  // A requested visit for tomorrow
  const visitDate1 = new Date()
  visitDate1.setDate(visitDate1.getDate() + 1)
  visitDate1.setHours(11, 0, 0, 0)
  await prisma.visit.create({
    data: {
      user_id: mockUser1.id,
      property_id: p1.id,
      scheduled_at: visitDate1,
      status: VisitStatus.REQUESTED,
      notes: 'Would love to check out the water supply and room fittings.'
    }
  })

  // A confirmed visit for next weekend
  const visitDate2 = new Date()
  visitDate2.setDate(visitDate2.getDate() + 4)
  visitDate2.setHours(15, 30, 0, 0)
  await prisma.visit.create({
    data: {
      user_id: mockUser2.id,
      property_id: p5.id,
      scheduled_at: visitDate2,
      status: VisitStatus.CONFIRMED,
      notes: 'Coming with family to look at double sharing rooms.',
      owner_notes: 'Confirmed. Looking forward to welcoming you.'
    }
  })

  console.log('✅  Visits booked')
  console.log('🌱  Rich developer seeding successfully finished! Happy coding.')
}

main()
  .catch((e) => {
    console.error('❌  Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

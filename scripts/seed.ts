// Run this script using ts-node or similar.
// Ensure MONGODB_URI is set in your environment before running.

import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import path from 'path'
import { Product } from '../src/models/Product'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is missing from environment.')
  process.exit(1)
}

const dummyProducts = [
  {
    slug: 'oud-royale',
    name: 'Oud Royale',
    shortDescription: 'A majestic blend of aged Cambodian Oud, warm amber, and smoky incense.',
    description: 'Oud Royale is the crown jewel of our collection. Extracted from the rarest agarwood, this fragrance offers a deep, complex, and intoxicating aroma that lingers for hours. Perfect for evening wear and special occasions.',
    basePrice: 1250000, // ₹12,500
    fragranceFamily: 'Woody',
    topNotes: ['Saffron', 'Nutmeg', 'Lavender'],
    middleNotes: ['Agarwood (Oud)', 'Patchouli'],
    baseNotes: ['Musk', 'Amber', 'Vetiver'],
    longevity: '8+ hours',
    sillage: 'Enormous',
    inventoryPolicy: 'deny',
    trackInventory: true,
    categories: ['unisex', 'bestsellers', 'attar'],
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    variants: [
      { label: '50ml', sku: 'UMM-OUD-50', price: 1250000, stock: 15, isDefault: true },
      { label: '100ml', sku: 'UMM-OUD-100', price: 2100000, stock: 5, isDefault: false },
    ],
    images: [],
  },
  {
    slug: 'amber-whisper',
    name: 'Amber Whisper',
    shortDescription: 'A sensual and comforting embrace of golden amber and vanilla.',
    description: 'Amber Whisper wraps you in a warm, glowing aura. The sweetness of Madagascan vanilla perfectly balances the rich, resinous core of labdanum and benzoin.',
    basePrice: 850000, // ₹8,500
    fragranceFamily: 'Oriental',
    topNotes: ['Bergamot', 'Pink Pepper'],
    middleNotes: ['Amber', 'Vanilla'],
    baseNotes: ['Sandalwood', 'Tonka Bean'],
    longevity: '6-8 hours',
    sillage: 'Moderate',
    inventoryPolicy: 'deny',
    trackInventory: true,
    categories: ['women', 'bestsellers'],
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    variants: [
      { label: '50ml', sku: 'UMM-AMB-50', price: 850000, stock: 40, isDefault: true },
    ],
    images: [],
  },
  {
    slug: 'rose-noir',
    name: 'Rose Noir',
    shortDescription: 'A dark, velvety rose intertwined with spicy woods and patchouli.',
    description: 'Not your typical floral. Rose Noir takes the classic Damask rose and plunges it into shadows, surrounded by earthy spices and dark woods for a mysterious allure.',
    basePrice: 950000, // ₹9,500
    fragranceFamily: 'Floral',
    topNotes: ['Black Pepper', 'Plum'],
    middleNotes: ['Damask Rose', 'Patchouli'],
    baseNotes: ['Oud', 'Leather'],
    longevity: '8+ hours',
    sillage: 'Strong',
    inventoryPolicy: 'deny',
    trackInventory: true,
    categories: ['women', 'new-arrivals'],
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    variants: [
      { label: '50ml', sku: 'UMM-ROS-50', price: 950000, stock: 25, isDefault: true },
      { label: '100ml', sku: 'UMM-ROS-100', price: 1650000, stock: 10, isDefault: false },
    ],
    images: [],
  },
  {
    slug: 'citrus-vetiver',
    name: 'Citrus Vetiver',
    shortDescription: 'A crisp, energizing burst of Italian citrus grounded by earthy vetiver.',
    description: 'The ultimate daytime fragrance. Sharp, uplifting notes of lemon and bergamot smoothly transition into the dry, sophisticated warmth of Haitian vetiver.',
    basePrice: 750000, // ₹7,500
    fragranceFamily: 'Citrus',
    topNotes: ['Lemon', 'Bergamot', 'Grapefruit'],
    middleNotes: ['Neroli', 'Pink Pepper'],
    baseNotes: ['Haitian Vetiver', 'Cedarwood'],
    longevity: '4-6 hours',
    sillage: 'Moderate',
    inventoryPolicy: 'deny',
    trackInventory: true,
    categories: ['men'],
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    variants: [
      { label: '100ml', sku: 'UMM-CIT-100', price: 750000, stock: 50, isDefault: true },
    ],
    images: [],
  },
  {
    slug: 'midnight-musk',
    name: 'Midnight Musk',
    shortDescription: 'An intimate, skin-like musk that evolves uniquely on every wearer.',
    description: 'Midnight Musk is a deeply personal scent. It sits close to the skin, offering a clean, powdery yet subtly animalic presence that draws people in.',
    basePrice: 650000, // ₹6,500
    fragranceFamily: 'Woody',
    topNotes: ['Aldehydes', 'White Tea'],
    middleNotes: ['Iris', 'Jasmine'],
    baseNotes: ['White Musk', 'Ambrette Seed'],
    longevity: '6-8 hours',
    sillage: 'Intimate',
    inventoryPolicy: 'deny',
    trackInventory: true,
    categories: ['unisex'],
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    variants: [
      { label: '50ml', sku: 'UMM-MUS-50', price: 650000, stock: 100, isDefault: true },
    ],
    images: [],
  },
]

async function seed() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI!)
    console.log('Connected.')

    console.log('Clearing existing products...')
    await Product.deleteMany({})

    console.log('Inserting dummy products...')
    await Product.insertMany(dummyProducts)
    console.log('Successfully seeded database.')

  } catch (error) {
    console.error('Seeding error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB.')
    process.exit(0)
  }
}

seed()

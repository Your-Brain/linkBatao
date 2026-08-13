import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Collection from '../models/Collection.js';

dotenv.config();

const categories = [
  { name: 'Technology', slug: 'technology', description: 'Artificial Intelligence, gadgets, software & hardware news', icon: 'Cpu', order: 1 },
  { name: 'Programming', slug: 'programming', description: 'Web development, computer science, software engineering & tutorials', icon: 'Code', order: 2 },
  { name: 'Gaming', slug: 'gaming', description: 'Game trailers, eSports, game development & gaming community', icon: 'Gamepad2', order: 3 },
  { name: 'Education', slug: 'education', description: 'Science, history, mathematics, lectures & interactive learning', icon: 'GraduationCap', order: 4 },
  { name: 'Entertainment', slug: 'entertainment', description: 'Movies, TV shows, anime, comedy & internet culture', icon: 'Tv', order: 5 },
  { name: 'Music', slug: 'music', description: 'Music videos, tracks, audio production, podcasts & soundscapes', icon: 'Music', order: 6 },
  { name: 'Fashion', slug: 'fashion', description: 'Streetwear, high fashion, runway highlights, lookbooks & style guides', icon: 'Sparkles', order: 7 },
  { name: 'Sports', slug: 'sports', description: 'Highlights, athletics, fitness, eSports & sports commentary', icon: 'Trophy', order: 8 },
  { name: 'News', slug: 'news', description: 'World news, technology trends, investigative journalism & finance', icon: 'Newspaper', order: 9 },
  { name: 'Art', slug: 'art', description: 'Digital art, 3D design, photography, graphic design & creative works', icon: 'Palette', order: 10 },
  { name: 'Lifestyle', slug: 'lifestyle', description: 'Travel, architecture, wellness, culinary arts & minimalist living', icon: 'Compass', order: 11 },
  { name: 'Other', slug: 'other', description: 'Uncategorized resources, novelties & miscellaneous links', icon: 'Box', order: 12 }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing database collections...');
    await Category.deleteMany();
    await User.deleteMany();
    await Resource.deleteMany();
    await Collection.deleteMany();

    console.log('[Seed] Inserting default categories...');
    const createdCategories = await Category.insertMany(categories);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.slug] = c._id; });

    console.log('[Seed] Creating default Admin user...');
    const adminUser = await User.create({
      username: 'AuraAdmin',
      email: 'admin@auralink.io',
      passwordHash: 'admin123456',
      role: 'ADMIN',
      bio: 'Platform Moderator & System Administrator'
    });

    const demoUser = await User.create({
      username: 'CyberExplorer',
      email: 'user@auralink.io',
      passwordHash: 'user123456',
      role: 'USER',
      bio: 'Curator of dark futuristic web technologies and UI design'
    });

    console.log('[Seed] Inserting initial curated links and media resources...');
    const resourcesData = [
      {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        normalizedUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
        description: 'The iconic 1987 music video remastered in high definition.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        domain: 'youtube.com',
        resourceType: 'VIDEO',
        category: catMap['music'],
        tags: ['music', 'retro', '80s', 'classic', 'pop'],
        embedType: 'YOUTUBE',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        status: 'APPROVED',
        views: 1240,
        saves: 85,
        submittedBy: adminUser._id
      },
      {
        url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
        normalizedUrl: 'https://youtube.com/watch?v=bMknfKXIFA8',
        title: 'React 19 Complete Breakdown & Action Handlers',
        description: 'Comprehensive overview of React 19 features including Server Actions, useActionState, useOptimistic, and compiler updates.',
        thumbnail: 'https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg',
        domain: 'youtube.com',
        resourceType: 'VIDEO',
        category: catMap['programming'],
        tags: ['react', 'javascript', 'frontend', 'webdev', 'tutorial'],
        embedType: 'YOUTUBE',
        embedUrl: 'https://www.youtube.com/embed/bMknfKXIFA8',
        status: 'APPROVED',
        views: 890,
        saves: 142,
        submittedBy: demoUser._id
      },
      {
        url: 'https://vimeo.com/76979871',
        normalizedUrl: 'https://vimeo.com/76979871',
        title: 'The Third & The Seventh — Architectural Visualization Masterpiece',
        description: 'A full-CG animated short film illustrating architectural design and cinematic lighting aesthetics.',
        thumbnail: 'https://i.vimeocdn.com/video/454157865-df0eb8ea582531a89c43b95764d84f885e3a8fa6a83ff6e974e6efed9cf2e431-d_640',
        domain: 'vimeo.com',
        resourceType: 'VIDEO',
        category: catMap['art'],
        tags: ['architecture', '3d', 'vimeo', 'cinematic', 'cgi'],
        embedType: 'VIMEO',
        embedUrl: 'https://player.vimeo.com/video/76979871',
        status: 'APPROVED',
        views: 450,
        saves: 62,
        anonymousId: 'Anonymous #39A7F'
      },
      {
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        normalizedUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        title: 'MDN Web Docs — JavaScript Language Reference & Guides',
        description: 'The authoritative reference documentation for JavaScript standard built-in objects, syntax, and modern ECMAScript specifications.',
        thumbnail: 'https://developer.mozilla.org/mdn-social-share.png',
        domain: 'developer.mozilla.org',
        resourceType: 'WEBSITE',
        category: catMap['programming'],
        tags: ['javascript', 'mdn', 'documentation', 'reference', 'ecmascript'],
        embedType: 'NONE',
        embedUrl: '',
        status: 'APPROVED',
        views: 2100,
        saves: 310,
        submittedBy: adminUser._id
      },
      {
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        normalizedUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        title: 'Cyberpunk Futuristic Neon Circuit Architecture',
        description: 'High resolution digital artwork displaying glowing blue and purple microchip visual landscapes.',
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        domain: 'images.unsplash.com',
        resourceType: 'IMAGE',
        category: catMap['technology'],
        tags: ['cyberpunk', 'neon', 'circuit', 'wallpaper', 'future'],
        embedType: 'DIRECT_IMAGE',
        embedUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        status: 'APPROVED',
        views: 630,
        saves: 95,
        anonymousId: 'Anonymous #B811C'
      },
      {
        url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
        normalizedUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
        title: 'Never Enough — Synthwave & Chill Cyberpunk Soundtrack',
        description: 'Atmospheric lofi synthwave beats for coding, deep focus, and night riding.',
        thumbnail: 'https://i.scdn.co/image/ab67616d0000b273b060d4ff10e017688402ef70',
        domain: 'spotify.com',
        resourceType: 'AUDIO',
        category: catMap['music'],
        tags: ['synthwave', 'lofi', 'cyberpunk', 'chill', 'focus'],
        embedType: 'SPOTIFY',
        embedUrl: 'https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT',
        status: 'APPROVED',
        views: 380,
        saves: 49,
        submittedBy: demoUser._id
      }
    ];

    const createdResources = await Resource.insertMany(resourcesData);

    console.log('[Seed] Creating sample user Collection...');
    await Collection.create({
      ownerId: demoUser._id,
      name: 'Cyberpunk & Web Dev Essentials',
      description: 'Handpicked resources for modern React 19 engineering and futuristic UI design inspirations.',
      visibility: 'PUBLIC',
      items: [createdResources[1]._id, createdResources[3]._id, createdResources[4]._id]
    });

    console.log('[Seed] Database successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error(`[Seed Error] ${err.message}`);
    process.exit(1);
  }
};

seedData();

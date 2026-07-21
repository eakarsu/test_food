import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  const userEmail = process.env.SEED_USER_EMAIL;
  const userPassword = process.env.SEED_USER_PASSWORD;

  if (!adminEmail || !adminPassword || !userEmail || !userPassword) {
    throw new Error(
      'SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_USER_EMAIL, and SEED_USER_PASSWORD are required'
    );
  }

  // Clean existing data
  await prisma.file.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdmin = await bcrypt.hash(adminPassword, 12);
  const hashedUser = await bcrypt.hash(userPassword, 12);

  // Create 2 admins
  const admin1 = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedAdmin,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: 'admin2@example.com',
      password: hashedAdmin,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  // Create 15 regular users
  const users = [];
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia', 'Kevin', 'Laura', 'Michael', 'Nina', 'Oscar'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];

  for (let i = 0; i < 15; i++) {
    const user = await prisma.user.create({
      data: {
        email: i === 0 ? userEmail : `user${i + 1}@example.test`,
        password: hashedUser,
        firstName: firstNames[i],
        lastName: lastNames[i],
        role: Role.USER,
        emailVerified: i < 10, // first 10 verified
      },
    });
    users.push(user);
  }

  console.log(`Created ${2 + users.length} users`);

  // Create 20 posts
  const postData = [
    { title: 'Getting Started with React', content: 'React is a popular JavaScript library for building user interfaces. In this post, we explore the fundamentals of React including components, props, and state management. React uses a virtual DOM to efficiently update the UI, making it fast and responsive.', published: true },
    { title: 'Understanding TypeScript Generics', content: 'TypeScript generics provide a way to create reusable components that can work with different types. This powerful feature allows you to write type-safe code while maintaining flexibility. Learn how to use generic functions, classes, and interfaces.', published: true },
    { title: 'Building REST APIs with Express', content: 'Express.js is a minimal and flexible Node.js web application framework. In this guide, we cover routing, middleware, error handling, and best practices for building production-ready REST APIs.', published: true },
    { title: 'Prisma ORM Deep Dive', content: 'Prisma is a next-generation ORM that makes database access easy and type-safe. Learn about schema modeling, migrations, queries, and how Prisma generates a fully typed client for your database.', published: true },
    { title: 'Tailwind CSS Tips and Tricks', content: 'Tailwind CSS is a utility-first CSS framework that allows you to build custom designs quickly. Discover advanced techniques like creating custom plugins, using JIT mode, and optimizing for production.', published: true },
    { title: 'Authentication Best Practices', content: 'Security is paramount in modern web applications. This post covers JWT tokens, session management, password hashing, OAuth integration, and common security pitfalls to avoid.', published: true },
    { title: 'React Query for Server State', content: 'React Query simplifies data fetching, caching, and synchronization in React apps. Learn how to use queries, mutations, pagination, and optimistic updates to build responsive applications.', published: true },
    { title: 'PostgreSQL Performance Tuning', content: 'Learn how to optimize your PostgreSQL database for better performance. Topics include indexing strategies, query optimization, connection pooling, and monitoring tools.', published: true },
    { title: 'Docker for Development', content: 'Docker containers provide consistent development environments. This guide covers Dockerfile creation, docker-compose for multi-service apps, volume mounting, and debugging containers.', published: false },
    { title: 'CI/CD with GitHub Actions', content: 'Automate your development workflow with GitHub Actions. Learn how to set up continuous integration, run tests, build artifacts, and deploy applications automatically.', published: false },
    { title: 'State Management in React', content: 'Explore different state management solutions for React applications including Context API, Zustand, Redux Toolkit, and Jotai. Compare their trade-offs and find the right fit for your project.', published: true },
    { title: 'Web Security Fundamentals', content: 'Understanding web security is essential for every developer. Learn about XSS, CSRF, SQL injection, content security policy, CORS, and how to protect your applications.', published: true },
    { title: 'Testing React Components', content: 'Write reliable tests for your React components using Jest and React Testing Library. Cover unit tests, integration tests, mocking, and testing async operations.', published: true },
    { title: 'Node.js Best Practices', content: 'Follow industry best practices for Node.js development including error handling, logging, project structure, environment configuration, and performance optimization.', published: true },
    { title: 'Responsive Design Patterns', content: 'Build websites that work beautifully on all devices. Learn about media queries, flexible grids, responsive images, mobile-first design, and common responsive patterns.', published: true },
    { title: 'GraphQL vs REST', content: 'Compare GraphQL and REST API architectures. Understand when to use each approach, their strengths and weaknesses, and how to implement them in real-world applications.', published: false },
    { title: 'Microservices Architecture', content: 'Explore the microservices architectural pattern. Learn about service decomposition, communication patterns, data management, and the challenges of distributed systems.', published: true },
    { title: 'Frontend Performance Optimization', content: 'Optimize your frontend for speed. Topics include code splitting, lazy loading, image optimization, caching strategies, and measuring performance metrics.', published: true },
    { title: 'Database Migrations Guide', content: 'Master database migrations for safe schema evolution. Learn migration strategies, rollback procedures, seed data management, and team collaboration workflows.', published: false },
    { title: 'Deploying to Production', content: 'A comprehensive guide to deploying web applications. Covers cloud providers, containerization, load balancing, SSL certificates, monitoring, and zero-downtime deployments.', published: true },
  ];

  const allUsers = [admin1, admin2, ...users];

  for (let i = 0; i < postData.length; i++) {
    const author = allUsers[i % allUsers.length];
    const slug = postData[i].title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await prisma.post.create({
      data: {
        title: postData[i].title,
        content: postData[i].content,
        excerpt: postData[i].content.substring(0, 100) + '...',
        slug,
        published: postData[i].published,
        authorId: author.id,
      },
    });
  }

  console.log(`Created ${postData.length} posts`);

  // Create 18 file records (metadata only, no actual files)
  const fileData = [
    { originalName: 'profile-photo.jpg', mimetype: 'image/jpeg', size: 245000 },
    { originalName: 'report-2024.pdf', mimetype: 'application/pdf', size: 1200000 },
    { originalName: 'meeting-notes.txt', mimetype: 'text/plain', size: 3500 },
    { originalName: 'logo-design.png', mimetype: 'image/png', size: 520000 },
    { originalName: 'data-export.csv', mimetype: 'text/plain', size: 89000 },
    { originalName: 'presentation.pdf', mimetype: 'application/pdf', size: 3400000 },
    { originalName: 'banner-image.jpg', mimetype: 'image/jpeg', size: 780000 },
    { originalName: 'user-guide.pdf', mimetype: 'application/pdf', size: 2100000 },
    { originalName: 'team-photo.png', mimetype: 'image/png', size: 1500000 },
    { originalName: 'invoice-001.pdf', mimetype: 'application/pdf', size: 450000 },
    { originalName: 'screenshot.png', mimetype: 'image/png', size: 320000 },
    { originalName: 'readme.txt', mimetype: 'text/plain', size: 2800 },
    { originalName: 'product-image.jpg', mimetype: 'image/jpeg', size: 650000 },
    { originalName: 'analytics-report.pdf', mimetype: 'application/pdf', size: 1800000 },
    { originalName: 'avatar.png', mimetype: 'image/png', size: 95000 },
    { originalName: 'contract.pdf', mimetype: 'application/pdf', size: 560000 },
    { originalName: 'background.jpg', mimetype: 'image/jpeg', size: 1100000 },
    { originalName: 'notes.txt', mimetype: 'text/plain', size: 1500 },
  ];

  for (let i = 0; i < fileData.length; i++) {
    const uploader = allUsers[i % allUsers.length];
    const filename = `file-${Date.now()}-${i}${fileData[i].originalName.substring(fileData[i].originalName.lastIndexOf('.'))}`;

    await prisma.file.create({
      data: {
        filename,
        originalName: fileData[i].originalName,
        mimetype: fileData[i].mimetype,
        size: fileData[i].size,
        path: `uploads/${filename}`,
        userId: uploader.id,
      },
    });
  }

  console.log(`Created ${fileData.length} files`);
  console.log('\nSeed completed!');
  console.log(`Seeded admin account: ${adminEmail}`);
  console.log(`Seeded user account: ${userEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

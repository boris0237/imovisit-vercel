// import { PrismaClient } from "@prisma/client";

// declare global {
//   var prisma: PrismaClient | undefined;
// }

// export const prisma =
//   global.prisma ??
//   new PrismaClient({
//     log: ["query", "warn", "error"], // pour déboguer
//   });

// if (process.env.NODE_ENV !== "production") global.prisma = prisma;


import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
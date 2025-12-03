import { PrismaClient } from "@prisma/client";
import config from "./env";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (config.isDevelopment) globalThis.prismaGlobal = prisma;

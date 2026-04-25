const { PrismaClient } = require('@prisma/client');
const abstractTransport = require('pino-abstract-transport');

// Singleton instance to prevent multiple client creations in the worker
let prisma;

module.exports = async function (opts) {
  if (!prisma) {
    prisma = new PrismaClient();
  }

  return abstractTransport(async function (source) {
    for await (let obj of source) {
      try {
        await prisma.systemLog.create({
          data: {
            level: obj.level ? String(obj.level) : 'info',
            message: obj.msg || obj.message || 'no message',
            context: obj.context ? JSON.stringify(obj.context) : null,
            stack: obj.err ? obj.err.stack : (obj.stack || null),
            timestamp: obj.time ? new Date(obj.time) : new Date(),
          },
        });
      } catch (err) {
        console.error('Failed to write log to database', err);
      }
    }
  }, {
    async close() {
      if (prisma) {
        await prisma.$disconnect();
        prisma = null;
      }
    }
  });
};

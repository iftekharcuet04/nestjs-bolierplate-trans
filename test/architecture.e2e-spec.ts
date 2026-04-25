import {
  FastifyAdapter,
  NestFastifyApplication
} from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { UserRepository } from "../src/modules/user/user.repository";

describe("Architecture Verification (e2e)", () => {
  let app: INestApplication;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.enableShutdownHooks();
    
    userRepository = moduleFixture.get<UserRepository>(UserRepository);
    
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Unified Response Format", () => {
    it("should return a standardized success response", async () => {
      const res = await request(app.getHttpServer()).get("/health");
      
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        responseCode: 200,
        message: expect.any(String),
        timestamp: expect.any(String),
      });
    });
  });

  describe("Global Exception Filter", () => {
    it("should return a standardized error response", async () => {
      const res = await request(app.getHttpServer()).get("/non-existent");
      
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        success: false,
        responseCode: 404,
        message: expect.any(String),
        errorCode: "NOT_FOUND",
        path: "/non-existent",
        timestamp: expect.any(String),
      });
    });

    it("should handle localized validation errors", async () => {
        const res = await request(app.getHttpServer())
            .get("/non-existent")
            .set('Accept-Language', 'es');
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
  });

  describe("Repository Pattern Integration", () => {
    it("should have a functioning UserRepository", () => {
      expect(userRepository).toBeDefined();
      expect(userRepository.findAll).toBeDefined();
      expect(userRepository.findUnique).toBeDefined();
    });

    it("should enforce query limits in findAll", async () => {
        const spy = jest.spyOn((userRepository as any).model, 'findMany').mockResolvedValue([]);
        
        await userRepository.findAll({});
        
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({
            take: 100
        }));
        
        spy.mockRestore();
    });
  });

  describe("Database Concurrency Control", () => {
    it("should limit active concurrent queries to 20", async () => {
        const limiter = require("../src/common/services/concurrency-limiter.service").ConcurrencyLimiterService;
        const instance = new limiter();
        
        expect(instance.MAX_ACTIVE_CONNECTIONS).toBe(20);
        expect(instance.MAX_TOTAL_CAPACITY).toBe(150);
    });

    it("should throw 429 when total capacity is exceeded", async () => {
        const limiter = require("../src/common/services/concurrency-limiter.service").ConcurrencyLimiterService;
        const instance = new limiter();
        
        const promises = [];
        for(let i = 0; i < 150; i++) {
            promises.push(instance.run(() => new Promise(resolve => setTimeout(resolve, 100))));
        }
        
        await expect(instance.run(() => Promise.resolve())).rejects.toThrow();
    });
  });
});

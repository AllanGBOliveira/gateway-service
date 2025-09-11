import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Service is running properly');
  });

  it('/ (GET) with Portuguese language', () => {
    return request(app.getHttpServer())
      .get('/?lang=pt-BR')
      .expect(200)
      .expect('Serviço funcionando corretamente');
  });

  it('/ (GET) with Accept-Language header', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('Accept-Language', 'pt-BR')
      .expect(200)
      .expect('Serviço funcionando corretamente');
  });
});

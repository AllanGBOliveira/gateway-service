import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { I18nService } from 'nestjs-i18n';

describe('AppController', () => {
  let appController: AppController;

  const mockI18nService = {
    t: jest.fn((key: string) => {
      const translations: Record<string, string> = {
        'common.SERVICE_HEALTHY': 'Service is running properly',
      };
      return translations[key] || key;
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return translated service healthy message', () => {
      expect(appController.getHello()).toBe('Service is running properly');
    });
  });
});

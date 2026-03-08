import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { STORAGE_PROVIDER } from '../storage/storage.constants';
import { TemplateRendererService } from './template-renderer.service';
import { Template } from './template.entity';
import { TemplatesService } from './templates.service';

type MockRepository<T extends object = object> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = (): MockRepository<Template> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  merge: jest.fn(),
  softDelete: jest.fn(),
});

describe('TemplatesService', () => {
  let service: TemplatesService;
  let repository: MockRepository<Template>;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockTemplateRendererService = {
    renderHtmlToPng: jest.fn(),
  };

  const mockStorageProvider = {
    uploadObject: jest.fn(),
  };

  beforeEach(async () => {
    repository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: TemplateRendererService,
          useValue: mockTemplateRendererService,
        },
        {
          provide: STORAGE_PROVIDER,
          useValue: mockStorageProvider,
        },
        {
          provide: getRepositoryToken(Template),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTemplate', () => {
    it('should create and save a template', async () => {
      const dto = {
        name: 'Simple Template',
        html: '<h1>{{title}}</h1>',
        css: 'h1 { color: red; }',
        variableSchema: { title: 'string' },
        promptRecipe: 'Use bold heading',
        version: 1,
      };

      const created = { ...dto, id: 'tmpl-1' };

      repository.create?.mockReturnValue(created);
      repository.save?.mockResolvedValue(created);

      const result = await service.createTemplate(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('previewTemplate', () => {
    it('should render template HTML with variable replacement', async () => {
      repository.findOne?.mockResolvedValue({
        id: 'tmpl-1',
        name: 'Article Template',
        html: '<h1>{{title}}</h1><p>{{author}}</p>',
      });

      const result = await service.previewTemplate('tmpl-1', {
        title: 'Hello',
        author: 'Farzeen',
      });

      expect(result.renderedHtml).toBe('<h1>Hello</h1><p>Farzeen</p>');
    });

    it('should replace multiple variables in template', async () => {
      repository.findOne?.mockResolvedValue({
        id: 'tmpl-2',
        name: 'Multi Variable Template',
        html: '<h1>{{title}}</h1><p>{{subtitle}}</p><span>{{author}}</span>',
      });

      const result = await service.previewTemplate('tmpl-2', {
        title: 'Welcome',
        subtitle: 'To DeenCraft',
        author: 'Admin',
      });

      expect(result.renderedHtml).toBe(
        '<h1>Welcome</h1><p>To DeenCraft</p><span>Admin</span>',
      );
    });

    it('should keep placeholders when variables are missing', async () => {
      repository.findOne?.mockResolvedValue({
        id: 'tmpl-3',
        name: 'Missing Vars Template',
        html: '<h1>{{title}}</h1><p>{{author}}</p>',
      });

      const result = await service.previewTemplate('tmpl-3', {
        title: 'Only Title',
      });

      expect(result.renderedHtml).toBe('<h1>Only Title</h1><p>{{author}}</p>');
    });
  });

  describe('renderTemplateToImage', () => {
    it('should render html to png, upload to storage and return previewUrl', async () => {
      repository.findOne?.mockResolvedValue({
        id: 'tmpl-render-1',
        name: 'Render Template',
        html: '<h1>{{title}}</h1><p>{{count}}</p>',
      });

      const pngBuffer = Buffer.from('png-bytes');
      mockTemplateRendererService.renderHtmlToPng.mockResolvedValue(pngBuffer);
      mockStorageProvider.uploadObject.mockResolvedValue(undefined);

      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => {
          if (key === 'aws.bucketName' || key === 'AWS_BUCKET_NAME') {
            return 'deencraft-bucket';
          }
          if (key === 'aws.region' || key === 'AWS_REGION') {
            return 'us-east-1';
          }
          return defaultValue;
        },
      );

      const result = await service.renderTemplateToImage('tmpl-render-1', {
        title: 'Hello',
        count: 2,
      });

      expect(mockTemplateRendererService.renderHtmlToPng).toHaveBeenCalledWith(
        '<h1>Hello</h1><p>2</p>',
      );

      expect(mockStorageProvider.uploadObject).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.stringMatching(
            /^templates\/previews\/tmpl-render-1\/.+\.png$/,
          ),
          body: pngBuffer,
          contentType: 'image/png',
        }),
      );

      expect(result.previewUrl).toMatch(
        /^https:\/\/deencraft-bucket\.s3\.amazonaws\.com\/templates\/previews\/tmpl-render-1\/.+\.png$/,
      );
    });

    it('should throw InternalServerErrorException when renderer or storage is not configured', async () => {
      const serviceWithoutDeps = new TemplatesService(
        repository as unknown as Repository<Template>,
      );

      await expect(
        serviceWithoutDeps.renderTemplateToImage('tmpl-missing-deps', {
          title: 'Hello',
        }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  beforeEach(async () => {
    repository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: getRepositoryToken(Template),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
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
});

import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

const mockTemplatesService = {
  createTemplate: jest.fn(),
  getTemplates: jest.fn(),
  getTemplateById: jest.fn(),
  updateTemplate: jest.fn(),
  deleteTemplate: jest.fn(),
  previewTemplate: jest.fn(),
};

describe('TemplatesController', () => {
  let controller: TemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        {
          provide: TemplatesService,
          useValue: mockTemplatesService,
        },
      ],
    }).compile();

    controller = module.get<TemplatesController>(TemplatesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTemplate', () => {
    it('should call TemplatesService.createTemplate', async () => {
      const dto = {
        name: 'Template A',
        html: '<h1>{{title}}</h1>',
        variableSchema: { title: 'string' },
        version: 1,
      };
      const serviceResult = { id: 'tmpl-1', ...dto };

      mockTemplatesService.createTemplate.mockResolvedValue(serviceResult);

      const result = await controller.createTemplate(dto);

      expect(mockTemplatesService.createTemplate).toHaveBeenCalledWith(dto);
      expect(result).toEqual(serviceResult);
    });
  });

  describe('previewTemplate', () => {
    it('should call TemplatesService.previewTemplate', async () => {
      const id = 'tmpl-1';
      const dto = {
        variables: {
          title: 'Example title',
          subtitle: 'Example subtitle',
        },
      };

      const serviceResult = {
        id,
        name: 'Template A',
        renderedHtml: '<h1>Example title</h1><p>Example subtitle</p>',
      };

      mockTemplatesService.previewTemplate.mockResolvedValue(serviceResult);

      const result = await controller.previewTemplate(id, dto);

      expect(mockTemplatesService.previewTemplate).toHaveBeenCalledWith(
        id,
        dto.variables,
      );
      expect(result).toEqual(serviceResult);
    });
  });
});

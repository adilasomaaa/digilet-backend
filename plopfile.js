module.exports = function (plop) {
  plop.setGenerator('resource', {
    description: 'Generate Custom NestJS Resource',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Nama resource (kebab-case, misal: study-program):',
      },
    ],
    actions: [
      // Controller
      {
        type: 'add',
        path: 'src/{{kebabCase name}}/{{kebabCase name}}.controller.ts',
        templateFile: 'stubs/controller.hbs',
      },
      // Service
      {
        type: 'add',
        path: 'src/{{kebabCase name}}/{{kebabCase name}}.service.ts',
        templateFile: 'stubs/service.hbs',
      },
      // Module
      {
        type: 'add',
        path: 'src/{{kebabCase name}}/{{kebabCase name}}.module.ts',
        templateFile: 'stubs/module.hbs',
      },
      // DTOs
      {
        type: 'add',
        path: 'src/{{kebabCase name}}/dto/create-{{kebabCase name}}.dto.ts',
        templateFile: 'stubs/dto-create.hbs',
      },
      {
        type: 'add',
        path: 'src/{{kebabCase name}}/dto/update-{{kebabCase name}}.dto.ts',
        templateFile: 'stubs/dto-update.hbs',
      },
      {
        type: 'add',
        path: 'src/{{kebabCase name}}/dto/query-{{kebabCase name}}.dto.ts',
        templateFile: 'stubs/dto-query.hbs',
      },
    ],
  });
};
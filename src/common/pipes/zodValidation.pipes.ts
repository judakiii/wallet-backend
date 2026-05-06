import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export function ZodValidation(schema: ZodSchema): PipeTransform {
  return {
    transform(value: any) {
      const parsed = schema.safeParse(value);

      if (!parsed.success) {
        const error = parsed.error.issues[0];

        throw new BadRequestException({
          statusCode: 400,
          field: error.path.join('.'),
          message: error.message,
        });
      }

      return parsed.data;
    },
  };
}

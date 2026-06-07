import { SetMetadata } from '@nestjs/common';

/**
 * Mark a route as public — JWT authentication will be skipped.
 * Use alongside @UseGuards(AuthGuard('jwt')) by applying OptionalJwtGuard
 * or by checking IS_PUBLIC_KEY in the JwtAuthGuard.
 *
 * Usage:
 *   @Public()
 *   @Get('some-public-route')
 *   publicHandler() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

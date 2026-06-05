/**
 * Shared Helmet configuration for security headers.
 *
 * contentSecurityPolicy is configured to allow Swagger UI
 * (and its CDN resources like validator.swagger.io) to work
 * without being blocked by CSP.
 *
 * Import this config in both main.ts and E2E tests to keep
 * security header configuration in sync.
 */
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Swagger UI requires 'unsafe-inline' for inline scripts/styles
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
    },
  },
};

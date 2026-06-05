import type { Preview, ReactRenderer } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../src/lib/auth-context";
import "../src/app/globals.css";
import { type ReactNode } from "react";

/**
 * Mock user data untuk AuthContext di Storybook.
 * Disimpan ke localStorage sebelum AuthProvider mount
 * sehingga komponen seperti Header bisa render dengan data user.
 */
const mockUser = {
  id: 1,
  username: "Admin THS",
  email: "admin@thsth.or.id",
  nomorHp: "08123456789",
  role: "admin" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};
/**
 * Create a mock Response object untuk API calls di Storybook.
 * Mencegah network errors di Chromatic headless environment.
 */
function mockApiResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Pasang fetch interceptor secara sinkron SEBELUM React mount pertama.
 * Ini mencegah CORS errors dari komponen yang fetch API di mount pertama.
 */
if (typeof window !== "undefined") {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    if (url.includes("/api/v1/")) {
      if (url.includes("/notifications?limit=")) {
        return mockApiResponse({ data: [] });
      }
      if (url.includes("/notifications/count")) {
        return mockApiResponse({ count: 0 });
      }
      if (url.includes("/notifications/read-all")) {
        return mockApiResponse({});
      }
      if (url.match(/\/api\/v1\/notifications\/\d+\/read/)) {
        return mockApiResponse({});
      }
      if (url.includes("/auth/me")) {
        return mockApiResponse({
          id: 1,
          username: "Admin THS",
          email: "admin@thsth.or.id",
          role: "admin",
        });
      }
      return mockApiResponse({ data: [] });
    }

    return originalFetch(input, init);
  };
}

/**
 * Global decorator: menyediakan AuthContext + ThemeContext
 * untuk semua story.
 */
const withProviders = (Story: () => ReactNode) => {
  // Set mock data secara sinkron sebelum render pertama
  if (typeof window !== "undefined") {
    const hasUser = localStorage.getItem("user");
    if (!hasUser) {
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("accessToken", "storybook-mock-token");
      localStorage.setItem("refreshToken", "storybook-mock-refresh");
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <Story />
      </AuthProvider>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile (375px)",
          styles: {
            width: "375px",
            height: "667px",
          },
          type: "mobile",
        },
        tablet: {
          name: "Tablet (768px)",
          styles: {
            width: "768px",
            height: "1024px",
          },
          type: "tablet",
        },
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
    withProviders,
  ],
};

export default preview;

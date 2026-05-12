import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "@/app/globals.css";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { RouteToastListener } from "@/components/ui/route-toast-listener";
import { ToastProvider } from "@/components/ui/toast";
import { APP_NAME, APP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} - Luxury Fashion and Lifestyle`,
    template: `%s | ${APP_NAME}`
  },
  description: "A polished ecommerce storefront for premium fashion and lifestyle pieces.",
  applicationName: APP_NAME
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ToastProvider>
            <RouteToastListener />
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

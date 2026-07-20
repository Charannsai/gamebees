import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Admin | Gamebees",
  description: "Admin Portal for Gamebees",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('gamebees-theme') || 'dark';
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}

                try {
                  if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
                    var removeAttr = function(node) {
                      if (node.nodeType === 1) {
                        if (node.hasAttribute('bis_skin_checked')) {
                          node.removeAttribute('bis_skin_checked');
                        }
                        var elements = node.querySelectorAll('[bis_skin_checked]');
                        for (var i = 0; i < elements.length; i++) {
                          elements[i].removeAttribute('bis_skin_checked');
                        }
                      }
                    };
                    var observer = new MutationObserver(function(mutations) {
                      for (var i = 0; i < mutations.length; i++) {
                        var mutation = mutations[i];
                        if (mutation.type === 'childList') {
                          for (var j = 0; j < mutation.addedNodes.length; j++) {
                            removeAttr(mutation.addedNodes[j]);
                          }
                        } else if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                          if (mutation.target.hasAttribute('bis_skin_checked')) {
                            mutation.target.removeAttribute('bis_skin_checked');
                          }
                        }
                      }
                    });
                    observer.observe(document.documentElement, {
                      childList: true,
                      subtree: true,
                      attributes: true,
                      attributeFilter: ['bis_skin_checked']
                    });
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body 
        className="min-h-full flex flex-col bg-gamebees-bg selection:bg-gamebees-accent-blue selection:text-white grainy-overlay"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

import { writeFile, createFolder } from './utils.js';
import path from 'path';

export const createPages = (pagesPath, pages, useTypeScript, useAppDir) => {
  const extension = useTypeScript ? '.tsx' : '.js';

  pages.forEach((page) => {
    const pageName = page.charAt(0).toUpperCase() + page.slice(1);
    const pageContent =
      `export default function ${pageName}() {
    return (
        <div>
            <h1>${pageName}</h1>
        </div>
    );
}`;

    let pagePath;
    if (useAppDir) {
      if (page.toLowerCase() === 'index' || page.toLowerCase() === 'home') {
        pagePath = path.join(pagesPath, `page${extension}`);
      } else {
        const pageDir = path.join(pagesPath, page.toLowerCase());
        createFolder(pageDir);
        pagePath = path.join(pageDir, `page${extension}`);
      }
    } else {
      if (page.toLowerCase() === 'index' || page.toLowerCase() === 'home') {
        pagePath = path.join(pagesPath, `index${extension}`);
      } else {
        pagePath = path.join(pagesPath, `${page.toLowerCase()}${extension}`);
      }
    }
    writeFile(pagePath, pageContent);
  });
};

export const createLayout = (projectPath, projectName, useTypeScript, useAppDir, useSrcDir) => {
  const extension = useTypeScript ? ".tsx" : ".js";

  if (!useAppDir) {
    return;
  }

  const appDir = useSrcDir ? path.join(projectPath, "src", "app") : path.join(projectPath, "app");

  const layoutPath = path.join(appDir, `layout${extension}`);

  const layoutContent = useTypeScript
    ? `import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "${projectName}",
  description: "This is the ${projectName} project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
    : `import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "${projectName}",
  description: "This is the ${projectName} project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

  createFolder(path.join(projectPath, "app"));
  writeFile(layoutPath, layoutContent);
};
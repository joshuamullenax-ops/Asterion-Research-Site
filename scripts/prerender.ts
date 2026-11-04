import fs from "fs";
import path from "path";
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "../src/App";
import { REPORTS } from "../src/data";

const DOMAIN = "https://asterion-research-980127554307.us-west1.run.app";
const distDir = path.join(process.cwd(), "dist");
const publicDir = path.join(process.cwd(), "public");

async function prerender() {
  console.log("Starting static HTML pre-rendering...");

  const templatePath = path.join(distDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    throw new Error(`dist/index.html not found at ${templatePath}. Ensure vite build runs first.`);
  }

  const templateHtml = fs.readFileSync(templatePath, "utf-8");

  // Define routes to prerender
  interface RouteConfig {
    path: string;
    outPath: string;
    initialTab: "home" | "library" | "about" | "admin";
    initialReportId?: string;
    title?: string;
    description?: string;
  }

  const routes: RouteConfig[] = [
    {
      path: "/",
      outPath: path.join(distDir, "index.html"),
      initialTab: "home",
      title: "Asterion Research | Institutional-Quality Student Equity Research",
      description: "Asterion Research is a premier student-founded institutional equity research group at Baldwin Wallace University, delivering professional-grade financial analysis and investment reports."
    },
    {
      path: "/research-library",
      outPath: path.join(distDir, "research-library", "index.html"),
      initialTab: "library",
      title: "Research Library | Asterion Research",
      description: "Access high-conviction institutional equity research reports, valuation models, and sector deep-dives across Healthcare, Tech, Industrials, Energy, and more."
    },
    {
      path: "/about",
      outPath: path.join(distDir, "about", "index.html"),
      initialTab: "about",
      title: "About Our Team & Leadership | Asterion Research",
      description: "Asterion Research was founded by Baldwin Wallace University finance leaders managing a $1.5M student portfolio. Learn about President Ian Palmer and VP Josh Mullenax."
    }
  ];

  // Add all individual report routes
  for (const report of REPORTS) {
    routes.push({
      path: `/reports/${report.id}`,
      outPath: path.join(distDir, "reports", report.id, "index.html"),
      initialTab: "library",
      initialReportId: report.id,
      title: `${report.ticker} (${report.companyName}) Research Report | Asterion Research`,
      description: `${report.title} - ${report.summary}`
    });
  }

  // Pre-render each route
  for (const route of routes) {
    console.log(`Pre-rendering route: ${route.path}`);

    // Render React App to static HTML string
    const renderedAppHtml = ReactDOMServer.renderToString(
      React.createElement(App, {
        initialTab: route.initialTab,
        initialReportId: route.initialReportId
      })
    );

    // Inject rendered HTML into template
    let html = templateHtml;

    // Replace root element content (handles both empty <div id="root"></div> and fallback content)
    html = html.replace(
      /<div id="root">[\s\S]*?<\/div>/,
      `<div id="root">${renderedAppHtml}</div>`
    );

    // Update page title if specified
    if (route.title) {
      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${route.title}</title>`);
      html = html.replace(/<meta property="og:title" content="[\s\S]*?" \/>/, `<meta property="og:title" content="${route.title}" />`);
      html = html.replace(/<meta property="twitter:title" content="[\s\S]*?" \/>/, `<meta property="twitter:title" content="${route.title}" />`);
    }

    // Update description if specified
    if (route.description) {
      html = html.replace(/<meta name="description" content="[\s\S]*?" \/>/, `<meta name="description" content="${route.description.replace(/"/g, '&quot;')}" />`);
      html = html.replace(/<meta property="og:description" content="[\s\S]*?" \/>/, `<meta property="og:description" content="${route.description.replace(/"/g, '&quot;')}" />`);
      html = html.replace(/<meta property="twitter:description" content="[\s\S]*?" \/>/, `<meta property="twitter:description" content="${route.description.replace(/"/g, '&quot;')}" />`);
    }

    // Update canonical link
    const canonicalUrl = `${DOMAIN}${route.path === "/" ? "" : route.path}`;
    if (html.includes('<link rel="canonical"')) {
      html = html.replace(/<link rel="canonical" href="[\s\S]*?" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`);
    }

    // Write file
    const targetDir = path.dirname(route.outPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(route.outPath, html, "utf-8");
    console.log(`✓ Generated ${path.relative(process.cwd(), route.outPath)}`);
  }

  // Generate Sitemap XML
  const today = new Date().toISOString().split("T")[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/research-library</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${DOMAIN}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
${REPORTS.map(r => `  <url>
    <loc>${DOMAIN}/reports/${r.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n")}
</urlset>
`;

  // Write sitemap.xml to both dist and public
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemapXml, "utf-8");
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf-8");
  }
  console.log("✓ Generated dist/sitemap.xml and public/sitemap.xml");

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;

  fs.writeFileSync(path.join(distDir, "robots.txt"), robotsTxt, "utf-8");
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt, "utf-8");
  }
  console.log("✓ Generated dist/robots.txt and public/robots.txt");

  console.log("Pre-rendering complete successfully!");
}

prerender().catch((err) => {
  console.error("Error during pre-rendering:", err);
  process.exit(1);
});

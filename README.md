# Replica Builder by NextStepFusion

## Prebuilt app (./dist)

- A production build is already available in `./dist/` and can be hosted by any static hosting or server (GitHub Pages, Vercel, Cloudflare Pages, Netlify, S3+CloudFront, Nginx, etc.).
- Entry point: `dist/index.html`.

### Quick local serve of prebuilt files

Choose one of the following:

1) Using Vite preview

```bash
yarn build
yarn vite preview --port 3001
# open http://localhost:3001
```

2) Using a one-off static file server

```bash
npx serve -s dist -l 3001
# or
python3 -m http.server 3001 --directory dist
```

## Develop locally

1. Install Node.js 20+ and enable Corepack:

```bash
corepack enable
```

2. Install dependencies:

```bash
yarn
```

3. Start the dev server:

```bash
yarn dev
# open http://localhost:5173
```

## Build for production

```bash
yarn build
# outputs to ./dist (minified, hashed assets)
```

## Deployment

- GitHub Pages (CI/CD): This repository is set up with GitHub Actions to build and deploy to GitHub Pages automatically on each push to the default branch. Ensure GitHub Pages is enabled for the repo.
- Manual/static hosting: Upload the contents of `dist/` to your provider. Serve `index.html` as the fallback for client-side routing if needed.

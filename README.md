This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

```
# client side variables
NEXT_PUBLIC_ENV='local'
NEXT_PUBLIC_API_URL='http://localhost:3001/v1'

# server side variables
NEXTAUTH_SECRET='HdirGOjnpEAR6Oj6oh3hUJUYiZKOoNIDAOSL1LuQxio='
NEXTAUTH_URL=http://localhost:3000
```

## https://localhost:3000 제대로 설치하기

```
brew install mkcert
brew install nss # Firefox 를 위해
mkcert -install
mkcert localhost # 프로젝트 root folder 에서 실행
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

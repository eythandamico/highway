# Installed Highway example

This app consumes actual npm tarballs, not monorepo aliases or source imports. From the Highway checkout:

```sh
npm run pack:packages
cd examples/highway-vite
npm install
npm run build
npm run dev
```

Open http://127.0.0.1:5192. Toggle the brand and dark mode, open the form/menu/calendar, and try a failed save. Host content above the theme remains independent. No infrastructure or Tailwind configuration is present. To refresh the same development package version after rebuilding, use `npm install ../../artifacts/highway-styles-0.2.2.tgz ../../artifacts/highway-react-0.2.2.tgz --force`; real releases must increment both package versions.

# ABI-Software Gallery

This component is now built with Vue3 and Vite, Vue2 is no longer maintained but the source code can be found in this [branch](https://github.com/ABI-Software/mapcore-gallery/tree/Vue-2).

[mapcore-gallery documentation](https://abi-software.github.io/mapcore-gallery/)

#### In App.vue - (Options API)

```
<template>
    <div>
      <Gallery :items="dataInput" @card-clicked="cardClicked" />
    </div>
</template>

<script>
import Gallery from './components/Gallery.vue'
import "@abi-software/gallery/dist/style.css";
export default {
  name: "App",
  components: {
    Gallery,
  },
  ...
}
```

#### When using the mixin

Contains the `defaultImg` source and the `getRequest` function for fetching the dataset images.

```
<script>
/* eslint-disable no-alert, no-console */
import GalleryHelper from "@abi-software/gallery/src/mixins/GalleryHelpers";
export default {
  mixins: [ GalleryHelper ],
  ...
}
```

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run serve
```

### Compile and Minify for Production

```sh
npm run build-bundle
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## API Documentation

The API documentation is developed with `vitepress` and `vuese`. Documentation pages are in the `docs` folder.

### To run in local development mode

```bash
npm run docs:watch
```

This will start the documentation server with `vitepress` on port `:5173` and watch the components' changes.

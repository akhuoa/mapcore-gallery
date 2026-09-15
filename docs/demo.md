# Gallery Live Demo

## Live Demo

<div class="demo-map-container">
  <div class="demo-map-container-inner">
    <ClientOnly>
      <Gallery :items="items" />
    </ClientOnly>
  </div>
</div>

<script setup>
import { defineClientComponent } from "vitepress";
import "./demo-styles.css";

const items = [
  {
    title: 'Title 1',
    type: 'data1',
    userData: 'https://sparc.science/',
  },
  {
    title: 'Title 2',
    type: 'data2',
    link: 'https://sparc.science/',
  },
  {
    title: 'Title 3',
    type: 'data3',
    link: 'https://sparc.science/',
  },
]

const Gallery = defineClientComponent(() => {
  return import("../src/components/Gallery.vue");
})
</script>

## Code Preview

```js-vue
  <div class="your-outer-container">
    <Gallery
      :items="items"
    />
  </div>

  <script>
    import Gallery from './components/Gallery.vue'
    import "@abi-software/gallery/dist/style.css";

    export default {
      components: { Gallery },
      data: function () {
        return {
          items: [
            {
              title: 'test1',
              type: 'data',
              userData: 'https://sparc.science/',
            },
            {
              title: 'test2',
              type: 'data',
              link: 'https://sparc.science/',
            },
            {
              title: 'test3',
              type: 'data',
              link: 'https://sparc.science/',
            },
          ]
        }
      }
    }
  </script>
```

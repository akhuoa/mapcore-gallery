<script setup name="Gallery">
import { ref, computed } from 'vue';

import IndexIndicator from './IndexIndicator.vue';
import Card from './Card.vue';

function convertRemToPixels(rem) {
  if (typeof window !== 'undefined') {
    return rem * parseFloat(window.getComputedStyle(document.documentElement).fontSize);
  }
  return rem * 16;
}

const props = defineProps({
  /**
   * The array of items (data) to render the gallery.
   */
  items: {
    type: Array,
    default: () => {
      return [];
    },
  },
  /**
   * The maximum width we are allowed minus two buttons for next and previous divided by the width of a card.
   */
  maxWidth: {
    type: Number,
    default: 3,
  },
  /**
   * The width of the card in rem unit.
   */
  cardWidth: {
    type: Number,
    default: 13.8,
  },
  /**
   * The option to show indicator bar at the bottom.
   */
  showIndicatorBar: {
    type: Boolean,
    default: true,
  },
  /**
   * The option to highlight the active item.
   */
  highlightActive: {
    type: Boolean,
    default: true,
  },
  /**
   * The option to show card details.
   */
  showCardDetails: {
    type: Boolean,
    default: true,
  },
  /**
   * The CSS to define card's style.
   */
  bodyStyle: {
    type: Object,
    default: () => {
      return { padding: '20px', background: '#ffffff' };
    },
  },
  /**
   * The space between the card and indicator bar.
   */
  bottomSpacer: {
    type: Object,
    default: () => {
      return { minHeight: '4rem' };
    },
  },
  /**
   * The CSS for image container in card.
   */
  imageContainerStyle: {
    type: Object,
    default: () => {
      return {};
    },
  },
  /**
   * The CSS for image style in card.
   */
  imageStyle: {
    type: Object,
    default: () => {
      return {};
    },
  },
  // TODO: not in use
  metaData: {
    type: Object,
    default: () => {
      return {
        datasetVersion: -1,
        datasetId: -1,
      };
    },
  },
  // TODO: not in use
  description: {
    type: String,
    default: '',
  },
  /**
   * when to show card shadows (always / hover / never)
   */
  shadow: {
    type: String,
    default: 'always',
  },
});

const emit = defineEmits(['card-clicked', 'datalink-clicked']);

const count = ref(0);
const currentIndex = ref(0);
const controlHeight = ref(2);
const controlWidth = ref(2);

const itemCount = computed(() => {
  return props.items.length;
});
const isPrevPossible = computed(() => {
  return currentIndex.value > 0;
});
const isNextPossible = computed(() => {
  return currentIndex.value < itemCount.value - 1;
});
const cardHeight = computed(() => {
  return 0.78 * props.cardWidth;
});
// const cardLineWidth = computed(() => {
//   const cardSpacing = 0.25;
//   return itemCount.value * (props.cardWidth + cardSpacing) - cardSpacing;
// });
const numberOfItemsVisible = computed(() => {
  // The maximum width we are allowed minus two buttons for next and previous
  // divided by the width of a card.
  // const n = itemCount.value - 1
  const cardSpacingPx = convertRemToPixels(0.5);
  const buttonPx = convertRemToPixels(2);
  const cardWidthPx = convertRemToPixels(props.cardWidth);
  const cardItems = (props.maxWidth - 2 * buttonPx - 2 * cardSpacingPx) / (1.1 * cardWidthPx);
  //Display at least one item
  return Math.max(1, Math.floor(cardItems));
});
const canShowIndicatorBar = computed(() => {
  const indicatorWidth = convertRemToPixels(1);
  const indicatorAllowance = props.maxWidth / (indicatorWidth * itemCount.value);
  return props.showIndicatorBar && indicatorAllowance > 0.1 && itemCount.value > 1;
});
const valueAdjustment = computed(() => {
  const halfWindow = Math.floor(numberOfItemsVisible.value / 2);
  let valueAdjust = currentIndex.value - halfWindow;
  if (valueAdjust < 0) {
    valueAdjust = 0;
  } else if (valueAdjust + numberOfItemsVisible.value > itemCount.value) {
    valueAdjust = itemCount.value - numberOfItemsVisible.value;
  }
  return valueAdjust;
});
const windowedItems = computed(() => {
  let myArray = [];
  for (let i = 0; i < numberOfItemsVisible.value; i++) {
    myArray.push(props.items[i + valueAdjustment.value]);
  }
  return myArray;
});

function cardClicked(payload) {
  emit('card-clicked', payload);
}
function datalinkClicked(payload) {
  emit('datalink-clicked', payload);
}
function isActive(index) {
  return currentIndex.value - valueAdjustment.value === index && props.highlightActive;
}
function goNext() {
  currentIndex.value += 1;
}
function goPrev() {
  currentIndex.value -= 1;
}
function indicatorClicked(index) {
  if (currentIndex.value !== index) {
    currentIndex.value = index;
  }
}

defineExpose({
  count,
  currentIndex,
  controlHeight,
  controlWidth,
  cardClicked,
  isActive,
  goNext,
  goPrev,
  indicatorClicked,
});
</script>

<template>
  <div ref="myButton" class="gallery">
    <div class="gallery-strip">
      <a
        v-if="items.length > 1"
        href="#"
        :class="['oval', 'prev', { disabled: !isPrevPossible }]"
        @click.prevent="goPrev"
      >
        <span class="progress-button">&lsaquo;</span>
      </a>
      <div v-else style="width: 2rem" />
      <div class="filler" />
      <div class="card-line">
        <span
          v-for="(item, index) in windowedItems"
          :key="'card_' + index"
          :class="['key-image-span', { active: isActive(index) }]"
        >
          <Card
            v-if="item"
            :data="item"
            :body-style="bodyStyle"
            :image-container-style="imageContainerStyle"
            :image-style="imageStyle"
            :width="cardWidth"
            :height="cardHeight"
            :shadow="shadow"
            :show-card-details="showCardDetails"
            @card-clicked="cardClicked"
            @datalink-clicked="datalinkClicked"
          />
        </span>
      </div>
      <div class="filler" />
      <a
        v-if="items.length > 1"
        href="#"
        :class="['oval', 'next', { disabled: !isNextPossible }]"
        @click.prevent="goNext"
      >
        <span class="progress-button">&rsaquo;</span>
      </a>
      <div v-else style="width: 2rem" />
    </div>
    <div :style="bottomSpacer" />
    <IndexIndicator
      v-if="canShowIndicatorBar"
      :count="itemCount"
      :current="currentIndex"
      @clicked="indicatorClicked"
    />
  </div>
</template>

<style lang="scss" scoped>
.oval {
  width: 2rem;
  height: 2rem;
  line-height: 2rem;
  box-shadow: 0 0.125rem 0.25rem 0 rgba(0, 0, 0, 0.25);
  border: solid 1px var(--pale-grey);
  background-color: #ffffff;
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  user-select: none;
}

.gallery-strip,
.card-line {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-around;
  align-items: center;
}

.card-line {
  flex-grow: 2;
}

.progress-button {
  font-size: 1.5rem;
  font-weight: bold;
  color: $app-primary-color;
}

.filler {
  flex-grow: 1;
}

.key-image-span.active {
  transform: scale(1.1);
}

a.prev:not(.underline),
a.next:not(.underline) {
  text-decoration: none;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>

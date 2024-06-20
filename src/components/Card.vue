<script setup name="GalleryCard">
import { ref, computed, watch, onUpdated, nextTick } from 'vue'
import useS3 from './GalleryHelpers.js'

function isValidHttpUrl(string) {
  let url = undefined
  try {
    url = new URL(string)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}

const { defaultImg, getRequest } = useS3();
const titleText = ref()

const ro = ref(null)
const triangleSize = ref(4)
const thumbnail = ref(undefined)
const useDefaultImg = ref(false)
const disableTooltip = ref(false)
const tooltipCalculated = ref(false)

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  width: {
    type: Number,
    default: 3,
  },
  height: {
    type: Number,
    default: 3,
  },
  showCardDetails: {
    type: Boolean,
  },
  bodyStyle: {
    type: Object,
    default: () => {
      return { padding: '20px', background: '#ffffff' }
    },
  },
  imageStyle: {
    type: Object,
    default: () => {
      return {}
    },
  },
  imageContainerStyle: {
    type: Object,
    default: () => {
      return {}
    },
  },
  shadow: {
    type: String,
    default: 'always',
  },
})

const emit = defineEmits(['card-clicked', 'datalink-clicked']);

const isReady = computed(() => {
  return (
    props.data.title &&
    ((thumbnail ? thumbnail.value : false) || useDefaultImg.value) &&
    (props.data.link || props.data.userData)
  )
})
const imageHeight = computed(() => {
  return showCardDetails ? height * 0.525 : height
})
const imageWidth = computed(() => {
  return width - 2 * marginDetails
})
const triangleHeight = computed(() => {
  return height * 0.237
})
const marginDetails = computed(() => {
  return height * 0.076
})
const typeIcon = computed(() => {
  return showCardDetails ? height * 0.525 : height
})

watch(
  () => props.data, () => {
    thumbnail.value = undefined
    useDefaultImg.value = false
    tooltipCalculated.value = false
    disableTooltip.value = false
    if (props.data.thumbnail) {
      if (isValidHttpUrl(props.data.thumbnail) && props.data.mimetype) {
        downloadThumbnail(props.data.thumbnail, { fetchAttempts: 0 })
      } else {
        thumbnail.value = props.data.thumbnail
      }
    } else {
      useDefaultImg.value = true
    }
    //Dynamically check title length to determine if popover should be shown
    nextTick(() => {
      calculateShowTooltip()
    })
  }, { immediate: true }
)

onUpdated(() => {
  nextTick(() => {
    calculateShowTooltip()
  })
})

function cardClicked() {
  if (props.data.link) {
    const link = document.createElement('a')
    link.href = props.data.link
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    emit('datalink-clicked', props.data.link);
    link.remove()
  }
  if (props.data.userData) {
    emit('card-clicked', props.data.userData)
  }
}
/**
 * handle thumbnail downloading,, it will use a default svg image if fails
 */
function downloadThumbnail(url, info) {
  getRequest(url, {}, 11000).then(
    (response) => {
      let data = response.data
      if (typeof data === 'string' && data.startsWith('data:')) {
        thumbnail.value = response.data
      } else {
        if (props.data.mimetype) {
          thumbnail.value = `data:${props.data.mimetype};base64,${response.data}`
        } else {
          thumbnail.value = response.data
        }
      }
    },
    (reason) => {
      if (
        reason.message.includes('timeout') &&
        reason.message.includes('exceeded') &&
        info.fetchAttempts < 3
      ) {
        info.fetchAttempts += 1
        downloadThumbnail(url, info)
      } else {
        useDefaultImg.value = true
      }
    }
  )
}
//dynamically calculate if tooltip is required
function calculateShowTooltip() {
  if (props.data.hideTitle) {
    disableTooltip.value = true
    tooltipCalculated.value = true
  } else {
    const ele = titleText
    //Check if title text is rendered yet
    if (ele && ele.offsetParent) {
      tooltipCalculated.value = true
      if (ele.offsetWidth >= ele.scrollWidth) disableTooltip.value = true
      else disableTooltip.value = false
    } else {
      //text not rendered yet
      if (props.data.title.length > 20) disableTooltip.value = false
      else disableTooltip.value = true
    }
  }
}
</script>

<template>
  <el-card
    :shadow="shadow"
    :body-style="bodyStyle"
    :style="{ padding: '0px', maxWidth: width + 'rem' }"
    class="card"
  >
    <div v-loading="!isReady">
      <div
        class="cursor-pointer"
        :style="imageContainerStyle"
        @click.prevent="cardClicked"
      >
        <img
          v-if="useDefaultImg"
          :src="defaultImg"
          width="160"
          height="160"
          loading="lazy"
          :style="imageStyle"
        />
        <img
          v-else
          :src="thumbnail"
          width="160"
          height="160"
          loading="lazy"
          alt="thumbnail loading ..."
          :style="imageStyle"
        />
      </div>
      <div v-if="false" class="image-overlay">
        <div
          class="triangle-right-corner"
          :style="`border-left-width: ${
            triangleHeight * 1.2
          }rem; border-top-width: ${triangleHeight}rem;`"
          @click="openLinkInNewTab"
        />
        <el-tooltip
          class="item"
          :content="`View ${data.type}`"
          placement="left"
        >
          <img
            class="triangle-icon"
            :style="`height: ${triangleHeight * 0.25}rem;top: ${
              triangleHeight * 0.15
            }rem;right: ${triangleHeight * 0.15}rem`"
            :src="typeIcon"
            @click="openLinkInNewTab"
          />
        </el-tooltip>
      </div>
      <div v-if="showCardDetails" class="details">
        <p v-if="!data.hideType">
          <b>{{ data.type }}</b>
        </p>
        <el-popover
          :virtual-ref="titleText"
          :disabled="disableTooltip"
          :content="data.title"
          placement="top"
          trigger="hover"
          popper-class="gallery-popper"
          virtual-triggering
        />
        <!--use v-show here to make sure el popover always have a starting location -->
        <p
          v-show="!data.hideTitle"
          ref="titleText"
          class="title"
        >
          {{ data.title }}
        </p>
        <p v-show="data.hideTitle" class="title text-placeholder"/>
        <el-button class="button" @click.prevent="cardClicked" size="large">
          View {{ data.type }}
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
@use 'element-plus/theme-chalk/src/button';
@use 'element-plus/theme-chalk/src/card';
@use 'element-plus/theme-chalk/src/popover';
@use 'element-plus/theme-chalk/src/tooltip';
@use 'element-plus/theme-chalk/src/loading';

.button,
.button:hover,
.button:focus {
  z-index: 10;
  font-family: Asap;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  background-color: $app-primary-color;
  border: $app-primary-color;
  color: white;
  cursor: pointer;
  margin-top: 8px;
}

.button:hover {
  background: $app-primary-color;
  box-shadow: -3px 2px 4px 0 rgba(0, 0, 0, 0.25);
  color: #fff;
}

.card {
  position: relative;
}
.details {
  text-align: left;
}

.cursor-pointer {
  cursor: pointer;

  > img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
}

.text-placeholder {
  height: 1rem;
}

.title {
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

p.bold {
  font-weight: bold;
}

.image-overlay {
  position: absolute;
  top: 0;
  right: 0;
}

.triangle-icon {
  position: absolute;
}

.triangle-right-corner {
  width: 0;
  height: 0;
  border-left: solid transparent;
  border-top: solid $app-primary-color;
}
</style>

<style lang="scss">
.gallery-popper {
  background: #f3ecf6 !important;
  border: 1px solid $app-primary-color;
  border-radius: 4px;
  color: #303133 !important;
  font-size: 12px;
  line-height: 1rem;
  height: 1rem;
  padding: 10px;
}
.gallery-popper.el-popper[x-placement^='top'] .popper__arrow {
  border-top-color: $app-primary-color !important;
}
.gallery-popper.el-popper[x-placement^='top'] .popper__arrow:after {
  border-top-color: #f3ecf6 !important;
}
</style>

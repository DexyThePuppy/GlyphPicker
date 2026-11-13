<script setup lang="ts">
import { publicUrl } from '~/utils/publicUrl'

const { showNames, glyphByName, isMaterial } = useCatalog()
const { soundOn, toggle, pop } = useUiSounds()
const { show } = useToast()

const packName = computed(() => isMaterial.value ? 'material-symbols-ttf.zip' : 'glyph-pack.zip')
const packUrl = computed(() => publicUrl(`pack/${packName.value}`))

function glyph(name: string, fallback = '•'): string {
  return glyphByName.value.get(name) || fallback
}

const flipNames = () => flip(showNames)
const flipSound = () => flip(soundOn)

function flip(target: Ref<boolean>): void {
  target.value = !target.value
  toggle()
}

function onDownloadClick(): void {
  show('Downloading pack…')
  pop()
}
</script>

<template>
  <div class="side-tools" role="toolbar" aria-label="Options">
    <button
      type="button"
      class="icon-btn"
      :aria-pressed="showNames"
      title="Show names"
      @click="flipNames"
    >
      <span class="glyph">{{ glyph('textformat') }}</span>
    </button>
    <button
      type="button"
      class="icon-btn"
      :aria-pressed="soundOn"
      title="UI sounds"
      @click="flipSound"
    >
      <span class="glyph">{{ glyph(soundOn ? 'speaker.wave.2' : 'speaker.slash') }}</span>
    </button>
    <a
      class="icon-btn"
      aria-pressed="true"
      :href="packUrl"
      :download="packName"
      title="Download fonts + text pack"
      @click="onDownloadClick"
    >
      <span class="glyph">{{ glyph('square.and.arrow.down') }}</span>
    </a>
  </div>
</template>

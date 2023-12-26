<template>
  <div v-if="!fileUploaded" class="upload-container">
    <label class="custom-file-upload">
      <input type="file" @change="onFileChange" class="upload-input" />
      <span>选择文件</span>
    </label>
  </div>
  <div
    v-if="fileUploaded"
    class="slide"
    tabindex="0"
    @keydown.left="prevSlide"
    @keydown.right="nextSlide"
  >
    <div v-html="slides[currentSlideIndex]"></div>
  </div>
  <div v-if="fileUploaded" class="pagination">
    <input v-model.number="inputSlideIndex" @keydown.enter="onEnter" />
    <span>/ {{ slides.length }}</span>
  </div>
</template>

<script lang="ts">
import '../assets/slides.css'
import '../assets/highlight.css'
import '../assets/component.css'

import { ref } from 'vue'
import { Marked } from 'marked'
import katex from 'katex'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'

export default {
  setup() {
    const marked = new Marked(
      markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext'
          return hljs.highlight(code, { language }).value
        }
      })
    )

    const fileUploaded = ref(false)
    const slides = ref<string[]>([])
    const currentSlideIndex = ref(0)

    const onFileChange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        fileUploaded.value = true
        const reader = new FileReader()
        reader.onload = async (e) => {
          const renderer = new marked.Renderer()
          renderer.text = (text) => {
            // Match inline formulas wrapped in \( ... \) or $ ... $
            const inlineFormulaPattern = /\\\((.*?)\\\)|\$(.*?)\$/g
            text = text.replace(inlineFormulaPattern, (_, formula1, formula2) => {
              const formula = formula1 || formula2
              return katex.renderToString(formula, {
                throwOnError: false
              })
            })

            // Match display formulas wrapped in $$ ... $$
            const displayFormulaPattern = /\$\$(.*?)\$\$/g
            text = text.replace(displayFormulaPattern, (_, formula) => {
              return katex.renderToString(formula, {
                displayMode: true,
                throwOnError: false
              })
            })

            return text
          }

          marked.setOptions({ renderer })

          const html = marked.parse(e.target?.result as string)
          slides.value = (await html).split('<hr>')
        }
        reader.readAsText(file)
      }
    }

    const nextSlide = () => {
      if (currentSlideIndex.value < slides.value.length - 1) {
        currentSlideIndex.value++
        inputSlideIndex.value = currentSlideIndex.value + 1
      }
    }

    const prevSlide = () => {
      if (currentSlideIndex.value > 0) {
        currentSlideIndex.value--
        inputSlideIndex.value = currentSlideIndex.value + 1
      }
    }

    const inputSlideIndex = ref(1)

    const onEnter = () => {
      if (inputSlideIndex.value >= 1 && inputSlideIndex.value <= slides.value.length) {
        currentSlideIndex.value = inputSlideIndex.value - 1
      }
    }

    return {
      onFileChange,
      slides,
      fileUploaded,
      currentSlideIndex,
      nextSlide,
      prevSlide,
      inputSlideIndex,
      onEnter
    }
  }
}
</script>

<style scoped></style>

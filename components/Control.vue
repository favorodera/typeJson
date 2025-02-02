<template>
  <div
    v-if="isExpanded"
    class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
    @click="isExpanded = false"
  />
  
  <section class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,25rem),1fr))] items-center justify-center gap-8">
   
    <div class="flex flex-col gap-2">
      
      <button
        type="button"
        class="w-max flex items-center gap-1 rounded-md px-2 py-1 duration-500 ease property-all active:scale-90 hover:bg-white hover:text-black"
        @click="() => {
          typeOrJson = ''
          isJson = !isJson
        }"
      >
        <span
          class="size-5"
          :class="{
            'i-hugeicons:typescript-01': !isJson,
            'i-hugeicons:code': isJson,
          }"
        />

        <p class="text-xs">
          {{ isJson ? 'JSON' : 'TS' }}
        </p>
      </button>

      <div class="min-h-md flex flex-auto flex-col justify-between gap-4 b b-white rounded-lg p-4">

        <TypeJsonEditor
          v-if="useMonaco()"
          v-model="typeOrJson"
          :lang="isJson ? 'json' : 'typescript'"
          :options="{
            theme: 'hc-black',
            matchBrackets: 'never',
            placeholder: isJson ? 'Your JSON data here ' : 'Your Interface or type here ',
            minimap: {
              enabled: false,
            },
            wordWrap: 'on',
            smoothScrolling: true,
            renderLineHighlight: 'none',
            autoDetectHighContrast: false,
            scrollBeyondLastColumn: 0,
            scrollBeyondLastLine: false,
            overviewRulerLanes: 0,
            scrollbar: {
              horizontal: 'hidden',
              vertical: 'hidden',
            },
            formatOnPaste: true,
            tabSize: 2,
            automaticLayout: true,
            formatOnType: true,
            lineNumbersMinChars: 1,
            fontSize: 14,
            
          }"
          class="flex-auto"
        />

        <div
          v-else
          class="flex flex-auto flex-col items-center justify-center gap-2"
        >
          <span class="i-hugeicons:reload size-4 animate-spin" />
          <p class="text-sm">
            Loading Editor...
          </p>
        </div>

        <button
          type="button"
          class="w-max self-end b b-white rounded-md px-2 py-1 duration-500 ease property-all active:scale-90 hover:bg-white hover:text-black"
          @click="execute()"
        >

          <span
            v-if="status === 'pending'"
            class="i-hugeicons:reload size-4 animate-spin"
          />

          {{
            instruction && status !== 'pending' ? 'Send' : status === 'pending' ? 'Generating...' : 'Generate'
          }}
        </button>

      </div>
      <textarea
        id="instruction"
        ref="instructionTextarea"
        v-model="instruction"
        name="instruction"
        placeholder="Instruction"
        rows="1"
        class="max-h-25 resize-none overflow-y-auto b b-white rounded-lg bg-transparent p-2 text-sm outline-none placeholder-text-white/70"
        @input="textareaAutoGrow"
      />

    </div>

    <div
      :class="{
        'fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 transform shadow-2xl': isExpanded,
        'relative min-h-lg ': !isExpanded,
      }"
      class="flex flex-col justify-between gap-4 border border-white rounded-lg p-4 transition-all duration-300 ease"
    >

      <div class="w-full flex items-center justify-between gap-4">

        <div
          class="w-max flex items-center gap-1 rounded-md px-2 py-1"
        >
          <span
            class="size-5"
            :class="{
              'i-hugeicons:typescript-01': isJson,
              'i-hugeicons:code': !isJson,
            }"
          />

          <p class="text-xs">
            {{ isJson ? 'TS' : 'JSON' }}
          </p>
        </div>

        <div class="flex items-center gap-4">
          
          <button
            type="button"
            class="w-max flex items-center gap-1 rounded-md px-2 py-1 duration-500 ease property-all active:scale-90 hover:bg-white hover:text-black"
            @click="copyOutput()"
          >
            <span
              :class="[
                'size-5',
                {
                  'i-hugeicons:clipboard': !isCopied,
                  'i-hugeicons:checkmark-square-02': isCopied,
                },
              ]"
            />
          </button>

          <button
            type="button"
            class="w-max flex items-center gap-1 rounded-md px-2 py-1 duration-500 ease property-all active:scale-90 hover:bg-white hover:text-black"
            @click="isExpanded = !isExpanded"
          >
            <span
              :class="[
                'size-5',
                {
                  'i-hugeicons:square-arrow-expand-01': !isExpanded,
                  'i-hugeicons:cancel-square': isExpanded,
                },
              ]"
            />
          </button>

        </div>

      </div>

      <TypeJsonEditor
        v-if="useMonaco()"
        v-model="output as string | undefined"
        :lang="isJson ? 'typescript' : 'json'"
        :options="{
          theme: 'hc-black',
          readOnly: true,
          matchBrackets: 'never',
          placeholder: `Nothing to show yet... Generate ${isJson ? 'Types' : 'Data'}.`,
          minimap: {
            enabled: false,
          },
          wordWrap: 'on',
          smoothScrolling: true,
          renderLineHighlight: 'none',
          autoDetectHighContrast: false,
          scrollBeyondLastColumn: 0,
          scrollBeyondLastLine: false,
          overviewRulerLanes: 0,
          scrollbar: {
            horizontal: 'hidden',
            vertical: 'hidden',
          },
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          automaticLayout: true,
          lineNumbersMinChars: 1,
          fontSize: 14,
            
        }"
        class="flex-auto"
      />

      <div
        v-else
        class="flex flex-auto flex-col items-center justify-center gap-2"
      >
        <span class="i-hugeicons:reload size-4 animate-spin" />
        <p class="text-sm">
          Loading Editor...
        </p>
      </div>

    </div>
    
  </section>

</template>

<script setup lang="ts">

const typeOrJson = ref<string>()
const instruction = ref<string>()
const isJson = ref(false)
const instructionTextarea = ref<HTMLTextAreaElement>()
const isCopied = ref(false)
const isExpanded = ref(false)

const { data: output, execute, status } = await useLazyAsyncData(
  'generate',
  () => $fetch('/api/generate', {
    body: {
      isJson: isJson.value,
      rawData: typeOrJson.value,
      instruction: instruction.value,
    },
    method: 'POST',
    timeout: 30000,
  }),
  { server: false, immediate: false },
)

function textareaAutoGrow() {
  if (!instructionTextarea.value) return

  instructionTextarea.value.style.height = 'auto'
  instructionTextarea.value.style.height = `${instructionTextarea.value.scrollHeight}px`
}

function copyOutput() {
  navigator.clipboard.writeText(output.value as string)
  isCopied.value = true
  setTimeout(() => isCopied.value = false, 2000)
}

</script>

<style scoped>
:deep(.monaco-editor) {
  transition: inherit !important;
}
</style>

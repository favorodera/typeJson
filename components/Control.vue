<template>
  <div
    v-if="isExpanded"
    class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
    @click="isExpanded = false"
  />
  
  <section class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,25rem),1fr))] gap-8">
   
    <div class="flex flex-col gap-2">
      
      <button
        type="button"
        class="w-max flex items-center gap-1 rounded-md px-2 py-1 duration-500 ease property-all active:scale-90 hover:bg-white hover:text-black"
        @click="() => {
          typeOrJson = ''
          clear()
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
          v-if="monaco"
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
            overviewRulerLanes: 1,
            stickyScroll: {
              enabled: false,
            },
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

        <div class="w-full flex items-end justify-between gap-2">

          <div
            v-if="hasEditorErrors"
            class="flex items-center gap-2 text-xs text-red-500"
          >
            <span class="i-hugeicons:alert-01 shrink-0" />
            <p>Errors in codebase</p>
          </div>

          <button
            type="button"
            :disabled="disableActionButton"
            class="ml-auto w-max b b-white rounded-md px-2 py-1 duration-500 ease property-all active:scale-90 disabled:cursor-not-allowed hover:bg-white hover:text-black"
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

      </div>

      <div class="flex items-start gap-2 b b-white rounded-lg pl-2">

        <span class="i-hugeicons:bot mt-2 size-6" />

        <textarea
          id="instruction"
          ref="instructionTextarea"
          v-model="instruction"
          name="instruction"
          placeholder="Instruction"
          rows="1"
          :disabled="status === 'pending'"
          class="max-h-25 grow-1 resize-none overflow-y-auto bg-transparent py-2 pr-2 text-sm outline-none placeholder-text-white/70"
          @input="textareaAutoGrow"
        />

      </div>

      <div
        v-if="error && error.data"
        class="flex items-center gap-2 text-sm text-red-500"
      >
        <span class="i-hugeicons:alert-01" />
        <p>
          {{ error.data.data.message }}
        </p>
      </div>

    </div>

    <div
      :class="{
        'fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 transform shadow-2xl': isExpanded,
        'relative': !isExpanded,
      }"
      class="min-h-lg flex flex-col justify-between gap-4 border border-white rounded-lg p-4 transition-all duration-300 ease"
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
        v-if="output"
        v-model="output"
        :lang="isJson ? 'typescript' : 'json'"
        :options="{
          theme: 'hc-black',
          readOnly: true,
          matchBrackets: 'never',
          stickyScroll: {
            enabled: false,
          },
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
        v-if="!monaco"
        class="flex flex-auto flex-col items-center justify-center gap-2 bg-black"
      >
        <span class="i-hugeicons:reload size-4 animate-spin" />
        <p class="text-sm">
          Loading Editor...
        </p>
      </div>

      <div
        v-if="!output && monaco"
        class="flex flex-auto flex-col items-center justify-center gap-2 bg-black"
      >
        <span
          class="size-5"
          :class="isJson ? 'i-hugeicons:typescript-01' : 'i-hugeicons:code'"
        />
        <p class="text-sm">
          {{ `Nothing to show yet... Generate ${isJson ? 'Types' : 'Data'}.` }}
        </p>
      </div>

    </div>
    
  </section>

</template>

<script setup lang="ts">
import type { AsyncData, NuxtError } from '#app'

const typeOrJson = ref<string>()
const instruction = ref<string>()
const isJson = ref(false)
const instructionTextarea = ref<HTMLTextAreaElement>()
const isCopied = ref(false)
const isExpanded = ref(false)
const tempInstruction = ref<string>()
const hasEditorErrors = ref(false)
const monaco = useMonaco()

const { data: output, execute, status, error, clear } = await useAsyncData(
  'generate',
  () => $fetch('/api/generate', {
    body: {
      isJson: isJson.value,
      rawData: `\`\`\`${isJson.value ? 'json' : 'ts'}\n${typeOrJson.value}\n\`\`\``,
      instruction: instruction.value,
    },
    method: 'POST',
    timeout: 30000,
  }),
  { server: false, immediate: false },
) as AsyncData<string, NuxtError<{
  statusMessage: string
  statusCode: number
  stack: Array<unknown>
  data: { code: string, message: string }
}>>

const disableActionButton = computed(() =>
  (status.value === 'pending')
  || (!instruction.value && !typeOrJson.value)
  || hasEditorErrors.value,
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

onMounted(async () => {
  const editor = monaco?.editor
  
  const disposable = editor?.onDidChangeMarkers(() => {
    const markers = editor?.getModelMarkers({})
    hasEditorErrors.value = markers.some(marker =>
      marker.severity === monaco?.MarkerSeverity.Error,
    )
  })

  onBeforeUnmount(() => disposable?.dispose())
})

watch(status, (newStatus) => {

  if (newStatus === 'pending') {

    tempInstruction.value = instruction.value
    instruction.value = undefined
  }
  else if (newStatus === 'error') {
    instruction.value = tempInstruction.value

  }
})

</script>

<style scoped>
:deep(.monaco-editor) {
  transition: inherit !important;
}
</style>

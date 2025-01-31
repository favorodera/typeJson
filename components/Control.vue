<template>

  <section class="flex flex-wrap items-center justify-center gap-8">
   
    <div class="flex shrink-1 grow-1 basis-[18rem] flex-col gap-2">
      
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

        <div class="flex items-center justify-between">

          <textarea
            id="command"
            v-model="command"
            name="command"
            placeholder="/command"
            rows="1"
            class="resize-none b b-white rounded-lg bg-transparent p-2 text-sm outline-none placeholder-text-white/70"
          />

          <button
            type="button"
            class="w-max self-end b b-white rounded-md px-2 py-1 duration-500 ease property-all active:scale-90 hover:bg-white hover:text-black"
          >
            Generate
          </button>

        </div>

      </div>

    </div>

    <div class="min-h-lg flex flex flex-auto shrink-1 grow-1 basis-[18rem] flex-col justify-between gap-4 b b-white rounded-lg p-4">

      <TypeJsonEditor
        v-if="useMonaco()"
        v-model="output"
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

const output = ref('')
const typeOrJson = ref('')
const command = ref('')
const isJson = ref(false)

</script>

<style scoped lang="css">

</style>

<template>

  <section class="flex flex-wrap items-center justify-center gap-8">

    <div class="min-h-md flex shrink-1 grow-1 basis-[18rem] flex-col justify-between gap-4 b b-white rounded-lg p-4">

      <textarea
        id="type-or-json"
        v-model="typeOrJson"
        name="type-or-json"
        :placeholder="isJson ? 'Your JSON data here ' : 'Your Interface or type here '"
        class="flex-auto resize-none bg-transparent outline-none placeholder-text-white/70"
      />

      <div class="flex items-center justify-between">

        <button
          type="button"
          class="w-max flex items-center gap-2 rounded-md px-2 py-1 duration-500 ease property-all active:scale-90 hover:bg-white hover:text-black"
          @click="isJson = !isJson"
        >
          <span class="i-hugeicons:arrow-left-right size-4" />
        </button>

        <textarea
          id="command"
          v-model="command"
          name="command"
          placeholder="/command"
          rows="1"
          class="resize-none b b-white rounded-lg bg-transparent p-2 outline-none placeholder-text-white/70"
        />

      </div>

    </div>

    <div
      class="min-h-lg flex shrink-1 grow-1 basis-[18rem] flex-col justify-between gap-4 b b-white rounded-lg p-4"
    >

      <output
        class="flex flex-auto"
        :class="{
          'justify-center items-center': output === '',
        }"
      >

        {{ output }}

        <p
          v-if="output === ''"
          class="text-center text-sm op-80"
        >
          Nothing to show yet.
          <br>
          Generate data or type.
        </p>
        
      </output>

      <button
        type="button"
        class="w-max self-end b b-white rounded-md px-2 py-1 duration-500 ease property-all active:scale-90 hover:bg-white hover:text-black"
      >
        Generate
      </button>

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

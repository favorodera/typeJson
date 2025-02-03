<template>
  <main class="w-full flex flex-auto flex-col justify-center gap-12">

    <Header />

    <Control />

    <Footer />

  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'typeJson',
  ogType: 'website',
  ogUrl: 'https://type-json.vercel.app/',
  ogTitle: 'typeJson',
  ogDescription: 'Convert JSON to Typescript and Typescript to JSON',
  description: 'Convert JSON to Typescript and Typescript to JSON',
  twitterTitle: 'typeJson',
  twitterDescription: 'Convert JSON to Typescript and Typescript to JSON',
  ogImage: {
    url: 'https://type-json.vercel.app/images/webpage-screenshot.png',
    type: 'image/png',
    height: '630',
    width: '1200',
    alt: 'image',
  },
  twitterImage: {
    url: 'https://type-json.vercel.app/images/webpage-screenshot.png',
    type: 'image/png',
    height: '630',
    width: '1200',
    alt: 'image',
  },
  twitterCard: 'summary_large_image',
  twitterSite: '@favorodera',
  twitterCreator: '@favorodera',
  robots: 'index, follow',
  author: 'Favour Emeka',
  keywords: 'type-json, typeJson, mock , data, json-converter, type-converter, type-to-json, json-to-type',
  themeColor: '#000000',
  applicationName: 'typeJson',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Website',
        'name': 'typeJson',
        'url': 'https://type-json.vercel.app/',
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+234 802 438 3756',
          'email': 'favorodera@gmail.com',
          'contactType': 'customer service',
          'availableLanguage': 'en',
        },
      }),
    },
  ],
})
</script>

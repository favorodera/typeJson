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
  ogImage: {
    url: 'https://examine-app.vercel.app/images/hero-image.png',
    type: 'image/png',
    height: '630',
    width: '1200',
    alt: 'image',
  },
  twitterImage: {
    url: 'https://examine-app.vercel.app/images/hero-image.png',
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
  keywords: 'exam,assessment,exam management,assessment management, examine, cbt',
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
        'url': 'https://examine-app.vercel.app/',
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

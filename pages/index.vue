<template>
  <h1>Records</h1>
  <ul>
    <li v-for="d in data.records">
      {{ d.formated }}
      <ul>
        <li v-for="s in d.symbols">
          <NuxtLink :to="`/thatday/${d.name}/symbol/${s.code}`" target="_blank">{{ s.code }}： {{ s.name }}</NuxtLink>
        </li>
      </ul>
    </li>
  </ul>
</template>
<script setup>
  const { data } = await useFetch("/api/record");
</script>

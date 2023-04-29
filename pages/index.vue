<template>
  <h1>Records</h1>
  <ul>
    <li v-for="d in data.records">
      {{ d.name }}
      <ul>
        <li v-for="s in d.files">
          <NuxtLink :to="`/thatday/${d.name}/symbol/${s.name}`">{{ s.name }}</NuxtLink>
        </li>
      </ul>
    </li>
  </ul>
</template>
<script setup>
  const { data } = await useFetch("/api/record");
</script>

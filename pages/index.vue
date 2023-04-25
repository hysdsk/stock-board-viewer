<template>
  <h1>Index</h1>
  <ul>
    <li v-for="a in arr">{{ a }}</li>
  </ul>
</template>
<script setup>
  import { readdir } from 'node:fs';
  const arr = []
  readdir("/mnt/c/Users/hysds/Documents/GitHub/algorithm-trade/testdata", (err, files) => {
    // if (err) {
    //   console.error(err);
    //   return;
    // }
    for (const file of files) {
      if (file.match(/[0-9]{8}/)) {
        arr.push(file)
      }
    }
  })
</script>

<script setup>
import { ref, onMounted } from "vue";
import api from "./api"; // chemin vers ton api.js

const message = ref("Loading...");

onMounted(async () => {
  try {
    const response = await api.get("hello/"); // endpoint Django
    message.value = response.data.message;
  } catch (error) {
    message.value = "Erreur API : " + error;
    console.error(error);
  }
});
</script>

<template>
  <div class="p-6 text-center">
    <h1 class="text-2xl font-bold">Vue ↔ Django Test</h1>
    <p class="mt-4 text-gray-700">{{ message }}</p>
  </div>
</template>

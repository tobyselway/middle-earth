<template>
  <div class="min-h-screen w-full bg-crust text-text" :class="theme">
    <div class="flex items-center justify-between gap-3 py-2 bg-mantle shadow-lg px-4">
      <div>
        <h1 class="leading-tight text-text font-bold tracking-snug text-xl flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <span class="ml-1">
            Shire
          </span>
        </h1>
        <p class="leading-tight' text-surface2 text-sm font-base">
          Second Breakfast
        </p>
      </div>
      <div>
        <input type="search" class="text-sm rounded-full px-3 py-1 bg-surface0"  placeholder="Search party" />
      </div>
      <select v-model="theme" class="bg-crust rounded p-1">
        <option v-for="(name, key) in themes" :value="key">
          {{name}}
        </option>
      </select>
    </div>
    <div class="py-4">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup>
const themes = ref({
  latte: "Latte",
  frappe: "Frappe",
  macchiato: "Macchiato",
  mocha: "Mocha",
});

const theme = ref("latte");
</script>

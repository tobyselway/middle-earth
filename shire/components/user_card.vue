<template>
    <div class="flex gap-2">
        <img class="w-10 h-10 rounded-full object-cover" :src="user.avatar ?? '/img/cat.webp'" alt="avatar" />
        <p class="font-semibold tracking-snug">{{ user.name ?? 'NAME' }}</p>
    </div>
</template>

<script setup lang="js">
    const { user } = defineProps(['user']);
</script>

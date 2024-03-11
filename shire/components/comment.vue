<template>
    <div class="rounded-lg p-3 bg-mantle shadow">

            <UserCard :user="comment.commenter ?? defaultUser" />

            <div class="ml-10">
                {{ comment.body ?? 'BODY' }}
            </div>
            
            <div class="mt-1 flex items-center justify-end">
                <button class="bg-sapphire text-sm font-bold tracking-tight text-white px-2 py-1 rounded"> {{ comment.likes?.count ?? 'LIKES' }}   👍 </button>
            </div>
            
    </div>
</template>

<script setup lang="js">
    const { comment } = defineProps(['comment']);

    const defaultUser = { 
        name: "NAME",
        avatar: "cat.webp",
    };
</script>

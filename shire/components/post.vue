<template>
    <div class="p-4 rounded-lg bg-base shadow-lg w-full"> 
        <UserCard :user="post.poster ?? defaultUser" />
        <div class="p-2">
            {{ post.body ?? 'BODY' }}
        </div>
        <div class="flex items-center justify-end rounded">
            <div>
                <button class="bg-mauve text-sm font-bold tracking-tight text-white px-2 py-1 rounded"> {{ post?.likes?.count ?? "LIKES" }}   👍 </button>
            </div>
        </div>
        <div class="flex flex-col mt-4 gap-4">
            
            <Comment v-for="comment in post.comments ?? [ exampleComment ]"
             :key="comment.id" 
             :comment="comment"
            />
            
        </div>
    </div>
</template>

<script setup lang="js">
    const { post } = defineProps(['post']);

    const defaultUser = { 
        name: "NAME",
        avatar: "cat.webp",
    };

    const exampleComment = {   
        id: "0",
        body: "COMMENT BODY",
        likes: {
            count: "LIKES",
        },
        commenter: defaultUser,
    };
</script>

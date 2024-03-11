<template>
    <div class="flex flex-col items-center w-2/3 gap-6 mx-auto">
        <Post v-for="post in res.posts" :post="post" :key="post.id" />
    </div>
</template>
<script setup>
const query = gql`
  query {
    posts {
      id
      body
      likes {
        count
      }
      poster {
        id
        name
        avatar
      }
      comments {
        id
        body
        likes {
          count
        }
        commenter {
          id
          name
          avatar
        }
      }
    }
  }
`;
const res = (await useAsyncQuery(query)).data;
</script>

<route lang="yaml">
name: home
meta:
  title: Home
  icon: ant-design:home-twotone
</route>

<script setup lang="ts">
ref({
  imageVisible: false,
  index: 0,
})
function open(url: string) {
  window.open(url, '_blank')
}
</script>

<template>
  <div>
    <PageHeader>
      <template #title>
        <div class="flex items-center gap-4">
          Welcome to the SecuFlow Prototype
        </div>
      </template>

      <HButton outline @click="open('https://fantastic-admin.hurui.me')">
        <SvgIcon name="i-ri:file-text-line" />
        Doc
      </HButton>
      <HDropdownMenu
        :items="[
          [
            { label: 'Github', handle: () => open('https://github.cs.adelaide.edu.au/SecuFlow-PG1') },
          ],
        ]"
      >
        <HButton class="ml-2">
          <SvgIcon name="i-ri:code-s-slash-line" />
          Repo
          <SvgIcon name="i-ep:arrow-down" />
        </HButton>
      </HDropdownMenu>
    </PageHeader>
    <PageMain title="User Case1">
      <div class="question">
        <ol class="answer">
          <li><span>Goal: </span>The security analyst accesses the data related to team coordination between developers and security engineers.</li>
          <li><span>Actors: </span>Security Analyst</li>
          <li>
            <span>Main Flow:</span>
            <ul>
              <li>
                <span>The data related to commit logs and repository interactions
                  has been mined and stored.</span>
              </li>
              <li><span>The security analyst logs into SecuFlow Miner.</span></li>
              <li><span>The security analyst navigates to the “Projects" section.</span></li>
              <li>
                <span>The system retrieves and displays a list of available project datasets related to team interactions.
                </span>
              </li>
              <li>
                <span>The security analyst selects the project/repository they want to analyse.
                </span>
              </li>
              <li>
                <span>Postconditions: The selected project is displayed for further analysis.
                </span>
              </li>
            </ul>
          </li>
        </ol>
      </div>
    </PageMain>
  </div>
</template>

<style scoped>
.text-emphasis {
  text-emphasis-style: "❤";
}

.ecology {
  --uno: flex-1 m-0;

  :deep(.title-container) {
    --uno: flex items-center justify-between flex-wrap gap-4;

    .title-info {
      --uno: flex items-center gap-4;

      img {
        --uno: block w-12 h-12;
      }

      h1 {
        --uno: m-0 text-2xl;
      }

      h2 {
        --uno: m-0 text-base text-stone-5 font-normal;
      }
    }
  }
}

.question {
  .answer {
    --uno: m-0 pl-6 text-stone-5;

    li {
      --uno: mb-2 lh-6 last:mb-0;
    }

    span {
      --uno: text-stone-7 dark-text-stone-3 font-bold;
    }
  }
}
</style>

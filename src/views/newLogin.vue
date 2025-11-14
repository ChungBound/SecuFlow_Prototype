<route lang="yaml">
  meta:
  title: Login
  constant: true
  layout: false
  </route>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import useSettingsStore from '@/store/modules/settings'
import Copyright from '@/layouts/components/Copyright/index.vue'
import useUserStore from '@/store/modules/user.ts'

defineOptions({
  name: 'Login',
})

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
const redirect = ref(route.query.redirect?.toString() ?? settingsStore.settings.home.fullPath)
const account = ref<string>()
// 表单类型
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref({
  account: account.value ?? localStorage.login_account ?? '',
  password: '',
})

const rules = ref<FormRules>({
  account: [
    { required: true, trigger: 'blur', message: 'username required' },
  ],
  password: [
    { required: true, trigger: 'blur', message: 'password required' },
    { min: 6, max: 18, trigger: 'blur', message: 'password required to be 6-18 length' },
  ],
})

async function handleLogin() {
  try {
    await formRef.value?.validate()
    loading.value = true
    await userStore.login(form.value)
    if (form.value.remember) {
      localStorage.setItem('login_account', form.value.account)
    }
    else {
      localStorage.removeItem('login_account')
    }
    await router.push(redirect.value)
  }
  catch (error) {
    console.error('Login failed:', error)
    // Here you might want to show an error message to the user
  }
  finally {
    loading.value = false
  }
}

function testAccount(account: string) {
  form.value.account = account
  form.value.password = '123456'
  handleLogin()
}
</script>

<template>
  <div class="bg-container">
    <!-- 静止球体背景 -->
    <div class="bg-sphere" />
    <!-- 动态星星背景 -->
    <div class="bg-stars" />

    <div class="left-box">
      <div class="title-box">
        WELCOME TO SECUFLOW MINER
      </div>
    </div>

    <div class="right-box">
      <div class="login-form">
        <ElForm ref="formRef" :model="form" :rules="rules" class="w-full flex-col-stretch-center p-14">
          <div>
            <ElFormItem prop="account">
              <ElInput v-model="form.account" class="input-text" placeholder="Username" type="text" tabindex="1" style="width: 17vw;" />
            </ElFormItem>
            <ElFormItem prop="password">
              <ElInput v-model="form.password" class="input-text" type="password" placeholder="Password" tabindex="2" show-password style="width: 17vw;" @keyup.enter="handleLogin" />
            </ElFormItem>
          </div>
          <HButton class="btn" :loading="loading" type="primary" size="large" style="width: 100%;" @click.prevent="handleLogin">
            LOGIN
          </HButton>

          <HButton class="btn mt-4" :loading="loading" type="primary" size="large" style="width: 100%;" @click.prevent="testAccount('admin')">
            QUICK-LOGIN
          </HButton>
        </ElForm>
      </div>
    </div>
  </div>
  <Copyright />
</template>

  <style scoped>
  @font-face {
    font-family: "BAUHS93";
    src: local("BAUHS93"), url("@/assets/BAUHS93/BAUHS93.woff") format("woff");
  }

  .bg-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .bg-sphere {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: -1;
    width: 100%;
    height: 100%;
    background: url("../assets/images/sphere.svg") no-repeat center center;
    background-size: cover;
    transform: translate(-50%, -50%);
  }

  .bg-stars {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: -2;
    width: 100%;
    height: 100%;
    background: url("../assets/images/star.svg") no-repeat center center;
    background-size: cover;
    animation: starZoom 50s infinite ease-in-out;
  }

  @keyframes starZoom {
    0% {
      transform: translate(-50%, -50%) scale(1);
    }

    50% {
      transform: translate(-50%, -50%) scale(2); /* 放大到1.2倍 */
    }

    100% {
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .left-box {
    position: absolute;
    top: 30vh;
    left: 10vw;

    .title-box {
      font-family: "BAUHS93";
      font-size: 3rem;
      font-weight: 900;
      color: #333;
      text-shadow: 2px 2px 4px rgb(0 0 0 / 10%);
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.75;
    }
  }

  .right-box {
    position: absolute;
    top: 25vh;
    right: 5vw;

    .input-text :deep(.el-input__wrapper) {
      color: white;
      background-color: rgb(51 51 51 / 30%);
      border-radius: 1.375rem !important;
      box-shadow: rgb(60 64 67 / 30%) 0 1px 2px 0, rgb(60 64 67 / 30%) 0 2px 6px 2px;
    }

    .input-text :deep(.el-input__inner) {
      padding-left: 1vw;
      color: white;
    }

    .input-text :deep(.el-input__inner::placeholder) {
      color: white;
    }

    .btn {
      justify-content: center;
      background-color: rgb(94 164 188 / 60%);
      border-radius: 1.375rem;
      box-shadow: rgb(60 64 67 / 30%) 0 1px 2px 0, rgb(60 64 67 / 30%) 0 2px 6px 2px;
    }
  }

  .copyright {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 20px;
    margin: 0;
  }
  </style>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import useUserStore from '@/store/modules/user'

defineOptions({
  name: 'LoginForm',
})

const props = defineProps<{
  account?: string
}>()

const emits = defineEmits<{
  onLogin: [account: string]
  onRegister: [account: string]
  onResetPassword: [account: string]
}>()

const userStore = useUserStore()

const title = import.meta.env.VITE_APP_TITLE
const loading = ref(false)

// 登录方式，default 账号密码登录，qrcode 扫码登录
const type = ref('default')
const formRef = ref<FormInstance>()
const form = ref({
  account: props.account ?? localStorage.login_account ?? '',
  password: '',
  remember: !!localStorage.login_account,
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
function handleLogin() {
  formRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true
      userStore.login(form.value).then(() => {
        if (form.value.remember) {
          localStorage.setItem('login_account', form.value.account)
        }
        else {
          localStorage.removeItem('login_account')
        }
        emits('onLogin', form.value.account)
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

function testAccount(account: string) {
  form.value.account = account
  form.value.password = '123456'
  handleLogin()
}
</script>

<template>
  <ElForm ref="formRef" :model="form" :rules="rules" class="min-h-500px w-full flex-col-stretch-center p-12">
    <div class="mb-6">
      <!--      <HTabList -->
      <!--        v-model="type" :options="[ -->
      <!--          { label: '账号密码登录', value: 'default' }, -->
      <!--          { label: '扫码登录', value: 'qrcode' }, -->
      <!--        ]" -->
      <!--      /> -->
    </div>
    <template v-if="type === 'default'">
      <h3 class="mb-8 text-xl color-[var(--el-text-color-primary)] font-bold">
        Welcome to {{ title }} ! 👋🏻
      </h3>
      <div>
        <ElFormItem prop="account">
          <ElInput v-model="form.account" placeholder="Username" type="text" tabindex="1">
            <template #prefix>
              <SvgIcon name="i-ri:user-3-fill" />
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem prop="password">
          <ElInput v-model="form.password" type="password" placeholder="password" tabindex="2" show-password @keyup.enter="handleLogin">
            <template #prefix>
              <SvgIcon name="i-ri:lock-2-fill" />
            </template>
          </ElInput>
        </ElFormItem>
      </div>
      <div class="mb-4 flex-center-between">
        <ElCheckbox v-model="form.remember">
          remember me
        </ElCheckbox>
        <ElLink type="primary" :underline="false" @click="emits('onResetPassword', form.account)">
          forget the password?
        </ElLink>
      </div>
      <ElButton :loading="loading" type="primary" size="large" style="width: 100%;" @click.prevent="handleLogin">
        LOGIN
      </ElButton>
      <!--      <div class="mt-4 flex-center gap-2 text-sm color-[var(&#45;&#45;el-text-color-secondary)]"> -->
      <!--        还没有帐号? -->
      <!--        <ElLink type="primary" :underline="false" @click="emits('onRegister', form.account)"> -->
      <!--          创建新帐号 -->
      <!--        </ElLink> -->
      <!--      </div> -->
    </template>
    <template v-else-if="type === 'qrcode'">
      <div class="flex-col-center">
        <el-image src="https://s2.loli.net/2024/04/26/GsahtuIZ9XOg5jr.png" class="h-[250px] w-[250px]" />
        <div class="mt-2 op-50">
          请使用微信扫码登录
        </div>
      </div>
    </template>
    <div class="mt-4 text-center -mb-4">
      <ElDivider>Quick login for demo accounts</ElDivider>
      <ElButton type="primary" size="small" plain @click="testAccount('admin')">
        admin
      </ElButton>
      <ElButton size="small" plain @click="testAccount('test')">
        test
      </ElButton>
    </div>
  </ElForm>
</template>

<style scoped>
:deep(input[type="password"]::-ms-reveal) {
  display: none;
}

.el-form-item {
  margin-bottom: 24px;

  :deep(.el-input) {
    width: 100%;
    height: 48px;
    line-height: inherit;

    input {
      height: 48px;
    }

    .el-input__prefix,
    .el-input__suffix {
      display: flex;
      align-items: center;
    }

    .el-input__prefix {
      left: 10px;
    }

    .el-input__suffix {
      right: 10px;
    }
  }
}

:deep(.el-divider__text) {
  white-space: nowrap;
  background-color: var(--g-container-bg);
}
</style>

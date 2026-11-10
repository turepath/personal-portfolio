<template>
  <div class="w-full max-w-xl mx-auto ">
      <div class="rounded-xl p-3 shadow-lg space-y-4">

          <div class="grid grid-cols-12 gap-3 items-center">
              <div class="col-span-2 text-right">
                  <span class="font-medium text-sm">用户名：</span>
              </div>
              <div class="col-span-6">
                  <input 
                    v-model="username"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white placeholder-gray-400"
                    placeholder="用户名"
                  />
              </div>
          </div>

          <div class="grid grid-cols-12 gap-3 items-center">
              <div class="col-span-2 text-right">
                  <span class="font-medium text-sm">密码：</span>
              </div>
              <div class="col-span-6">
                  <input v-model="password" type="password"
                      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white placeholder-gray-400"
                      placeholder="请输入密码" />
              </div>
              <div class="col-span-4">
                  <button @click="handleLogin"
                      class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                      登录
                  </button>
              </div>
          </div>

      </div>
  </div>
</template>

<script>
export default {
  props: ['cameraId'],
  // 其余代码保持不变
}
</script>
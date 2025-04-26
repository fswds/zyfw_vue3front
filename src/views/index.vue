<template>
  <div class="app-container home">
    <div class="wallpage"></div>
  </div>
</template>
<script setup>
import useUserStore from "@/store/modules/user.js";
import {useRouter} from "vue-router";
import Cookies from "js-cookie";

const router = useRouter()
const userInfo = useUserStore()

function init() {
 if (userInfo.roles.findIndex(item => item == 'common') > -1 && Cookies.get('allowAdminIndex') == "false") {
    router.push('/userIndex');
  }
}

init()
</script>
<style lang="scss" scoped>
.wallpage {
  width: 100vw;
  height: 80vh;
  text-align: center;
  background: url("../assets/images/zyz.png") no-repeat;
  background-size: contain;
}
</style>


<template>
  <div class="register">
    <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
      <h3 class="title">{{ settings.title }}注册</h3>
      <el-form-item prop="username">
        <el-input
            v-model="registerForm.username"
            type="text"
            size="large"
            auto-complete="off"
            placeholder="账号"
        >
          <template #prefix>
            <svg-icon icon-class="user" class="el-input__icon input-icon"/>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="roleId">
        <el-select v-model="registerForm.roleId" placeholder="请选择用户角色"
                   style="width: 100%">
          <el-option
              v-for="item in roleOptions"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="registerForm.roleId===3" prop="organizationId">
        <el-select v-model="registerForm.organizationId" placeholder="请选择组织"
                   style="width: 100%">
          <el-option
              v-for="item in orgOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
            v-model="registerForm.password"
            type="password"
            size="large"
            auto-complete="off"
            placeholder="密码"
            @keyup.enter="handleRegister"
        >
          <template #prefix>
            <svg-icon icon-class="password" class="el-input__icon input-icon"/>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            size="large"
            auto-complete="off"
            placeholder="确认密码"
            @keyup.enter="handleRegister"
        >
          <template #prefix>
            <svg-icon icon-class="password" class="el-input__icon input-icon"/>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
            size="large"
            v-model="registerForm.code"
            auto-complete="off"
            placeholder="验证码"
            style="width: 63%"
            @keyup.enter="handleRegister"
        >
          <template #prefix>
            <svg-icon icon-class="validCode" class="el-input__icon input-icon"/>
          </template>
        </el-input>
        <div class="register-code">
          <img :src="codeUrl" @click="getCode" class="register-code-img"/>
        </div>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button
            :loading="loading"
            size="large"
            type="primary"
            style="width:100%;"
            @click.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right;">
          <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-register-footer">
      <span>Copyright © 2025 {{ settings.title }} All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import settings from "@/settings"
import {ElMessageBox} from "element-plus";
import {getCodeImg, register} from "@/api/login";
import {listRole} from "@/api/system/role.js";
import {listOrganization} from "@/api/system/organization.js";
import {useRouter} from "vue-router";

const router = useRouter();
const {proxy} = getCurrentInstance();

const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  roleId: 2,
  organizationId: "",
  code: "",
  uuid: ""
});

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const registerRules = {
  username: [
    {required: true, trigger: "blur", message: "请输入您的账号"},
    {min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur"}
  ],
  password: [
    {required: true, trigger: "blur", message: "请输入您的密码"},
    {min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur"}
  ],
  confirmPassword: [
    {required: true, trigger: "blur", message: "请再次输入您的密码"},
    {required: true, validator: equalToPassword, trigger: "blur"}
  ],
  code: [{required: true, trigger: "change", message: "请输入验证码"}]
};

const codeUrl = ref("");
const loading = ref(false);
const captchaEnabled = ref(true);

let roleOptions = ref([])
let orgOptions = ref([])

function listRoleOption() {
  listRole().then(res => {
    roleOptions.value = res.rows.filter(item => (item.roleKey != 'admin' && item.roleKey != 'admin2'&&item.roleKey != 'volunteer'))
  })
}

function listOrgOption() {
  listOrganization().then(response => {
    orgOptions.value = response.rows;
  })
}

function handleRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true;
      if (registerForm.value.roleId != 3) {
        registerForm.value.organizationId = ""
      }
      registerForm.value.roleIds = [registerForm.value.roleId]
      register(registerForm.value).then(res => {
        const username = registerForm.value.username;
        ElMessageBox.alert(
          `<div class="success-message">
            <div class="success-icon">✓</div>
            <div class="success-title">注册成功</div>
            <div class="success-content">恭喜您，账号 <span class="username">${username}</span> 已成功注册！</div>
            <div class="success-tip">即将跳转到登录页面...</div>
          </div>`, 
          "系统提示", 
          {
            dangerouslyUseHTMLString: true,
            type: "success",
            customClass: 'register-success-dialog',
            confirmButtonText: '立即登录',
            callback: () => {
              router.push("/login");
            }
          }
        );
      }).catch(() => {
        loading.value = false;
        if (captchaEnabled) {
          getCode();
        }
      });
    }
  });
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      registerForm.value.uuid = res.uuid;
    }
  });
}

listOrgOption()
getCode();
listRoleOption()
</script>

<style lang='scss' scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color:#4AB7BD;
  background-image: url('../assets/login/register.jpg');
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #000;
}

.register-form {
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.45);
  width: 400px;
  padding: 25px 25px 5px 25px;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  .el-input {
    height: 40px;

    input {
      height: 40px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}

.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.register-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.register-code-img {
  height: 40px;
  padding-left: 12px;
}

:deep(.register-success-dialog) {
  .el-message-box__header {
    padding: 20px;
    background: linear-gradient(135deg, #4AB7BD, #2d5299);
    border-radius: 8px 8px 0 0;
    
    .el-message-box__title {
      color: #fff;
      font-size: 20px;
      font-weight: 600;
    }
    
    .el-message-box__headerbtn .el-message-box__close {
      color: #fff;
    }
  }

  .el-message-box__content {
    padding: 30px 20px;
  }

  .el-message-box__btns {
    padding: 10px 20px 20px;
    
    .el-button {
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 8px;
      background: linear-gradient(135deg, #4AB7BD, #2d5299);
      border: none;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(45, 82, 153, 0.2);
      }
    }
  }
}

:deep(.success-message) {
  text-align: center;
  padding: 20px 0;

  .success-icon {
    width: 60px;
    height: 60px;
    line-height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4AB7BD, #2d5299);
    color: #fff;
    font-size: 36px;
    margin: 0 auto 20px;
    animation: scaleIn 0.5s ease;
  }

  .success-title {
    font-size: 24px;
    font-weight: 600;
    color: #2d5299;
    margin-bottom: 15px;
  }

  .success-content {
    font-size: 16px;
    color: #606266;
    margin-bottom: 15px;
    line-height: 1.6;

    .username {
      color: #4AB7BD;
      font-weight: 600;
      font-size: 18px;
    }
  }

  .success-tip {
    font-size: 14px;
    color: #909399;
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

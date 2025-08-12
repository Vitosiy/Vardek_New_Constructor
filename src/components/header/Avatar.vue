<template>
  <div class="avatar-helper" @click="toggleDropdown">

    <div v-if="authStore.userData.avatar" class="avatar-image" :style="imageStyle">
      <div v-if="badgeCount" class="avatar-badge count">
        {{ badgeCount }}
      </div>
    </div>
    
    <div v-else class="avatar-initials" :style="initialsStyle">
      {{ authStore.userInitials }}
    </div>
    
    <div class="avatar-status" :class="authStore.userData.status"></div>
    
    <transition name="fade">
      <div v-if="showDropdown" class="avatar-dropdown">
        <div class="dropdown-item" @click.stop="handleLogout">
          <LogoutSVG class="dropdown-icon" />
          Выйти
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import LogoutSVG from '@/components/ui/svg/auth/LogoutSVG.vue'
import { useAuthStore } from '@/store/appStore/authStore'

const authStore = useAuthStore()

// Состояние компонента
const showDropdown = ref(false)
const badgeCount = ref(3)

// Вычисляемые свойства
const imageStyle = computed(() => ({
  backgroundImage: `url(${authStore.userData.avatar})`,
  width: '48px',
  height: '48px'
}))

const initialsStyle = computed(() => ({
  backgroundColor: '#4a6cf7',
  color: '#ffffff',
  width: '48px',
  height: '48px',
  fontSize: '18px'
}))

// Методы компонента
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    closeDropdown()
  } catch (error) {
    console.error('Ошибка при выходе:', error)
  }
}

// Обработчик клика вне компонента
const clickOutsideHandler = (event: MouseEvent) => {
  const target = event.target as Element | null
  if (!target?.closest('.avatar-helper')) {
    closeDropdown()
  }
}

// Хуки жизненного цикла
onMounted(() => {
  // Загружаем данные пользователя, если они еще не загружены
  if (!authStore.userData.name) {
    authStore.fetchUserData()
  }
  document.addEventListener('click', clickOutsideHandler)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', clickOutsideHandler)
})
</script>
<style scoped>
.avatar-helper {
  position: relative;
  display: inline-block;
  cursor: pointer;
  user-select: none;
  margin-left: 16px;
}

.avatar-image, .avatar-initials {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.avatar-image:hover, .avatar-initials:hover {
  transform: scale(1.05);
}

.avatar-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  border-radius: 50%;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  background-color: #ff4757;
  padding: 0 4px;
}

.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.avatar-status.online {
  background-color: #2ed573;
}

.avatar-status.offline {
  background-color: #a4b0be;
}

.avatar-status.busy {
  background-color: #ff4757;
}

.avatar-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  color: #64748b;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
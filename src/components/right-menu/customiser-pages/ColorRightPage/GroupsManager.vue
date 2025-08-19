<script setup lang="ts">
import { ref } from 'vue'

const groups = ref([
  { id: 1, name: 'Группа 1', color: '#FF0000', items: [] },
  { id: 2, name: 'Группа 2', color: '#B9AF27', items: [] }
])

const deleteGroup = (groupId: number) => {
  groups.value = groups.value.filter(group => group.id !== groupId)
}

const addToGroup = (groupId: number) => {
  // Логика добавления элемента в группу
  console.log('Добавить в группу:', groupId)
}

const removeFromGroup = (groupId: number) => {
  // Логика удаления элемента из группы
  console.log('Убрать из группы:', groupId)
}

const createNewGroup = () => {
  const newId = Math.max(...groups.value.map(g => g.id)) + 1
  const colors = ['#FF0000', '#B9AF27', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  
  groups.value.push({
    id: newId,
    name: `Группа ${newId}`,
    color: randomColor,
    items: []
  })
}
</script>

<template>
  <div :class="$style.groupsManager">
    <div :class="$style.groupsList">
      <div 
        v-for="group in groups" 
        :key="group.id" 
        :class="$style.groupItem"
      >
        <div :class="$style.groupHeader">
          <div :class="$style.groupDot" :style="{ backgroundColor: group.color }"></div>
          <span :class="$style.groupName">{{ group.name }}</span>
        </div>
        <div :class="$style.groupActions">
          <button :class="[$style.actionBtn, $style.deleteBtn]" @click="deleteGroup(group.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Удалить
          </button>
          <div :class="$style.groupButtons"><button :class="$style.actionBtn" @click="addToGroup(group.id)">
            Добавить
          </button>
          <button :class="$style.actionBtn" @click="removeFromGroup(group.id)">
            Убрать
          </button></div>
        </div>
      </div>
    </div>
    
    <button :class="$style.createGroupBtn" @click="createNewGroup">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Создать новую группу
    </button>
  </div>
</template>

<style module lang="scss">
.groupsManager {
  
  .groupsList {
    margin-bottom: 20px;
  }
  
  .groupItem {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    background: transparent;
  }
  
  .groupHeader { 
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .groupDot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  
  .groupName {
    font-size: 16px;
    font-weight: 500;
    color: $black;
  }
  
  .groupActions {
    display: flex;
    gap: 10px;
  }
  
  .actionBtn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 12px 15px;
    border: none;
    background: $bg;
    color: $strong-grey;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background: $light-grey;
    }
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
  
  .createGroupBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    gap: 10px;
    width: 100%;
    padding: 15px;
    border-radius: 15px;
    background: $bg;
    color: $strong-grey;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: $light-grey;
    }
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
}
.groupButtons {
    display: flex;
    .actionBtn {
        border-radius: 0;
        &:first-child {
            border-top-left-radius: 15px;
            border-bottom-left-radius: 15px;
        }
        &:last-child {
            border-top-right-radius: 15px;
            border-bottom-right-radius: 15px;
        }
    }
}
.actionBtn.deleteBtn {
    background: transparent;
    color: $dark-stroke;
    border-radius: 15px;
}
</style> 
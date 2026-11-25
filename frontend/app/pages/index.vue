<script setup lang="ts">
import type { Board } from '~/types/board'
import { LogIn as LogInIcon, LogOut as LogOutIcon, Pencil as PencilIcon, Plus as PlusIcon, Trash2 as TrashIcon, UserRound as UserRoundIcon } from '@lucide/vue'

// Overview of my boards: open, create, rename and delete them.
const { boards, load, addBoard, renameBoard, removeBoard } = useBoards()
// Only logged-in people have boards, so the boards are loaded after the user.
const { user, load: loadUser, login, logout } = useAuth()
await loadUser()
if (user.value) await load()

async function onAdd() {
  const name = window.prompt('Wie soll das Board heißen?', 'Neues Board')
  if (name) await navigateTo(`/boards/${await addBoard(name)}`)
}

function onRename(board: Board) {
  const name = window.prompt('Neuer Name', board.name)
  if (name && name !== board.name) renameBoard(board.id, name)
}

// Deleting a board also deletes every object on it, so ask first.
function onRemove(board: Board) {
  if (window.confirm(`„${board.name}“ und alles darauf löschen?`)) removeBoard(board.id)
}
</script>

<template>
  <main v-if="!user" class="flex h-screen flex-col items-center justify-center gap-4">
    <UserRoundIcon class="size-10 text-muted-foreground" />
    <p class="text-sm text-muted-foreground">
      Melde dich an, um deine Boards zu sehen
    </p>
    <Button variant="outline" class="hover:bg-[#F9E6F0]" @click="login">
      <LogInIcon />
      Mit Google anmelden
    </Button>
  </main>

  <main v-else class="mx-auto max-w-5xl p-8">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">
        Boards
      </h1>
      <div class="flex items-center gap-3">
        <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="" referrerpolicy="no-referrer" class="size-8 rounded-full">
        <span class="text-sm font-medium">{{ user.name }}</span>
        <Button variant="outline" class="hover:bg-[#F9E6F0]" @click="logout">
          <LogOutIcon />
          Abmelden
        </Button>
        <Button @click="onAdd">
          <PlusIcon />
          Neues Board
        </Button>
      </div>
    </div>

    <p v-if="!boards.length" class="text-muted-foreground">
      Noch keine Boards – leg das erste an.
    </p>

    <ul class="flex flex-col gap-3">
      <li
        v-for="board in boards"
        :key="board.id"
        class="group relative rounded-xl border bg-white shadow-sm transition-shadow hover:z-10 hover:shadow-md focus-within:z-10"
      >
        <NuxtLink :to="`/boards/${board.id}`" class="flex items-center gap-4 py-4 pl-5 pr-24">
          <span class="truncate font-medium">{{ board.name }}</span>
          <span class="shrink-0 text-sm text-muted-foreground">{{ new Date(board.createdAt).toLocaleDateString('de-DE') }}</span>
          <span class="ml-auto flex shrink-0 -space-x-2">
            <template v-for="member in board.members" :key="member.id">
              <img v-if="member.avatarUrl" :src="member.avatarUrl" :title="member.name" alt="" referrerpolicy="no-referrer" class="size-6 rounded-full ring-2 ring-white">
              <span v-else :title="member.name" class="flex size-6 items-center justify-center rounded-full bg-muted text-xs ring-2 ring-white">{{ member.name[0] }}</span>
            </template>
          </span>
        </NuxtLink>
        <div class="absolute right-3 top-1/2 flex -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <HoverLabel text="Board umbenennen">
            <Button variant="ghost" size="icon-sm" aria-label="Board umbenennen" @click="onRename(board)">
              <PencilIcon />
            </Button>
          </HoverLabel>
          <HoverLabel text="Board löschen">
            <Button variant="ghost" size="icon-sm" aria-label="Board löschen" @click="onRemove(board)">
              <TrashIcon />
            </Button>
          </HoverLabel>
        </div>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import {ref, onMounted} from "vue";
import type { Header, Item } from "vue3-easy-data-table";

const API_URL = import.meta.env.VITE_API_URL

const headers: Header[] = [
  { text: "Név", value: "name" },
  { text: "Elo", value: "elo" },
  { text: "Összes győzelem", value: "totalWins" },
  { text: "Összes vereség", value: "totalLosses" },
  { text: "Összes döntetlen", value: "totalDraws" },
  { text: "Összes játszma", value: "totalGames" },
  { text: "Összes játszma fehérrel", value: "totalPlayedAsWhite" },
  { text: "Összes játszma feketével", value: "totalPlayedAsBlack" },
];

const items = ref<Item[]>([]);

const gamesHeaders: Header[] = [
  { text: "Fehér", value: "white" },
  { text: "Fekete", value: "black" },
  { text: "Eredmény", value: "result" },
  { text: "Dátum", value: "createdAt" },
  { text: "Műveletek", value: "actions" },
];

const gamesItems = ref<Item[]>([]);
let highestId = ref<number | null>(null);

const groupHeaders = [
  { text: "Csoport A", value: "groupA" },
  { text: "Csoport B", value: "groupB" },
  // ...
];
const groupedPlayers = ref<Item[]>([]);

const fetchEloData = async () => {
  const response = await fetch(`${API_URL}/elo`);
  const data = await response.json();
  if (data.success) {
    items.value = data.data;
  }
};

const fetchGamesData = async () => {
  const response = await fetch(`${API_URL}/games`);
  const data = await response.json();
  if (data.success) {
    gamesItems.value = data.data.map((game) => {
      return {
        ...game,
        result: game.result === "W" ? "Fehér" : game.result === "B" ? "Fekete" : "Döntetlen",
        createdAt: new Date(game.createdAt).toLocaleDateString(),
      };
    })
    highestId.value = Math.max(...gamesItems.value.map(item => item.id));
  }
};

const fetchAllData = async () => {
  await fetchEloData();
  await fetchGamesData();

  // Csoportok kialakítása az items alapján
  let index = -1;
  groupedPlayers.value = items.value.reduce((acc,player) => {
    if (player.totalGames <= 3) {
      return acc;
    }
    index++;

    const name = player.name;

    if (index % 2 === 0) {
      acc.push({
        groupA: name,
        groupB: ""
      });
    } else {
      acc[acc.length - 1].groupB = name;
    }

    return acc;
  }, []);

};

onMounted(() => {
  fetchAllData();
});

const newGame = ref({
  white: "",
  black: "",
  result: ""
});

const errorMessage = ref("");

const addNewGame = async () => {
  if (!newGame.value.white || !newGame.value.black || !newGame.value.result) {
    errorMessage.value = "Kérjük, töltse ki az összes mezőt!";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGame.value),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        errorMessage.value = "";
        console.log('New game added:', data);
        await fetchAllData(); // Refresh the games data
        newGame.value = {
          white: "",
          black: "",
          result: ""
        };
      }
    } else {
      errorMessage.value = "Hiba történt az új játék hozzáadása közben.";
    }

  } catch (error) {
    errorMessage.value = "Hiba történt az új játék hozzáadása közben.";
    console.log('Error adding new game:', error);
  }
};

const deleteGame = async (id: number) => {
  if (!window.confirm("Biztosan törölni szeretné a játékot?")) {
    return;
  }
  try {
    const response = await fetch(`${API_URL}/games/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      errorMessage.value = "";
      console.log(`Game with ID ${id} is deleted.`);
      await fetchAllData(); // Refresh the games data
    } else {
      errorMessage.value = "Hiba történt a játék törlése közben.";
    }

  } catch (error) {
    errorMessage.value = "Hiba történt a játék törlése közben.";
    console.log('Error deleting game:', error);
  }
};


</script>

<template>
  <div class="container">
    <h1>Mondriaan Sakk 2023</h1>

    <div>
      <h1>Csoportok</h1>
      <h6>A jelenlegi rangsor szerint</h6>
      <EasyDataTable
          theme-color="#1d90ff"
          table-class-name="customize-table"
          header-text-direction="center"
          body-text-direction="center"
          hide-footer
          :headers="groupHeaders"
          :items="groupedPlayers"
      />
    </div>
    <div>
      <h1>Rangsor</h1>
      <EasyDataTable
          theme-color="#1d90ff"
          table-class-name="customize-table"
          header-text-direction="center"
          body-text-direction="center"
          hide-footer
          :headers="headers"
          :items="items"
      >
        <template #item-name="{ name, totalGames }">
          <div :class="{'green-bg': totalGames > 3}">{{ name }}</div>
        </template>
      </EasyDataTable>
    </div>

    <div>
      <h1>Játékok</h1>
      <form @submit.prevent="addNewGame" class="add-game-form">
        <input type="text" v-model="newGame.white" placeholder="Fehér játékos" />
        <label>
          <input type="radio" v-model="newGame.result" value="W" />
          Fehér
        </label>

        <label>
          <input type="radio" v-model="newGame.result" value="T" />
          Döntetlen
        </label>

        <label>
          <input type="radio" v-model="newGame.result" value="B" />
          Fekete
        </label>
        <input type="text" v-model="newGame.black" placeholder="Fekete játékos" />
        <button type="submit">Játék hozzáadása</button>
      </form>
      <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>

      <EasyDataTable
          theme-color="#1d90ff"
          table-class-name="customize-table"
          header-text-direction="center"
          body-text-direction="center"
          hide-footer
          :headers="gamesHeaders"
          :items="gamesItems">
        <template #item-actions="{ id }">
          <button v-if="id === highestId" @click="deleteGame(id)">Törlés</button>
        </template>
        <template #item-white="{ white, result }">
          <div :class="{'green-bg': result === 'Fehér'}">{{ white }}</div>
        </template>
        <template #item-black="{ black, result }">
          <div :class="{'green-bg': result === 'Fekete'}">{{ black }}</div>
        </template>
      </EasyDataTable>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.container > div {
  margin: 2rem
}

.container > div > h1 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.add-game-form {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.add-game-form input,
.add-game-form select,
.add-game-form button {
  padding: 0.5rem;
  font-size: 1rem;
}

.error-message {
  color: red;
  text-align: center;
}

.green-bg {
  background-color: #375e3c;
}

.customize-table {
  --easy-table-border: 1px solid #445269;
  --easy-table-row-border: 1px solid #445269;

  --easy-table-header-font-size: 14px;
  --easy-table-header-height: 50px;
  --easy-table-header-font-color: #c1cad4;
  --easy-table-header-background-color: #2d3a4f;

  --easy-table-header-item-padding: 10px 15px;

  --easy-table-body-even-row-font-color: #fff;
  --easy-table-body-even-row-background-color: #4c5d7a;

  --easy-table-body-row-font-color: #c0c7d2;
  --easy-table-body-row-background-color: #2d3a4f;
  --easy-table-body-row-height: 50px;
  --easy-table-body-row-font-size: 14px;

  --easy-table-body-row-hover-font-color: #fff;
  --easy-table-body-row-hover-background-color: #313e57;

  --easy-table-body-item-padding: 10px 15px;

  --easy-table-footer-background-color: #2d3a4f;
  --easy-table-footer-font-color: #c0c7d2;
  --easy-table-footer-font-size: 14px;
  --easy-table-footer-padding: 0px 10px;
  --easy-table-footer-height: 50px;

  --easy-table-rows-per-page-selector-width: 70px;
  --easy-table-rows-per-page-selector-option-padding: 10px;
  --easy-table-rows-per-page-selector-z-index: 1;


  --easy-table-scrollbar-track-color: #2d3a4f;
  --easy-table-scrollbar-color: #2d3a4f;
  --easy-table-scrollbar-thumb-color: #4c5d7a;;
  --easy-table-scrollbar-corner-color: #2d3a4f;

  --easy-table-loading-mask-background-color: #2d3a4f;
}
</style>

const btn_new = document.getElementById('btn_new');
const btn_new_state = document.getElementById('btn_new_state');
const btn_take = document.getElementById('btn_take');
const btn_stop = document.getElementById('btn_stop');

const deck_count_cards = document.getElementById('deck_count_cards');
const machine_points = document.getElementById('machine_points');
const player_points = document.getElementById('player_points');

const card_machine = document.getElementById('card_machine');
const card_player = document.getElementById('card_player');

// Container de los botones
const container_btn_actions = document.querySelector('.container_btn_player');
const container_state = document.querySelector('.container_state');

const container_rules = document.querySelector('.container_rules');
const btn_rules = document.querySelectorAll('.btn_rule') || [];

const handleBtnContinue = (continue_ = true) => {
   [btn_take, btn_stop].forEach(btn => {
      btn.disabled = !continue_;
      btn.classList.toggle('btn-disabled', !continue_);
      btn.classList.toggle('btn-continue', continue_);
   });
};

const layoutStates = {
   lose: 'Perdiste',
   win: 'Ganaste',
   draw: 'Empate',
};

const handleLayout = (state = '') => {
   container_btn_actions.classList.toggle('active_flex', !state);
   container_rules.classList.toggle('active_flex', state === 'rules');
   container_state.classList.toggle('active_flex', !!layoutStates[state]);

   if (layoutStates[state]) {
      container_state.children[0].innerText = layoutStates[state];
   }
};

// Un array de cartas;
let deck = [];
let deck_machine = [];
let deck_player = [];
let playerPoints = 0;
let machinePoints = 0;

const updatePlayerPoints = (points) => {
   playerPoints += points;
   player_points.innerText = playerPoints; // Actualiza el DOM
};
const updateMachinePoints = (points) => {
   machinePoints += points;
   machine_points.innerText = machinePoints; // Actualiza el DOM
};

// Crear mazo y barajar
const createDeck = () => {
   const types = ['C', 'D', 'H', 'S'];
   const specials = ['A', 'J', 'Q', 'K'];
   // const specials = ['A', 'A', 'A', 'A'];

   for (let i = 2; i <= 10; i++) {
      types.forEach(type => deck.push(`${i}${type}`));
   }
   specials.forEach(special => types.forEach(type => deck.push(`${special}${type}`)));
   deck = _.shuffle(deck);
};

// Obtener una carta del mazo
const getCard = (type_deck) => {
   const card = deck.pop();
   type_deck.push(card);
   return card;
};

// Manejar lógica para el As del jugador
const handleAceForPlayer = async () => {
   handleLayout('rules');
   return await new Promise(resolve => {
      btn_rules.forEach(btn => {
         btn.onclick = () => {
            handleLayout('');
            resolve(btn.textContent === '1' ? 1 : 11);
         };
      });
   });
};


// Obtener valor de la carta
const getValueCard = (card) => {
   const value = card.slice(0, -1);
   return isNaN(value) ? (value === 'A' ? 11 : 10) : parseInt(value);
};

const updatePounts = async (point, type = '') => {

   if (type === 'machine') {
      updateMachinePoints((point === 11 && machinePoints > 10) ? 1 : point);
      return point
   }
   if (point === 11) {
      const aceValue = await handleAceForPlayer();
      updatePlayerPoints(aceValue)
      return aceValue

   } else {
      updatePlayerPoints(point);
      return point
   }
}

const createElementCard = (card, isMachine = false, i = 0) => {
   const img = document.createElement('img');
   img.classList.add('card');

   if (isMachine) {
      // img.style.marginLeft = `-${deck_machine.length * 5}%`;
      i === 0 ? img.src = `./assets/cartas/${card}.png` : img.src = `./assets/cartas/red_back.png`
   } else {
      // img.style.marginLeft = `-${deck_player.length * 5}%`;
      img.src = `./assets/cartas/${card}.png`;
   }

   return img
}

const setCardElementInitial = async (elementPatter, type_deck = [], isMachine = false) => {
   const promises = [];
   for (let i = 0; i < 2; i++) {
      const card = getCard(type_deck);
      const img = createElementCard(card, isMachine, i);
      elementPatter.append(img);

      if (isMachine && i === 0) {
         const point = getValueCard(card)
         updatePounts(point, 'machine');

      } else if (!isMachine) {
         const point = getValueCard(card)
         promises.push(updatePounts(point, 'player'));
      }
   }
   await Promise.all(promises);
}

const initialMachine = async () => {
   card_machine.innerHTML = '';
   setCardElementInitial(card_machine, deck_machine, true);
}

const initialPlayer = async () => {
   card_player.innerHTML = '';
   setCardElementInitial(card_player, deck_player, false);
}

const initialGame = () => {
   deck = [];
   deck_machine = [];
   deck_player = [];
   playerPoints = 0;
   machinePoints = 0;
   handleLayout('');
   createDeck();
   initialMachine();
   initialPlayer();
   handleBtnContinue(true);
   deck_count_cards.innerText = deck.length;
}

const handleplayer = () => {
   const card = getCard(deck_player);
   card_player.append(createElementCard(card));
   updatePounts(getValueCard(card), 'player');
   player_points.innerText = playerPoints;
   player_points.style.animationDelay = "0.5s";
   deck_count_cards.innerText = deck.length;

   if (playerPoints > 21) {
      handleBtnContinue(false);
      handleLayout('lose');

   } else if (playerPoints === 21) {
      handleBtnContinue(false);
      handleLayout('win');
   }
}

const handleMachine = async () => {
   const cards = document.querySelectorAll('#card_machine .card') || [];
   cards[1].src = `./assets/cartas/${deck_machine.at(-1)}.png`;
   updatePounts(getValueCard(deck_machine.at(-1)), 'machine');

   const playMachineTurn = async () => {
      if (machinePoints < 17) {
         const card = getCard(deck_machine);
         card_machine.append(createElementCard(card));
         updatePounts(getValueCard(card), 'machine');

         setTimeout(playMachineTurn, 1000);
      } else {
         if (machinePoints === playerPoints) {
            handleLayout('draw');
         }

         if (machinePoints > 21) {
            handleLayout('win');
         } else {
            handleLayout('lose');
         }
      }
   };
   playMachineTurn();
};

btn_new.onclick = () => initialGame()
btn_new_state.onclick = () => initialGame()

btn_take.onclick = () => {
   handleplayer();
}

btn_stop.onclick = () => {
   handleBtnContinue(false);
   handleMachine();
}

(() => {
   initialGame();
})()

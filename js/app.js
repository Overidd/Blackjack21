

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

// Un array de cartas;
let deck = [];
let deck_machine = [];
let deck_player = [];
let playerPoints = 0;
let machinePoints = 0;

// Crear mazo y barajar
const createDeck = () => {
   const types = ['C', 'D', 'H', 'S'];
   // const specials = ['A', 'J', 'Q', 'K'];
   const specials = ['A', 'A', 'A', 'A'];

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
   const newpoint = await new Promise(resolve => {
      btn_rules.forEach(btn => {
         btn.onclick = () => {
            resolve(btn.textContent === '1' ? 1 : 11)
         };
      });
   });
   handleLayout('');
   return newpoint
};

// Obtener valor de la carta
const getValueCard = async (card, isMachine = false) => {
   const value = card.slice(0, -1);
   const point = isNaN(value) ? (value === 'A' ? 11 : 10) : parseInt(value);

   if (isMachine) {
      return (point === 11 && machinePoints > 10) ? 1 : point;
   }

   if (point === 11) {
      return await handleAceForPlayer();
   }
   return point;
};


const createElementCard = (card) => {
   const img = document.createElement('img');
   img.classList.add('card');
   img.src = `./assets/cartas/${card}.png`;
   return img
}

const setCardElementInitial = async (elementPatter, type_deck = [], isMachine = false) => {
   let points = 0;
   for (let i = 0; i < 2; i++) {
      const img = document.createElement('img');
      img.classList.add('card');

      const card = getCard(type_deck);

      if (isMachine) {
         i === 0
            ? (img.src = `./assets/cartas/${card}.png`, points += await getValueCard(card, isMachine))
            : img.src = `./assets/cartas/red_back.png`;
         elementPatter.append(img);
      } else {
         img.src = `./assets/cartas/${card}.png`;
         elementPatter.append(img);
         points += await getValueCard(card, isMachine);
      }
   }
   return points
}

const initialMachine = async () => {
   card_machine.innerHTML = '';
   machinePoints = await setCardElementInitial(card_machine, deck_machine, true);
   machine_points.innerText = machinePoints;
}

const initialPlayer = async () => {
   card_player.innerHTML = '';
   playerPoints = await setCardElementInitial(card_player, deck_player, false);
   player_points.innerText = playerPoints;
}

const handleBtnContinue = (continue_ = true) => {
   btn_take.disabled = !continue_;
   btn_stop.disabled = !continue_;

   if (continue_) {
      btn_take.classList.remove('btn-disabled');
      btn_stop.classList.remove('btn-disabled');
      btn_take.classList.add('btn-continue');
      btn_stop.classList.add('btn-continue');
   } else {
      btn_take.classList.remove('btn-continue');
      btn_stop.classList.remove('btn-continue');
      btn_take.classList.add('btn-disabled');
      btn_stop.classList.add('btn-disabled');
   }
}

const handleLayout = (name = '') => {
   if (name === 'lose') {
      container_rules.classList.remove('active_flex');
      container_btn_actions.classList.remove('active_flex');
      container_state.classList.add('active_flex');
      container_state.children[0].innerText = 'Perdiste';

   } else if (name === 'win') {
      container_rules.classList.remove('active_flex');
      container_btn_actions.classList.remove('active_flex');
      container_state.classList.add('active_flex');
      container_state.children[0].innerText = 'Ganaste';

   } else if (name === 'draw') {
      container_rules.classList.remove('active_flex');
      container_btn_actions.classList.remove('active_flex');
      container_state.classList.add('active_flex');
      container_state.children[0].innerText = 'Empate';

   } else if (name === 'rules') {
      container_btn_actions.classList.remove('active_flex');
      container_state.classList.remove('active_flex');
      container_rules.classList.add('active_flex');

   } else {
      container_rules.classList.remove('active_flex');
      container_state.classList.remove('active_flex');
      container_btn_actions.classList.add('active_flex');
   }

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
   deck_count_cards.innerText = deck.length;

   handleBtnContinue(true);
}

const handleplayer = () => {
   const card = getCard(deck_player);
   card_player.append(createElementCard(card));
   getValueCard(card);
   player_points.innerText = playerPoints;
   player_points.style.animationDelay = "0.5s";

   if (playerPoints > 21) {
      handleBtnContinue(false);
      handleLayout('lose');

   } else if (playerPoints === 21) {
      handleBtnContinue(false);
      handleLayout('win');
   }
}

const handleMachine = () => {
   const cards = document.querySelectorAll('#card_machine .card') || [];
   cards[1].src = `./assets/cartas/${deck_machine.at(-1)}.png`;
   getValueCard(deck_machine.at(-1));
   machine_points.innerText = machinePoints;

   const playMachineTurn = () => {
      if (machinePoints < 17) {
         const card = getCard(deck_machine);
         card_machine.append(createElementCard(card));
         getValueCard(card);
         machine_points.innerText = machinePoints;

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
   deck_count_cards.innerText = deck.length;
}

btn_stop.onclick = () => {
   handleBtnContinue(false);
   handleMachine();
}


(() => {
   initialGame();
})()





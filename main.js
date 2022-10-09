let score = 0;

const backgroundSound = new Audio('./sound/bgSound.mp3');
const audio = new Audio(); // win || lose

let data = [];
const fetchButtonsDesigns = async (actionBtns) => {
   const response = await fetch('./buttonColor.json');
   data = await response.json();

   actionBtns.forEach((btn) => {
      const { bg, boxShadowColor } = getDesign(data, btn.dataset.name);

      btn.style.backgroundImage = `linear-gradient(${bg})`;
      btn.style.boxShadow = `0 5px  ${boxShadowColor}`;
   });
};

const getDesign = (data, name) => {
   const designData = data.find((d) => d.name === name);
   const bg = designData.bg;
   const boxShadowColor = designData.boxShadowColor;

   return { bg, boxShadowColor };
};

const calcResult = (pickedName, random) => {
   const logic = [
      { pickedName: 'rock', canBeat: ['lizard', 'scissors'] },
      { pickedName: 'paper', canBeat: ['rock', 'spock'] },
      { pickedName: 'scissors', canBeat: ['paper', 'lizard'] },
      { pickedName: 'lizard', canBeat: ['spock', 'paper'] },
      { pickedName: 'spock', canBeat: ['scissors', 'rock'] },
   ];

   const getPickedObj = logic.find((obj) => obj.pickedName === pickedName);

   if (random === pickedName) {
      return 'draw';
   } else if (getPickedObj.canBeat.includes(random)) {
      return 'you win';
   } else {
      return 'you lose';
   }
};

const showWave = (parent) => {
   const waveContainer = document.createElement('div');
   waveContainer.classList.add('wave-container');
   waveContainer.innerHTML = `
               <div class='wave'></div>
               <div class='wave'></div>
               <div class='wave'></div>
               <div class='wave'></div>
               <div class='wave'></div>
            `;
   parent.appendChild(waveContainer);
};

const getRandomNumber = (min, max) => {
   // min and max included
   return Math.floor(Math.random() * (max - min + 1) + min);
};

const modeBtn = document.querySelector('.mode-btn');
const ruleBtn = document.querySelector('.rule-btn');
const playgroundOuter = document.querySelector('.playground-outer');
const logo = document.querySelector('.logo');

const insertChild = (mode, modeType) => {
   const playgroundInner = document.createElement('div');
   playgroundInner.classList = `playground-inner ${modeType}`;
   playgroundInner.innerHTML = `
     <img src=${mode.bgImg} class="bg-img" alt="bg-img"/>
     ${mode.buttons
        .map(
           (btn) => `
     <div class='action-btn ${btn}' data-name=${btn}>
         <div class="inner-circle">
             <img src="./images/icon-${btn}.svg" alt="action"/>
         </div>
     </div>`
        )
        .join(' ')}
     `;

   playgroundOuter.innerHTML = '';
   playgroundOuter.appendChild(playgroundInner);

   const actionBtns = document.querySelectorAll('.action-btn');

   fetchButtonsDesigns(actionBtns);

   const allButtons = mode.buttons;

   actionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
         const pickedName = btn.dataset.name;

         const { bg, boxShadowColor } = getDesign(data, pickedName);

         // show picking state
         playgroundOuter.innerHTML = `
         <div class="pick">
          <div class="pick-body">

           <div class="outer-pick-body">
            <div class="inner-pick-body">
            <p>You Picked</p>
            <div class="circle-container you-pick">
                <div class="circle" style="box-shadow: 0 5px ${boxShadowColor};background-image: linear-gradient(${bg})">
                <div class="inner-circle">
                <img src="./images/icon-${btn.dataset.name}.svg" alt="action"/>
                </div>
                </div>
            </div>
            </div>

            <div class="result-container">
                <h1 class="result"></h1>
                <button class='play-again'>play again</button >
            </div>

            <div class="inner-pick-body">
            <p>The house picked</p>
            <div class="circle-container the-house-pick">
               <div class="wait-circle"></div>
            </div>
            </div>
           </div>

           <div class="result-container mobile-result-container">
           <h1 class="result"></h1>
           <button class='play-again'>play again</button >
            </div>
          </div>
        </div>
        `;

         const youPick = document.querySelector('.you-pick');
         const theHousePick = document.querySelector('.the-house-pick');
         const randomName =
            allButtons[getRandomNumber(0, allButtons.length - 1)];

         // show the house pick
         setTimeout(() => {
            const { bg, boxShadowColor } = getDesign(data, randomName);
            theHousePick.innerHTML = `
            <div class="circle" style="box-shadow: 0 5px ${boxShadowColor};background-image: linear-gradient(${bg})">
                  <div class="inner-circle">
                  <img src="./images/icon-${randomName}.svg" alt="action"/>
                  </div>
                </div>
            `;
         }, 1000);

         const result = calcResult(pickedName, randomName);
         document
            .querySelectorAll('.result')
            .forEach((el) => (el.innerHTML = result));

         // show result
         setTimeout(() => {
            const resultContainer =
               document.querySelectorAll('.result-container');
            resultContainer.forEach((el) => {
               el.style.opacity = 1;
               el.style.width = '200px';
            });

            // play audio
            src =
               result === 'you win'
                  ? './sound/win.mp3'
                  : result === 'you lose'
                  ? './sound/lose.mp3'
                  : '';

            audio.src = src;
            src && audio.play();

            // show score
            score =
               result === 'you win'
                  ? score + 1
                  : result === 'you lose'
                  ? score - 1
                  : score;

            document.querySelector('.score-board_count').innerHTML = score;
         }, 1500);

         // showWave
         if (result === 'you win') {
            showWave(youPick);
         } else if (result === 'you lose') {
            showWave(theHousePick);
         }

         // play again
         const playAgainBtns = document.querySelectorAll('.play-again');
         const mode = modeBtn.innerHTML;
         modeBtn.style.display = 'none';
         ruleBtn.style.margin = 'auto';
         playAgainBtns.forEach((el) => {
            el.addEventListener('click', () => {
               modeBtn.style.display = 'block';
               ruleBtn.style.margin = '0 0 0 auto';
               if (mode === 'mode 1') {
                  insertChild(mode1, 'mode-1');
               } else {
                  insertChild(mode2, 'mode-2');
               }
            });
         });
      });
   });
};

const showModal = (ruleImg) => {
   const modalElement = document.createElement('div');
   modalElement.classList.add('modal');
   modalElement.innerHTML = `
   <div class="rule">
     <header>
       <p>rules</p>
       <img src="./images/icon-close.svg" alt="close-icon" class='close-icon' onclick="removeModal()"/>
     </header>
     <p class="mobile-title">rules</p>
     <img src=${ruleImg} alt="rule-img" class="rule-img">
     <img src="./images/icon-close.svg" alt="close-icon" class="close-icon mobile-close"  onclick="removeModal()"/>
   </div>
 `;

   document.body.appendChild(modalElement);
};

const mode1 = {
   bgImg: './images/bg-triangle.svg',
   buttons: ['rock', 'paper', 'scissors'],
};
const mode2 = {
   bgImg: './images/bg-pentagon.svg',
   buttons: ['rock', 'paper', 'scissors', 'lizard', 'spock'],
};

insertChild(mode1, 'mode-1');

// change mode
modeBtn.addEventListener('click', () => {
   const playgroundInner = document.querySelector('.playground-inner');
   playgroundInner.innerHTML = '';

   if (modeBtn.innerHTML === 'mode 1') {
      insertChild(mode2, 'mode-2');
      logo.src = './images/logo-bonus.svg';
   } else {
      insertChild(mode1, 'mode-1');
      logo.src = './images/logo.svg';
   }

   modeBtn.innerHTML = modeBtn.innerHTML === 'mode 1' ? 'mode 2' : 'mode 1';
});

// show rule
ruleBtn.addEventListener('click', () => {
   const ruleImg1 = './images/image-rules.svg';
   const ruleImg2 = './images/image-rules-bonus.svg';
   const ruleImgToShow = modeBtn.innerHTML === 'mode 1' ? ruleImg1 : ruleImg2;

   showModal(ruleImgToShow);
});

// close modal
const removeModal = () => document.querySelector('.modal').remove();

// play bg sound
const playBgSound = document.querySelector('.toggle-bg-sound');
playBgSound.addEventListener('click', () => {
   if (backgroundSound.duration > 0 && !backgroundSound.paused) {
      backgroundSound.pause();
      playBgSound.innerHTML = 'play bg sound';
      return;
   }

   backgroundSound.play();
   backgroundSound.loop = true;

   playBgSound.innerHTML =
      playBgSound.innerHTML === 'play bg sound'
         ? 'pause bg sound'
         : 'play bg sound';
});

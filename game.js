/* ============ СОСТОЯНИЕ ============ */
const S = {
  time:5, str:5, warm:5,
  flags:{ checkedTree:false, hidBark:0, selfTalk:false, door:"", guest:"", aadrianWalk:false, aadrianStayed:false }
};

/* ============ АРТ ============ */
const ART = {
  dawn:"dawn.png", herbs:"herbs.png", guest:"guest.png",
  garden:"garden.png", sunset:"sunset.png",
  aadrian:"aadrian.png", severus:"severus.png"
};

const canvas = document.getElementById('sceneCanvas');
const ctx = canvas.getContext('2d');
const artImg = document.getElementById('sceneArt');

const PAL = {
  dawn:  {sky:"#e8dcb8", ground:"#b7c39a", sun:"#c9924a", tree:"#5f6b3a", fig:"#2b2a22"},
  herbs: {sky:"#e4e6cf", ground:"#a9b88b", sun:"#c9a46a", tree:"#55633a", fig:"#2b2a22"},
  guest: {sky:"#e6e2cc", ground:"#a3b286", sun:"#c09a5e", tree:"#4f5c34", fig:"#2b2a22"},
  garden:{sky:"#ecdcb6", ground:"#a8b88a", sun:"#c98f4a", tree:"#5a6638", fig:"#2b2a22"},
  sunset:{sky:"#e0b48a", ground:"#8a946e", sun:"#a4502e", tree:"#46512e", fig:"#2b2a22"},
  aadrian:{sky:"#f0e2b8", ground:"#b8c48e", sun:"#d49a4a", tree:"#5a6b38", fig:"#2b2a22"},
  severus:{sky:"#d8d4c4", ground:"#9aa68a", sun:"#a08a6a", tree:"#4a5532", fig:"#2b2a22"}
};

function drawFallback(scene){
  const p = PAL[scene] || PAL.dawn;
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = p.sky;
  ctx.fillRect(0,0,W,H);

  const sx = scene==="sunset" ? W*0.76 : W*0.26;
  const sy = scene==="sunset" ? H*0.52 : H*0.32;
  ctx.beginPath();
  ctx.arc(sx, sy, 46, 0, Math.PI*2);
  ctx.fillStyle = p.sun;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = p.fig;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, H*0.72);
  ctx.lineTo(W, H*0.70);
  ctx.lineWidth = 2;
  ctx.strokeStyle = p.fig;
  ctx.stroke();

  ctx.fillStyle = p.ground;
  ctx.beginPath();
  ctx.moveTo(0, H*0.72);
  ctx.lineTo(W, H*0.70);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  const tx = W*0.15, ty = H*0.52;
  ctx.fillStyle = p.tree;
  ctx.beginPath();
  ctx.arc(tx, ty, 42, 0, Math.PI*2);
  ctx.fill();
  ctx.fillRect(tx-7, ty+20, 14, H*0.72 - ty);
  ctx.lineWidth = 2;
  ctx.strokeStyle = p.fig;
  ctx.beginPath();
  ctx.arc(tx, ty, 42, 0, Math.PI*2);
  ctx.stroke();

  const mx = W*0.5, my = H*0.58;
  ctx.strokeStyle = p.fig;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(mx, my, 14, 0, Math.PI*2);
  ctx.moveTo(mx, my+14);
  ctx.lineTo(mx, my+58);
  ctx.moveTo(mx, my+26);
  ctx.lineTo(mx-18, my+44);
  ctx.moveTo(mx, my+26);
  ctx.lineTo(mx+18, my+44);
  ctx.moveTo(mx, my+58);
  ctx.lineTo(mx-12, H*0.86);
  ctx.moveTo(mx, my+58);
  ctx.lineTo(mx+12, H*0.86);
  ctx.stroke();

  ctx.fillStyle = p.fig;
  ctx.font = "14px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText(scene ? scene.toUpperCase() : "GUEST", 16, H-14);
}

/* ============ ИСПРАВЛЕННАЯ ФУНКЦИЯ ПОКАЗА КАРТИНОК ============ */
function showScene(scene){
  // 1. Принудительно прячем старую картинку и показываем заглушку (сброс "эха" прошлого гостя)
  artImg.style.display = "none";
  canvas.style.display = "block";
  drawFallback(scene || "guest");

  const src = ART[scene];
  if(!src) return; // Если передали неизвестную сцену — остаемся на заглушке

  // Сбрасываем старые события
  artImg.onload = null;
  artImg.onerror = null;

  // 2. Если файл загрузился — показываем его
  artImg.onload = ()=>{ 
    artImg.style.display="block"; 
    canvas.style.display="none"; 
  };
  
  // 3. Если файл НЕ найден (например, Windows скрыл расширение и файл называется aadrian.png.jpg)
  artImg.onerror = ()=>{ 
    const altSrc = src.replace(".png", ""); // Пробуем убрать .png
    if(artImg.src.indexOf(altSrc) === -1) {
      artImg.src = altSrc; 
    } else {
      // Если и это не сработало — оставляем заглушку
      artImg.style.display="none"; 
      canvas.style.display="block"; 
    }
  };
  
  // Принудительно добавляем кэш-брейкер, чтобы браузер не брал старую версию файла
  artImg.src = src + "?v=" + Date.now();
}

/* ============ HUD ============ */
function updateHUD(){
  document.getElementById('hudTime').textContent = S.time;
  document.getElementById('barStr').style.width = (S.str/5*100)+"%";
  document.getElementById('barWarm').style.width = (S.warm/5*100)+"%";
}

/* ============ ШЁПОТ ============ */
let whisperTimer=null;
function scheduleWhisper(text){
  clearTimeout(whisperTimer);
  whisperTimer = setTimeout(()=>{
    const n = document.getElementById('note');
    if(n){ n.innerHTML = `<span class="whisper">${text}</span>`; S.flags.selfTalk=true; }
  }, 6000);
}
function clearWhisper(){ clearTimeout(whisperTimer); }

const content = document.getElementById('content');
function render(html){ content.innerHTML = html; updateHUD(); }
function go(fn){ clearWhisper(); fn(); }

/* ============ СЦЕНА 1: РАССВЕТ ============ */
function sceneDawn(){
  showScene("dawn");
  render(`
    <h1>Рассвет</h1>
    <h2>Старолесье, раннее утро</h2>
    <p>Свет пробивается сквозь листву. Митрея просыпается рано — привычка, от которой не избавиться. Первое, что она делает, — смотрит на своё дерево.</p>
    <div class="choices">
      <button onclick="go(dawnTree)">Проверить дерево — кора на месте?</button>
      <button onclick="go(dawnDew)">Собрать утреннюю росу</button>
      <button onclick="go(dawnRest)">Полежать ещё пять минут</button>
    </div>
    <div class="note" id="note"></div>
  `);
  scheduleWhisper("«Сначала дерево. Потом всё остальное. Так проще.»");
}
function dawnTree(){
  S.flags.checkedTree=true; S.time--; S.warm++;
  render(`
    <h1>Рассвет</h1><h2>Своё дерево</h2>
    <p>Кора тёплая, живая. На предплечье — едва заметная шершавость, но сегодня она не отзывается болью. Митрея выдыхает.</p>
    <p class="whisper">«Пока держится. Значит, и я держусь.»</p>
    <div class="choices"><button onclick="go(sceneHerbs)">К травам</button></div>
    <div class="note" id="note"></div>
  `);
}
function dawnDew(){
  S.time--; S.str++;
  render(`
    <h1>Рассвет</h1><h2>Роса</h2>
    <p>Капли собираются в стеклянный флакон. Работа привычная, руки помнят. Но спина уже ноет — она не умеет отдыхать.</p>
    <div class="choices"><button onclick="go(sceneHerbs)">К травам</button></div>
    <div class="note" id="note"></div>
  `);
}
function dawnRest(){
  S.time--; S.str++; S.warm++;
  render(`
    <h1>Рассвет</h1><h2>Пять минут</h2>
    <p>Она закрывает глаза. Пять минут — это роскошь, которую она себе почти не позволяет. И всё же где-то внутри шевелится мысль: а вдруг это не лень, а проклятие не даёт расслабиться?</p>
    <div class="choices"><button onclick="go(sceneHerbs)">К травам</button></div>
    <div class="note" id="note"></div>
  `);
}

/* ============ СЦЕНА 2: ТРАВЫ ============ */
function sceneHerbs(){
  showScene("herbs");
  render(`
    <h1>Утро</h1><h2>Травы</h2>
    <p>Грядка после дождя. Нужно собрать лемонграсс, лавровый лист и мяту. И не задеть ядовитый болиголов, который вечно лезет не туда.</p>
    <p class="whisper">Найди и нажми на три нужных растения.</p>
    <div class="choices" id="herbGrid"></div>
    <div class="note" id="note">Собрано: 0 / 3</div>
  `);
  const plants = shuffle([
    {name:"лемонграсс", good:true},{name:"лавровый лист", good:true},{name:"мята", good:true},
    {name:"болиголов", good:false},{name:"крапива", good:false},{name:"папоротник", good:false},
    {name:"болиголов", good:false},{name:"ромашка", good:true}
  ]);
  let found=0; let done=false;
  const grid = document.getElementById('herbGrid');
  plants.forEach(p=>{
    const b=document.createElement('button');
    b.textContent = p.name;
    b.onclick = ()=>{
      if(done) return;
      if(p.good){
        b.disabled=true; b.textContent="✓ "+p.name; found++;
        document.getElementById('note').textContent = `Собрано: ${found} / 3`;
        if(found>=3){ done=true; S.time--; S.str--;
          setTimeout(()=>go(sceneHerbsDone),400);
        }
      } else {
        b.disabled=true; b.textContent="✕ "+p.name; S.warm--;
        document.getElementById('note').textContent = "Болиголов. Руки дрогнули.";
        updateHUD();
      }
    };
    grid.appendChild(b);
  });
}
function sceneHerbsDone(){
  render(`
    <h1>Утро</h1><h2>Корзина собрана</h2>
    <p>Травы пахнут свежим зеленым. Пальцы в земле, спина прямая. Работа сделана.</p>
    <div class="choices"><button onclick="go(sceneGuest)">Вернуться к дому</button></div>
    <div class="note" id="note"></div>
  `);
}

/* ============ СЦЕНА 3: ГОСТИ ============ */
function sceneGuest(){
  showScene("guest");
  render(`
    <h1>Полдень</h1><h2>Стук в дверь</h2>
    <p>Кто-то пришёл. Митрея вытирает руки о передник. Она не обязана открывать — но вежливость в ней сильнее усталости.</p>
    <div class="choices">
      <button onclick="go(guestOpen)">Открыть</button>
      <button onclick="go(guestPorch)">Выйти на порог, не впуская</button>
      <button onclick="go(guestIgnore)">Сделать вид, что не слышала</button>
    </div>
    <div class="note" id="note"></div>
  `);
  scheduleWhisper("«Если не я — то кто? Хотя... почему всегда я?»");
}

function guestOpen(){
  S.time--; S.warm++; S.flags.door="open";
  const roll = Math.random();
  let who;
  if(roll < 0.30) who = "sevs";
  else if(roll < 0.60) who = "aadrian";
  else who = "friend";

  if(who === "sevs"){
    S.flags.guest = "sevs";
    // Сначала меняем картинку на Северуса
    showScene("severus"); 
    render(`
      <h1>Полдень</h1><h2>Северус</h2>
      <p>Он стоит на пороге, грязный и молчаливый, как всегда. «Ты не обязана мне помогать. Но я всё равно пришёл».</p>
      <p class="whisper">Она не знает, что с этим делать. Но впускает.</p>
      <div class="choices">
        <button onclick="go(guestTea)">Напоить чаем и не задавать вопросов</button>
        <button onclick="go(guestWork)">Спросить, что случилось</button>
      </div>
      <div class="note" id="note"></div>
    `);
  } else if(who === "aadrian"){
    S.flags.guest = "aadrian";
    // Меняем картинку на Аадриана
    showScene("aadrian");
    render(`
      <h1>Полдень</h1><h2>Аадриан</h2>
      <p>Дверь распахивается раньше, чем она успевает постучать. «Я мимо шёл, а у тебя свет горит!» В руках — корзина инжира, на лице — та самая улыбка, от которой хочется одновременно улыбнуться и вздохнуть.</p>
      <p class="whisper">«Ну чего ты сидишь? Пошли куда-нибудь. Ну хоть на холм. Ну хоть на пять минут.»</p>
      <div class="choices">
        <button onclick="go(aadrianGo)">Пойти с ним</button>
        <button onclick="go(aadrianStay)">Остаться — дел много</button>
      </div>
      <div class="note" id="note"></div>
    `);
  } else {
    S.flags.guest = "friend";
    showScene("guest");
    render(`
      <h1>Полдень</h1><h2>Гость</h2>
      <p>Кто-то из команды — с просьбой полечить царапину или просто посидеть. Митрея улыбается и жестом приглашает войти.</p>
      <div class="choices">
        <button onclick="go(guestTea)">Заварить чай</button>
        <button onclick="go(guestWork)">Быстро помочь и вернуться к делам</button>
      </div>
      <div class="note" id="note"></div>
    `);
  }
}

function aadrianGo(){
  S.time--; S.str--; S.warm += 2;
  S.flags.aadrianWalk = true;
  render(`
    <h1>Полдень</h1><h2>На холм</h2>
    <p>Они идут недолго — холм за рощей, оттуда видно всю долину. Аадриан говорит без умолку: про стимфалиду, про то, как Авгурий однажды бросил его за борт, про то, что инжир в этом году уродился. Митрея почти не отвечает. И впервые за день ей не хочется отвечать.</p>
    <p class="whisper">«Вот видишь, — говорит он. — Ничего не случилось. Мир не рухнул. Травы не завяли.»</p>
    <div class="choices"><button onclick="go(sceneGarden)">К саду</button></div>
    <div class="note" id="note"></div>
  `);
}
function aadrianStay(){
  S.time++; S.warm--;
  S.flags.aadrianStayed = true;
  render(`
    <h1>Полдень</h1><h2>«Ну ладно»</h2>
    <p>«Ну ладно, как хочешь», — говорит он, и улыбка становится чуть-чуть другой. Он оставляет корзину инжира на пороге и уходит, оборачиваясь дважды.</p>
    <p class="whisper">Она смотрит на инжир. Потом на свои руки. Потом снова на инжир.</p>
    <div class="choices"><button onclick="go(sceneGarden)">К саду</button></div>
    <div class="note" id="note"></div>
  `);
}

function guestPorch(){
  S.time--; S.flags.door="porch";
  render(`
    <h1>Полдень</h1><h2>На пороге</h2>
    <p>Она говорит через приоткрытую дверь. Вежливо, но граница на месте. Гость уходит, не обидевшись — кажется.</p>
    <p class="whisper">«Так тоже можно. Наверное.»</p>
    <div class="choices"><button onclick="go(sceneGarden)">К саду</button></div>
    <div class="note" id="note"></div>
  `);
}
function guestIgnore(){
  S.time++; S.warm--; S.flags.door="ignore";
  render(`
    <h1>Полдень</h1><h2>Тишина</h2>
    <p>Шаги удаляются. Она стоит посреди комнаты и слушает тишину. В ней есть и облегчение, и что-то похожее на вину.</p>
    <div class="choices"><button onclick="go(sceneGarden)">К саду</button></div>
    <div class="note" id="note"></div>
  `);
}
function guestTea(){
  S.warm++; S.str--;
  render(`
    <h1>Полдень</h1><h2>Чай</h2>
    <p>Она заваривает мяту с мёдом. Разговор идёт легко — о пустяках, о погоде, о том, что инжир в этом году уродился. Она почти не говорит о себе.</p>
    <div class="choices"><button onclick="go(sceneGarden)">К саду</button></div>
    <div class="note" id="note"></div>
  `);
}
function guestWork(){
  S.time--; S.str--;
  render(`
    <h1>Полдень</h1><h2>Дело сделано</h2>
    <p>Она помогает быстро и аккуратно, как привыкла. Гость благодарит. Митрея кивает и возвращается к травам — ей так спокойнее.</p>
    <div class="choices"><button onclick="go(sceneGarden)">К саду</button></div>
    <div class="note" id="note"></div>
  `);
}

/* ============ СЦЕНА 4: САД И ПРОКЛЯТИЕ ============ */
function sceneGarden(){
  showScene("garden");
  render(`
    <h1>После полудня</h1><h2>Сад</h2>
    <p>Она замечает, что кора на предплечье стала грубее. Совсем чуть-чуть. Но она это чувствует.</p>
    <div class="choices">
      <button onclick="go(gardenHide)">Спрятать рукавом и продолжить дела</button>
      <button onclick="go(gardenBreathe)">Сесть и подышать</button>
      <button onclick="go(gardenDiary)">Записать в дневник</button>
    </div>
    <div class="note" id="note"></div>
  `);
  scheduleWhisper("«Не сейчас. Пожалуйста, не сейчас.»");
  
  setTimeout(()=>{
    const n = document.getElementById('note');
    if(n && !n.textContent.trim()){
      n.innerHTML = '<span class="whisper">«Аадриан бы сейчас сказал: да брось ты эти травы, пошли смотреть на закат». Она не идёт. Но улыбается.</span>';
    }
  }, 8000);
}
function gardenHide(){
  S.flags.hidBark++; S.time--; S.str--;
  render(`
    <h1>После полудня</h1><h2>Рукав</h2>
    <p>Она одёргивает рукав и берётся за лейку. Работа отвлекает. Но мысль остаётся где-то на краю сознания.</p>
    <div class="choices"><button onclick="go(sceneSunset)">К закату</button></div>
    <div class="note" id="note"></div>
  `);
}
function gardenBreathe(){
  S.time--; S.str++; S.warm++;
  render(`
    <h1>После полудня</h1><h2>Дыхание</h2>
    <p>Она садится на траву и просто дышит. Вдох — четыре. Выдох — шесть. Пума где-то рядом, её тёплый бок касается колена.</p>
    <p class="whisper">«Может, это и не лень. Может, это тоже лечение.»</p>
    <div class="choices"><button onclick="go(sceneSunset)">К закату</button></div>
    <div class="note" id="note"></div>
  `);
}
function gardenDiary(){
  S.time--; S.warm++;
  render(`
    <h1>После полудня</h1><h2>Дневник</h2>
    <p>Она пишет коротко, как привыкла: «Кора на предплечье. Дерево держится. Я тоже». И ниже — строчка, которую она потом зачеркнёт: «Хотела бы я увидеть, каким будет это будущее».</p>
    <div class="choices"><button onclick="go(sceneSunset)">К закату</button></div>
    <div class="note" id="note"></div>
  `);
}

/* ============ СЦЕНА 5: ЗАКАТ ============ */
function sceneSunset(){
  showScene("sunset");
  let ending, text, extra = "";

  const warmEnding = S.warm >= 5 && S.str >= 3;
  const tiredEnding = S.str <= 1 || S.flags.hidBark >= 2;

  if(warmEnding){
    ending = "Тёплый вечер";
    if(S.flags.guest === "aadrian" || S.flags.aadrianWalk){
      text = "Она сидит с чашкой чая на крыльце. Рядом — Аадриан, впервые за вечер молчащий. Потом он всё-таки говорит: «Знаешь, я всё думал, что мы с тобой так и не поговорили по-настоящему. Ну, вот. Говорим». И она впервые за день не отвечает уклончиво.";
      extra = '<p class="whisper">Они не помирились. Но хотя бы поговорили.</p>';
    } else {
      text = "Она сидит с чашкой чая на крыльце. Кто-то из друзей рядом — не разговаривает, просто есть. Впервые за день Митрея позволяет себе не быть полезной. И это оказывается легче, чем она думала.";
    }
  } else if(tiredEnding){
    ending = "Усталый вечер";
    if(S.flags.aadrianWalk){
      text = "Она уже засыпает над травами, когда дверь скрипит. Аадриан — без стука, как всегда. «Ну нет, так не пойдёт. Пошли, я тебе чай налью. И не спорь». И она почему-то идёт.";
      extra = '<p class="whisper">Иногда спасательный круг — это кто-то, кто просто не даёт тебе утонуть в делах.</p>';
    } else {
      text = "Она засыпает над травами, не доделав дела. Кора на руке проступила сильнее. Завтра будет новый день — и она снова начнёт с дерева. Так проще.";
    }
  } else {
    ending = "Тихий вечер";
    text = "Она смотрит на закат одна. Пума дремлет у ног, Адонис сопит за дверью. На душе — ровно. Не тепло и не холодно. Может, завтра.";
  }

  render(`
    <h1>Закат</h1><h2>${ending}</h2>
    <div class="ending">${text}</div>
    ${extra}
    <p class="whisper">Тепло: ${S.warm}/5 · Силы: ${S.str}/5 · Время: ${S.time}</p>
    ${S.flags.selfTalk ? '<p class="whisper">Сегодня она несколько раз говорила сама с собой. Как всегда.</p>' : ''}
    ${S.flags.door==="ignore" ? '<p class="whisper">Гость так и не вернулся. Она не знает, хорошо это или нет.</p>' : ''}
    <button id="restart" onclick="go(restart)">Прожить ещё один день</button>
    <div class="note" id="note"></div>
  `);
}

/* ============ ПЕРЕЗАПУСК ============ */
function restart(){
  S.time=5; S.str=5; S.warm=5;
  S.flags={ checkedTree:false, hidBark:0, selfTalk:false, door:"", guest:"", aadrianWalk:false, aadrianStayed:false };
  sceneDawn();
}

/* ============ УТИЛИТЫ ============ */
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

/* ============ СТАРТ ============ */
sceneDawn();
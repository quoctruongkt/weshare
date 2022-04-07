import { useCallback, useEffect, useMemo, useState } from "react";
import Phaser from "phaser";
import GridEngine from "grid-engine";
import BootScene from "./game/scenes/BootScene";
import MainMenuScene from "./game/scenes/MainMenuScene";
import GameOverScene from "./game/scenes/GameOverScene";
import GameScene from "./game/scenes/GameScene";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import { Backdrop, Fade, Modal, Typography } from "@material-ui/core";
import dialogBorderBox from "./game/assets/images/dialog_borderbox.png";
import GameMenu from "./game/GameMenu";
import DialogBox from "./game/DialogBox";
import HeroCoin from "./game/HeroCoin";
import HeroHealth from "./game/HeroHealth";
import "./App.css";
import { calculateGameSize } from "./game/utils";
import ReactAudioPlayer from "react-audio-player";
import apple from "./game/assets/audio/apple.mp3";
import volume from "./game/assets/images/volume.png";
import trophy from "./game/assets/images/trophy.png";

const { width, height, multiplier } = calculateGameSize();

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: "auto",
  },
  postContainer: {
    maxWidth: "90%",
    maxHeight: "90%",
  },
  gameContentWrapper: {
    width: `${width * multiplier}px`,
    height: `${height * multiplier}px`,
    margin: "auto",
    padding: 0,
    overflow: "hidden",
    "& canvas": {
      imageRendering: "pixelated",
      "-ms-interpolation-mode": "nearest-neighbor",
      boxShadow: "0px 0px 0px 3px rgba(0,0,0,0.75)",
    },
  },
  pageWrapper: {
    background: theme.palette.background.paper,
    padding: 0,
    margin: 0,
  },
  loadingText: {
    fontFamily: '"Press Start 2P"',
    marginTop: "30px",
    marginLeft: "30px",
  },
  preLoadDialogImage: {
    backgroundImage: `url("${dialogBorderBox}")`,
    backgroundSize: "1px",
    backgroundRepeat: "no-repeat",
  },
  gameWrapper: {
    color: "#FFFFFF",
  },
  gameGif: {
    width: "100%",
    position: "absolute",
    imageRendering: "pixelated",
    top: 0,
  },
}));

const url = "https://vysqy4zclvobj.vcdn.cloud/E_Learning/page/";

const dialogs = {
  npc_01: [
    {
      message: "Hello",
    },
  ],
  npc_02: [
    {
      message: "Hello there",
    },
  ],
  npc_03: [
    {
      message: "Hi",
    },
  ],
  npc_04: [
    {
      message: "Hey",
    },
  ],
  sword: [
    {
      message:
        "Newton phát hiện ra định luật hấp dẫn sau khi bị quả gì rơi vào đầu?",
      answer: "apple",
      audio: apple,
    },
  ],
  apple: [
    {
      message: "Quả gì khi chín đỏ tươi. Ăn vào ngọt mát, da thời đẹp hơn?",
      answer: "apple",
      audio: "apple.mp3",
    },
  ],
  watermelon: [
    {
      message: "Quả gì nổi tiếng trong sự tích Mai An Tiêm?",
      answer: "watermelon",
      audio: "water_melon.mp3",
    },
  ],
  pineapple: [
    {
      message: "Quả gì có nhiều mắt nhất?",
      answer: "pineapple",
      audio: "pineapple.mp3",
    },
  ],
  orange: [
    {
      message: "Quả gì bổ sung nhiều vitamin C cho cơ thể?",
      answer: "orange",
      audio: "orange.mp3",
    },
  ],
  mango: [
    {
      message:
        "Lủng liễng trĩu trịt cành cao. Nghe tên cứ ngỡ ngã nhào đất đen?",
      answer: "mango",
      audio: "mango.mp3",
    },
  ],
  cherries: [
    {
      message: "Quả gì màu đỏ ăn rất ngon?",
      answer: "cherry",
      audio: "cherry.mp3",
    },
  ],
  banana: [
    {
      message: "Vỏ quả này dẫm phải rất dễ ngã đó nha",
      answer: "banana",
      audio: "banana.mp3",
    },
  ],
  avocado: [
    {
      message:
        "Da thì đen mượt, Ruột trắng hơn ngà, Mùi vị đậm đà, Đắt ơi là đắt - Là quả gì?",
      answer: "avocado",
      audio: "avocado.mp3",
    },
  ],
  push: [
    {
      message: "You can push boxes now",
    },
  ],
  sign_01: [
    {
      message: "You can read this!",
    },
  ],
  book_01: [
    {
      message: "Welcome to the game!",
    },
  ],
};

const arrQuestion = [
  "apple",
  "watermelon",
  "orange",
  "pineapple",
  "cherries",
  "mango",
  "banana",
  "avocado",
];

function App() {
  const classes = useStyles();
  const [messages, setMessages] = useState([]);
  const [characterName, setCharacterName] = useState("");
  const [gameMenuItems, setGameMenuItems] = useState(["hihi"]);
  const [gameMenuPosition, setGameMenuPosition] = useState("center");
  const [heroHealthStates, setHeroHealthStates] = useState([
    "full",
    "full",
    "full",
  ]);
  const [heroCoins, setHeroCoins] = useState(0);
  const [urlAudio, setUrlAudio] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);

  const handleMessageIsDone = useCallback(() => {
    const customEvent = new CustomEvent(`${characterName}-dialog-finished`, {
      detail: {},
    });
    window.dispatchEvent(customEvent);

    setMessages([]);
    setCharacterName("");
  }, [characterName]);

  const handleMenuItemSelected = useCallback((selectedItem) => {
    setGameMenuItems([]);

    const customEvent = new CustomEvent("menu-item-selected", {
      detail: {
        selectedItem,
      },
    });
    window.dispatchEvent(customEvent);
  }, []);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      title: "some-game-title",
      parent: "game-content",
      orientation: Phaser.Scale.LANDSCAPE,
      localStorageName: "some-game-title",
      width,
      height,
      autoRound: true,
      pixelArt: true,
      scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.ENVELOP,
      },
      scene: [BootScene, MainMenuScene, GameScene, GameOverScene],
      physics: {
        default: "arcade",
      },
      plugins: {
        scene: [
          {
            key: "gridEngine",
            plugin: GridEngine,
            mapping: "gridEngine",
          },
        ],
      },
      backgroundColor: "#000000",
    });

    window.phaserGame = game;
  }, []);

  useEffect(() => {
    if (gameMenuItems.length == 0) {
      console.log("start");
      const question = arrQuestion[questionIndex];
      localStorage.setItem("question", question);
      setUrlAudio(`${url}${dialogs[question][0].audio}`);
    }
  }, [questionIndex, gameMenuItems]);

  useEffect(() => {
    const dialogBoxEventListener = ({ detail }) => {
      // TODO fallback
      detail.characterName === arrQuestion[questionIndex] &&
        setUrlAudio(`${url}${dialogs[detail.characterName][0].audio}`);
      setCharacterName(detail.characterName);
      setMessages(dialogs[detail.characterName]);
    };
    window.addEventListener("new-dialog", dialogBoxEventListener);

    const gameMenuEventListener = ({ detail }) => {
      setGameMenuItems(detail.menuItems);
      setGameMenuPosition(detail.menuPosition);
    };
    window.addEventListener("menu-items", gameMenuEventListener);

    const heroHealthEventListener = ({ detail }) => {
      // console.log(detail);
      setHeroHealthStates(detail.healthStates);
    };
    window.addEventListener("hero-health", heroHealthEventListener);

    const heroCoinEventListener = ({ detail }) => {
      // setHeroCoins(detail.heroCoins);
    };
    window.addEventListener("hero-coin", heroCoinEventListener);

    return () => {
      window.removeEventListener("new-dialog", dialogBoxEventListener);
      window.removeEventListener("menu-items", gameMenuEventListener);
      window.removeEventListener("hero-health", heroHealthEventListener);
      window.removeEventListener("hero-coin", heroCoinEventListener);
    };
  }, [setCharacterName, setMessages]);
  console.log(gameMenuItems);
  return (
    <div>
      {gameMenuItems.length == 0 && (
        <div class="leaderboard">
          <h1>
            <img src={trophy} />
            Leader Board
          </h1>
          <ol>
            <li>Jerry Wood</li>
            <li>Brandon Barnes</li>
            <li>Raymond Knight</li>
            <li>Trevor McCormick</li>
            <li>Andrew Fox</li>
          </ol>
        </div>
      )}
      <ReactAudioPlayer
        src={urlAudio}
        autoPlay={true}
        controls
        style={{ display: "none" }}
        onEnded={() => setUrlAudio("")}
      />
      <div className={classes.gameWrapper}>
        <div id="game-content" className={classes.gameContentWrapper}>
          {/* this is where the game canvas will be rendered */}
        </div>
        {gameMenuItems.length === 0 && (
          <button
            onClick={() =>
              setUrlAudio(
                `${url}${dialogs[localStorage.getItem("question")][0].audio}`
              )
            }
            style={{
              position: "fixed",
              right: "500px",
              top: "40px",
              backgroundColor: "transparent",
              border: 0,
              cursor: "pointer",
            }}
          >
            <img src={volume} />
          </button>
        )}
        {heroHealthStates.length > 0 && (
          <HeroHealth
            gameSize={{
              width,
              height,
              multiplier,
            }}
            healthStates={heroHealthStates}
          />
        )}
        {heroCoins !== null && (
          <HeroCoin
            gameSize={{
              width,
              height,
              multiplier,
            }}
            heroCoins={heroCoins}
          />
        )}
        {messages.length > 0 && (
          <DialogBox
            onDone={handleMessageIsDone}
            characterName={characterName}
            messages={messages}
            gameSize={{
              width,
              height,
              multiplier,
            }}
            setHeroCoins={setHeroCoins}
            setHeroHealthStates={setHeroHealthStates}
            question={arrQuestion[questionIndex]}
            setQuestionIndex={setQuestionIndex}
            heroHealthStates={heroHealthStates}
          />
        )}
        {gameMenuItems.length > 0 && (
          <GameMenu
            items={gameMenuItems}
            gameSize={{
              width,
              height,
              multiplier,
            }}
            position={gameMenuPosition}
            onSelected={handleMenuItemSelected}
          />
        )}
      </div>
    </div>
  );
}

export default App;

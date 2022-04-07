import { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useForm } from "react-hook-form";
import dungAudio from "./assets/audio/dung.mp3";
import saiAudio from "./assets/audio/sai.wav";

// Images
import dialogBorderBox from "./assets/images/dialog_borderbox.png";

// Components
import Message from "./Message";
import ReactAudioPlayer from "react-audio-player";

const useStyles = makeStyles((theme) => ({
  dialogWindow: ({ width, height, multiplier }) => {
    const messageBoxHeight = Math.ceil((height / 3.5) * multiplier);
    return {
      imageRendering: "pixelated",
      fontFamily: '"Press Start 2P"',
      textTransform: "uppercase",
      backgroundColor: "#e2b27e",
      border: "solid",
      borderImage: `url("${dialogBorderBox}") 6 / ${6 * multiplier}px ${
        6 * multiplier
      }px ${6 * multiplier}px ${6 * multiplier}px stretch`,
      padding: `${8 * multiplier}px`,
      position: "absolute",
      top: `${Math.ceil(
        height * multiplier - (messageBoxHeight + messageBoxHeight * 0.1) - 50
      )}px`,
      width: `${Math.ceil(width * 0.8 * multiplier)}px`,
      left: "50%",
      transform: "translate(-50%, 0%)",
      minHeight: `${messageBoxHeight}px`,
    };
  },
  dialogTitle: ({ multiplier }) => ({
    fontSize: `${8 * multiplier}px`,
    marginBottom: `${6 * multiplier}px`,
    fontWeight: "bold",
  }),
  dialogFooter: ({ multiplier }) => ({
    fontSize: `${8 * multiplier}px`,
    cursor: "pointer",
    textAlign: "end",
    position: "absolute",
    right: `${6 * multiplier}px`,
    bottom: `${6 * multiplier}px`,
  }),
  buttonSubmit: ({ multiplier }) => ({
    fontSize: `${8 * multiplier}px`,
    marginLeft: "20px",
  }),
  input: ({ multiplier }) => ({
    fontSize: `${8 * multiplier}px`,
  }),
}));

const DialogBox = ({
  messages,
  characterName,
  onDone,
  gameSize,
  setHeroCoins,
  question,
  setHeroHealthStates,
  setQuestionIndex,
  heroHealthStates,
}) => {
  const { register, handleSubmit } = useForm();
  const { width, height, multiplier } = gameSize;

  const [currentMessage, setCurrentMessage] = useState(0);
  const [messageEnded, setMessageEnded] = useState(false);
  const [forceShowFullMessage, setForceShowFullMessage] = useState(false);
  const [results, setResults] = useState("");
  const [urlAudio, setUrlAudio] = useState("");
  const classes = useStyles({
    width,
    height,
    multiplier,
  });

  const onSubmit = (data) => {
    const input = data.textInput.toLowerCase();
    if (input === messages[0].answer) {
      setHeroCoins((pre) => pre + 5);
      setUrlAudio(dungAudio);
      setResults("Đúng rồi");
    } else {
      setUrlAudio(saiAudio);
      setHeroCoins((pre) => pre - 5);
      setResults("Sai rồi");
    }
  };

  const handleClick = useCallback(() => {
    if (characterName === question) {
      if (messageEnded) {
        setMessageEnded(false);
        setForceShowFullMessage(false);
        if (currentMessage < messages.length - 1) {
          setCurrentMessage(currentMessage + 1);
        } else {
          setCurrentMessage(0);
          onDone();
          setQuestionIndex((pre) => pre + 1);
        }
      } else {
        setMessageEnded(true);
        setForceShowFullMessage(true);
      }
    } else {
      onDone();
    }
  }, [currentMessage, messageEnded, messages.length, onDone]);

  useEffect(() => {
    const handleKeyPressed = (e) => {
      if (["Space", "Escape"].includes(e.code)) {
        handleClick();
      }
    };
    window.addEventListener("keydown", handleKeyPressed);

    return () => window.removeEventListener("keydown", handleKeyPressed);
  }, [handleClick]);

  useEffect(() => {
    if (characterName !== question) {
      setHeroHealthStates(
        heroHealthStates.filter((item, i) => i !== heroHealthStates.length - 1)
      );
      setUrlAudio(saiAudio);
    } else {
      setHeroCoins((pre) => pre + 5);
      // setUrlAudio(dungAudio);
    }
  }, []);

  return (
    <div className={classes.dialogWindow}>
      <ReactAudioPlayer
        src={urlAudio}
        autoPlay
        controls
        style={{ display: "none" }}
      />
      <div className={classes.dialogTitle}>Quả gì?</div>
      {characterName === question ? (
        <>
          <Message
            action={messages[currentMessage].action}
            message={messages[currentMessage].message}
            key={currentMessage}
            multiplier={multiplier}
            forceShowFullMessage={forceShowFullMessage}
            onMessageEnded={() => {
              setMessageEnded(true);
            }}
          />
          {!results ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginTop: "30px" }}>
                <input
                  type="text"
                  {...register("textInput")}
                  placeholder="Nhập từ vừa nghe được"
                  className={classes.input}
                />
                <button type="submit" className={classes.buttonSubmit}>
                  Kiểm tra
                </button>
              </div>
            </form>
          ) : (
            <div>{results}</div>
          )}
        </>
      ) : (
        <div>Bạn đã chọn sai</div>
      )}
      <div onClick={handleClick} className={classes.dialogFooter}>
        Bỏ qua
        {/* {currentMessage === messages.length - 1 && messageEnded
          ? "Bỏ qua"
          : "Next"} */}
      </div>
    </div>
  );
};

export default DialogBox;

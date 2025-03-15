import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

import PlayGroundTopSection from "./playground_top_section.jsx";
import PlayerRow from "./player_row.jsx";
import BoundaryLine from "./boundary_line.jsx";

import dollAudioFile from "../../Assets/squid_game_doll_audio.mp3";

<<<<<<< HEAD
const toBeKilledArray = [true, false, false, false, true, false, false, true, false, true];

const SquidGame = forwardRef(({ autoStart, onGameComplete, lastTestCasesArray }, ref) => {
=======
const toBeKilledArray = [true, false, true, false, true];

const SquidGame = forwardRef(({ autoStart, onGameComplete }, ref) => {
>>>>>>> 613e8aeabc5aab36f2a51fd1b3ad034e727a685e
  const playerRowRef = useRef(null);
  const dollRef = useRef(null); // Ref for the Doll component

  useEffect(() => {
    if (autoStart) {
      // Add a small delay to ensure components are mounted
      const timer = setTimeout(() => {
        startGame();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  const playAudio = (audioFileUrl) => {
    const audio = new Audio(audioFileUrl);
<<<<<<< HEAD
    if (dollRef.current) {
      console.log("Triggering doll turn...");
      dollRef.current.turnAfterDelay();
    }
=======

>>>>>>> 613e8aeabc5aab36f2a51fd1b3ad034e727a685e
    // Play the audio
    audio.play().catch((error) => {
      console.error("Failed to play the audio:", error);
    });

    // When the first audio finishes, play it again and enable next button
    audio.onended = () => {
      const audio2 = new Audio(audioFileUrl);
      audio2.play().catch((error) => {
        console.error("Failed to play the second audio:", error);
      });
      
      if (dollRef.current) {
        console.log("Triggering doll turn...");
        dollRef.current.turnAfterDelay();
      }

      // When second audio ends, trigger game completion
      audio2.onended = () => {
        if (onGameComplete) {
          onGameComplete();
        }
      };
    };
  };

  const startGame = () => {
    playAudio(dollAudioFile);

    if (playerRowRef.current) {
      playerRowRef.current.startFallingAllPlayers();
    }
  };

<<<<<<< HEAD
  console.log("To Be Killed Array:", toBeKilledArray); // Debug log to see the array
  console.log("Last Test Cases Array:", lastTestCasesArray); // Debug log to see the array
=======
>>>>>>> 613e8aeabc5aab36f2a51fd1b3ad034e727a685e
  return (
    <div
      style={{
        backgroundColor: "#E8D897D1",
        height: "100vh",
        width: "50%",
        position: "absolute",
        left: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PlayGroundTopSection dollRef={dollRef} /> {/* Pass dollRef to PlayGroundTopSection */}
      <BoundaryLine Customstyle={{ marginTop: "35px" }} />
<<<<<<< HEAD
      <PlayerRow ref={playerRowRef} toBeKilledArray={toBeKilledArray} lastTestCasesArray={lastTestCasesArray} />
=======
      <PlayerRow ref={playerRowRef} toBeKilledArray={toBeKilledArray} />
>>>>>>> 613e8aeabc5aab36f2a51fd1b3ad034e727a685e
      <button onClick={startGame}>Start Game</button>
      <BoundaryLine Customstyle={{ marginTop: "auto", marginBottom: "35px" }} />
    </div>
  );
});

export default SquidGame;

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

import PlayGroundTopSection from "./playground_top_section.jsx";
import PlayerRow from "./player_row.jsx";
import BoundaryLine from "./boundary_line.jsx";

import dollAudioFile from "../../Assets/squid_game_doll_audio.mp3";

const toBeKilledArray = [true, false, true, false, true];

const SquidGame = forwardRef(({ autoStart, onGameComplete }, ref) => {
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
      <PlayerRow ref={playerRowRef} toBeKilledArray={toBeKilledArray} />
      <button onClick={startGame}>Start Game</button>
      <BoundaryLine Customstyle={{ marginTop: "auto", marginBottom: "35px" }} />
    </div>
  );
});

export default SquidGame;

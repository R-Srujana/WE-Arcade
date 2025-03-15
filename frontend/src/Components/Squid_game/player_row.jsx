import React, { useRef, forwardRef, useImperativeHandle } from "react";
import Player from "./player.jsx";

<<<<<<< HEAD
const PlayerRow = forwardRef(({ toBeKilledArray, lastTestCasesArray, survivingCount, deadCount }, ref) => {
=======
const PlayerRow = forwardRef(({ toBeKilledArray }, ref) => {
>>>>>>> 613e8aeabc5aab36f2a51fd1b3ad034e727a685e
  const playerRefs = useRef([]);

  const startFallingAllPlayers = () => {
    playerRefs.current.forEach((playerRef) => {
      if (playerRef) {
        playerRef.startFalling();
      }
    });
  };

<<<<<<< HEAD
  useImperativeHandle(ref, () => ({ 
=======
  useImperativeHandle(ref, () => ({
>>>>>>> 613e8aeabc5aab36f2a51fd1b3ad034e727a685e
    startFallingAllPlayers,
  }));

  return (
<<<<<<< HEAD
    <div>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <span style={{ color: 'green', marginRight: '20px' }}>Surviving: {survivingCount}</span>
        <span style={{ color: 'red' }}>Dead: {deadCount}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {lastTestCasesArray.map((testCase, index) => {
          console.log("Rendering Player:", index, "Test Case:", testCase);
          return (
            <Player
              key={index}
              left={`${5 + index * 10}%`}
              to_be_killed={toBeKilledArray[index]}
              isFailedTestCase={testCase}
              playerType={index % 2 === 0 ? 1 : 2}
              ref={(el) => (playerRefs.current[index] = el)}
            />
          );
        })}
      </div>
=======
    <div style={{ display: "flex", justifyContent: "space-around" }}>
      {toBeKilledArray.map((toBeKilled, index) => (
        <Player
          key={index}
          left={`${20 + index * 15}%`}
          to_be_killed={toBeKilled}
          ref={(el) => (playerRefs.current[index] = el)}
        />
      ))}
>>>>>>> 613e8aeabc5aab36f2a51fd1b3ad034e727a685e
    </div>
  );
});

export default PlayerRow;

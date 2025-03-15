import React, { useRef, forwardRef, useImperativeHandle } from "react";
import Player from "./player.jsx";

const PlayerRow = forwardRef(({ toBeKilledArray, lastTestCasesArray, survivingCount, deadCount }, ref) => {
  const playerRefs = useRef([]);

  const startFallingAllPlayers = () => {
    playerRefs.current.forEach((playerRef) => {
      if (playerRef) {
        playerRef.startFalling();
      }
    });
  };

  useImperativeHandle(ref, () => ({ 
    startFallingAllPlayers,
  }));

  return (
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
    </div>
  );
});

export default PlayerRow;

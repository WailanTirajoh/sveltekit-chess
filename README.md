# Simple Chess
Simple Chess built with SvelteKit.

## Features:
- [ ] Piece & Move Rule
  - [x] Rook
  - [x] Knight
  - [x] Bishop
  - [x] Queen
  - [ ] King
    - [x] Basic Move
    - [ ] Castling
  - [ ] Pawn
    - [x] Basic Move 
    - [ ] En Passant
- [x] Replay & Move History
- [x] Game Time
- [ ] Game Over
    - [ ] Resign
    - [ ] Checkmate (Almost there~)
    - [x] Time win (Done)
    - [ ] Draw
      - [ ] Acceptance Draw offer
      - [ ] Insufficient Material
      - [ ] Lose on time, but enemy insufficient material for checkmate

## After All Features:
- [ ] Multiplayer _(TBD Tech usage for realtime move)_

## Bug Findings:
1. Need to guard the checker router.
Move:
```
2_5,4_5|7_5,5_5|1_7,3_6|8_2,6_3|1_6,4_3|8_7,6_6|3_6,5_7|7_4,5_4|4_5,5_4|6_6,5_4|5_7,7_6|8_5,7_6|1_4,3_6|7_6,8_7|4_3,5_4|8_4,5_4|3_6,5_4
```

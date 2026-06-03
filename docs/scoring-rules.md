# Scoring Rules

This document summarizes the fantasy scoring assumptions migrated for the leaderboard/business-logic baseline.

## Position Scoring Table

| Event | GK | DEF | MID | FWD |
| --- | ---: | ---: | ---: | ---: |
| Goal | 6 | 6 | 5 | 4 |
| Assist | 3 | 3 | 3 | 3 |
| Clean sheet | 4 | 4 | 1 | 0 |
| Penalty save | 5 | 5 | 0 | 0 |
| 3+ saves | 2 | 0 | 0 | 0 |
| Yellow card | -1 | -1 | -1 | -1 |
| Red card | -3 | -3 | -3 | -3 |
| Own goal | -2 | -2 | -2 | -2 |
| 60+ minutes played | 2 | 2 | 2 | 2 |
| Man of the match configured value | 3 | 3 | 3 | 3 |

## Goals

Goals are multiplied by the player's position scoring value. Goalkeepers and defenders receive 6 points per goal, midfielders receive 5, and forwards receive 4.

## Assists

Assists are worth 3 points for all positions.

## Clean Sheets

Clean sheets are awarded when the player's team has conceded 0 goals. Goalkeepers and defenders receive 4 points, midfielders receive 1 point, and forwards receive 0.

## Saves

Goalkeepers receive 2 points when they record at least 3 saves. Other positions receive 0 for this rule.

## Penalty Saves

Goalkeepers and defenders receive 5 points per penalty saved. Midfielders and forwards receive 0 in the current scoring table.

## Cards

Yellow cards subtract 1 point each. Red cards subtract 3 points each.

## Own Goals

Own goals subtract 2 points each. Own goals are populated from API-FOOTBALL fixture events when the event detail is `Own Goal`.

## Minutes Played Bonus

Players receive 2 points when `minutesPlayed >= 60`.

## Captain Multiplier

Captain points are doubled after base scoring is calculated.

## Power-Up Multipliers And Effects

The `triple_captain` power-up changes the captain multiplier from `2x` to `3x`.

The `bench_boost` power-up adds bench player points to the lineup total. Bench players are scored without captain status and without additional power-ups.

Configured but not currently applied in the scoring Function:

- `captain_boost`
- `wild_card`

## Current Scoring Assumptions

- Unknown or unsupported player positions fall back to midfielder scoring.
- API-FOOTBALL fixture player stats are the source for goals, assists, saves, cards, minutes, and penalties saved.
- Match score is used to infer clean sheets.
- Live points recalculate every 2 minutes for matches with `status == "live"`.
- Only lineups with `status == "locked"` are scored by the live points Function.
- Final match points are added to user totals when a match status changes to `finished`.
- The scoring config includes `motm: 3`, but current calculation does not apply man-of-the-match points.

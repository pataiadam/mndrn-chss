import {Elysia, t} from "elysia";
import type {Game} from "../../Services/GameService";
import GameService from "../../Services/GameService";

export default (app: Elysia) => {
  app.get("/elo", async () => {
    const games: Game[] = await GameService.findGames();

    const eloRankings = games.reduce((acc: Record<string, any>, game: Game) => {
        if (!acc[game.white]) {
            acc[game.white] = {
              elo: 1400,
              totalGames: 0,
              totalPlayedAsWhite: 0,
              totalPlayedAsBlack: 0,
              totalWins: 0,
              totalLosses: 0,
              totalDraws: 0,
            }
        }

        if (!acc[game.black]) {
            acc[game.black] = {
              elo: 1400,
              totalGames: 0,
              totalPlayedAsWhite: 0,
              totalPlayedAsBlack: 0,
              totalWins: 0,
              totalLosses: 0,
              totalDraws: 0,
            }
        }

        acc[game.white].totalGames += 1
        acc[game.black].totalGames += 1

        if (game.result === 'W') {
            acc[game.white].totalWins += 1
            acc[game.black].totalLosses += 1
        }

        if (game.result === 'B') {
            acc[game.white].totalLosses += 1
            acc[game.black].totalWins += 1
        }

        if (game.result === 'T') {
            acc[game.white].totalDraws += 1
            acc[game.black].totalDraws += 1
        }

        acc[game.white].totalPlayedAsWhite += 1
        acc[game.black].totalPlayedAsBlack += 1

      const expected = 1 / (1 + 10 ** ((acc[game.black].elo - acc[game.white].elo) / 400))
      const k = 20
      const actual = game.result === "W" ? 1 : game.result === "B" ? 0 : 0.5

      acc[game.white].elo = Math.round((acc[game.white].elo + k * (actual - expected)) * 100) / 100
      acc[game.black].elo = Math.round((acc[game.black].elo + k * (expected - actual)) * 100) / 100

      return acc
    }, {})

    return {
      success: true,
      data: Object.entries(eloRankings).map(([name, data]) => ({
          name,
          ...data
      })).sort((a, b) => b.elo - a.elo)
    }
  }, {
    response: t.Object({
      success: t.Boolean(),
      data: t.Array(t.Object({
        name: t.String(),
        elo: t.Number(),

        totalGames: t.Number(),
        totalPlayedAsWhite: t.Number(),
        totalPlayedAsBlack: t.Number(),

        totalWins: t.Number(),
        totalLosses: t.Number(),
        totalDraws: t.Number(),
      }))
    })
  })
}

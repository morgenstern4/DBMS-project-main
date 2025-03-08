const express = require("express");
const con = require("../server/connection");
const router = express.Router();

// Route for top players
router.get("/top_players", (req, res) => {
  const sql = `
    SELECT player_name, goals, matches_played
    FROM all_players_info
    JOIN players_stats ON all_players_info.player_id = players_stats.player_id
    ORDER BY goals DESC
    LIMIT 5;
  `;
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching top players:", err);
      return res.status(500).send("Database error");
    }
    res.render("top_players", { top_players: result });
  });
});

// Route for squads with high goals
router.get("/squads_with_high_goals", (req, res) => {
  const sql = `
    SELECT squad_name, SUM(goals) AS total_goals
    FROM squads
    JOIN all_players_info ON squads.squad_id = all_players_info.squad_id
    JOIN players_stats ON all_players_info.player_id = players_stats.player_id
    GROUP BY squad_name
    HAVING SUM(goals) > 10;
  `;
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching squads with high goals:", err);
      return res.status(500).send("Database error");
    }
    res.render("squads_with_high_goals", { squads: result });
  });
});

// Route for keepers
router.get("/keepers", (req, res) => {
  const sql = `
    SELECT 
        p.player_name AS goalkeeper_name,
        s.squad_name,
        c.club_name
    FROM all_players_info p
    JOIN keepers_stats ks ON p.player_id = ks.player_id
    JOIN squads s ON p.squad_id = s.squad_id
    JOIN clubs c ON p.club_id = c.club_id
    ORDER BY p.player_name ASC;
  `;
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching keepers:", err);
      return res.status(500).send("Database error");
    }
    res.render("keepers", { keepers: result });
  });
});

// Route for squads and players
router.get("/squads_and_players", (req, res) => {
  const sql = `
    SELECT s.squad_name, p.player_name
    FROM Squads s
    CROSS JOIN All_players_info p
    WHERE s.squad_id = p.squad_id
    GROUP BY s.squad_name, p.player_name;
  `;
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching squads and players:", err);
      return res.status(500).send("Database error");
    }
    res.render("squads_and_players", { squads_and_players: result });
  });
});

// Route for squad goals
router.get("/squad_goals", (req, res) => {
  const sql = `
    SELECT squad_name, SUM(goals) AS total_goals
    FROM squads
    JOIN all_players_info ON squads.squad_id = all_players_info.squad_id
    JOIN players_stats ON all_players_info.player_id = players_stats.player_id
    GROUP BY squad_name
    ORDER BY total_goals DESC;
  `;
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching squad goals:", err);
      return res.status(500).send("Database error");
    }
    res.render("squad_goals", { squad_goals: result });
  });
});

// Route for clean sheet percentage
router.get("/clean_sheet_percentage", (req, res) => {
  const sql = `
    SELECT 
        p.player_name AS goalkeeper_name,
        p.matches_played,
        k.clean_sheets,
        (k.clean_sheets * 100.0 / p.matches_played) AS clean_sheet_percentage
    FROM 
        all_players_info p
    JOIN 
        keepers_stats k ON p.player_id = k.player_id
    ORDER BY 
        k.clean_sheets DESC;
  `;
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching clean sheet percentages:", err);
      return res.status(500).send("Database error");
    }
    res.render("clean_sheet_percentage", { clean_sheets: result });
  });
});

// Route for top scorers
router.get("/top_scorers", (req, res) => {
  const limit = parseInt(req.query.limit) || 5; // Convert to integer, default to 5
  const sql = `
    WITH TopScorers AS (
      SELECT player_id, goals
      FROM players_stats
      ORDER BY goals DESC
      LIMIT ?
    )
    SELECT player_name, goals
    FROM TopScorers
    JOIN all_players_info ON TopScorers.player_id = all_players_info.player_id;
  `;
  con.query(sql, [limit], (err, result) => {
    if (err) {
      console.error("Error fetching top scorers:", err);
      return res.status(500).send("Database error");
    }
    res.render("top_scorers", { top_scorers: result, selectedLimit: limit });
  });
});

// Route for players with penalties
router.get("/players_with_penalties", (req, res) => {
  const sql = `
    SELECT 
        p.player_name,
        (SELECT k.penalty_kicks_attempted FROM keepers_stats k WHERE k.player_id = p.player_id) AS penalties_attempted,
        (SELECT k.penalty_kicks_saved FROM keepers_stats k WHERE k.player_id = p.player_id) AS penalties_saved,
        (SELECT k.penalty_kicks_attempted - k.penalty_kicks_saved FROM keepers_stats k WHERE k.player_id = p.player_id) AS penalties_missed
    FROM 
        all_players_info p
    WHERE 
        EXISTS (
            SELECT 1
            FROM keepers_stats k
            WHERE k.player_id = p.player_id
            AND k.penalty_kicks_attempted > 0
            AND k.penalty_kicks_saved = 0
        );
  `;
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching players with penalties:", err);
      return res.status(500).send("Database error");
    }
    res.render("players_with_penalties", { players: result });
  });
});

// Route for players with above-average goals
router.get("/above_average_goals", (req, res) => {
  const sql = `
    SELECT player_name, goals
    FROM all_players_info
    JOIN players_stats ON all_players_info.player_id = players_stats.player_id
    WHERE goals > (SELECT AVG(goals) FROM players_stats);
  `;
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching players with above-average goals:", err);
      return res.status(500).send("Database error");
    }
    res.render("above_average_goals", { players: result });
  });
});

router.get("/match-finder", (req, res) => {
  const sql = "SELECT squad_id, squad_name FROM Squads";
  con.query(sql, (err, squads) => {
      if (err) {
          console.error("Error fetching squads:", err);
          return res.status(500).send("Database error");
      }
      res.render("match-finder", { squads });
  });
});

router.get("/find-matches", (req, res) => {
  const squad1 = req.query.squad1;
  const squad2 = req.query.squad2;

  const sql = `
      SELECT 
          m.match_id, 
          m.match_date, 
          s1.squad_name AS squad_1_name, 
          s2.squad_name AS squad_2_name, 
          m.score_squad_1, 
          m.score_squad_2
      FROM matches m
      JOIN Squads s1 ON m.squad_1_id = s1.squad_id
      JOIN Squads s2 ON m.squad_2_id = s2.squad_id
      WHERE (m.squad_1_id = ? AND m.squad_2_id = ?)
         OR (m.squad_1_id = ? AND m.squad_2_id = ?)
  `;
  const params = [squad1, squad2, squad2, squad1];

  con.query(sql, params, (err, matches) => {
      if (err) {
          console.error("Error fetching matches:", err);
          return res.status(500).send("Database error");
      }

      res.render("match-results", { matches });
  });
});

// Route for booking section
router.get("/booking", (req, res) => {
  res.render("booking", { individualResults: null, teamResults: null });
});

// Route for handling individual player search
router.post("/booking/individual", (req, res) => {
  const playerName = req.body.playerName;
  const sql = `
    SELECT 
        p.player_name, 
        s.squad_name, 
        ps.yellow_cards, 
        ps.red_cards
    FROM players_stats ps
    JOIN all_players_info p ON ps.player_id = p.player_id
    JOIN squads s ON p.squad_id = s.squad_id
    WHERE p.player_name LIKE ?
    ORDER BY ps.yellow_cards DESC, ps.red_cards DESC;
  `;
  con.query(sql, [`%${playerName}%`], (err, result) => {
    if (err) {
      console.error("Error fetching individual booking data:", err);
      return res.status(500).send("Database error");
    }
    res.render("booking", { individualResults: result, teamResults: null });
  });
});

// Route for handling team/squad search
router.post("/booking/team", (req, res) => {
  const squadName = req.body.squadName;
  const sql = `
    SELECT squad_name, SUM(yellow_cards) AS total_yellow_cards, SUM(red_cards) AS total_red_cards
    FROM players_stats
    JOIN all_players_info ON players_stats.player_id = all_players_info.player_id
    JOIN squads ON all_players_info.squad_id = squads.squad_id
    WHERE squad_name LIKE ?
    GROUP BY squad_name;
  `;
  con.query(sql, [`%${squadName}%`], (err, result) => {
    if (err) {
      console.error("Error fetching team booking data:", err);
      return res.status(500).send("Database error");
    }
    res.render("booking", { individualResults: null, teamResults: result });
  });
});

// Route for showing all individual players' booking data
router.get("/booking/all_individuals", (req, res) => {
  const sql = `
    SELECT 
        p.player_name, 
        s.squad_name, 
        ps.yellow_cards, 
        ps.red_cards
    FROM players_stats ps
    JOIN all_players_info p ON ps.player_id = p.player_id
    JOIN squads s ON p.squad_id = s.squad_id
    ORDER BY ps.yellow_cards DESC, ps.red_cards DESC;
  `;
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching all individual booking data:", err);
      return res.status(500).send("Database error");
    }
    res.render("booking", { individualResults: result, teamResults: null });
  });
});

// Route for showing all teams' booking data
router.get("/booking/all_teams", (req, res) => {
  const sql = `
    SELECT squad_name, SUM(yellow_cards) AS total_yellow_cards, SUM(red_cards) AS total_red_cards
    FROM players_stats
    JOIN all_players_info ON players_stats.player_id = all_players_info.player_id
    JOIN squads ON all_players_info.squad_id = squads.squad_id
    GROUP BY squad_name
    ORDER BY total_yellow_cards DESC, total_red_cards DESC;
  `;
  con.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching all team booking data:", err);
      return res.status(500).send("Database error");
    }
    res.render("booking", { individualResults: null, teamResults: result });
  });
});

// analytics.js

// Route for tournament tree (Round of 16 to Final)
// analytics.js

// Route for tournament tree (Round of 16 to Final)
// analytics.js
// analytics.js

// Route for tournament tree (Final to Round of 16)
// analytics.js

// Route for tournament tree (Final to Round of 16)
// analytics.js

// Route for tournament tree (Final to Round of 16)
router.get("/tournament_tree", (req, res) => {
  const sql = `
      SELECT 
          m.match_id,
          m.match_date,
          s1.squad_name AS squad_1_name,
          s2.squad_name AS squad_2_name,
          m.score_squad_1,
          m.score_squad_2
      FROM matches m
      JOIN squads s1 ON m.squad_1_id = s1.squad_id
      JOIN squads s2 ON m.squad_2_id = s2.squad_id
      ORDER BY m.match_id DESC
      LIMIT 32;
  `;

  con.query(sql, (err, result) => {
      if (err) {
          console.error("Error fetching tournament tree data:", err);
          return res.status(500).send("Database error");
      }

      // Organize matches into the tournamentTree structure
      const tournamentTree = {
          final: result[0], // First match is the Final
          thirdPlace: result[1], // Second match is the 3rd-place match
          semiFinals: result.slice(2, 4), // Next 2 matches are Semi-finals
          quarterFinals: result.slice(4, 8), // Next 4 matches are Quarter-finals
          roundOf16: result.slice(8), // Remaining matches are Round of 16
      };

      // Pass the tournamentTree object to the EJS template
      res.render("tournament_tree", { tournamentTree });
  });
});

// analytics.js

// Route for players with most assists
// Route for players with most assists
// analytics.js

// Route for players with most assists
router.get("/player_with_most_assists", (req, res) => {
  const limit = req.query.limit || 5; // Default limit is 5

  const sql = `
      SELECT 
          p.player_name,
          ps.assists
      FROM all_players_info p
      JOIN players_stats ps ON p.player_id = ps.player_id
      ORDER BY ps.assists DESC
      LIMIT 10;
  `;

  con.query(sql, [limit], (err, result) => {
      if (err) {
          console.error("Error fetching players with most assists:", err);
          return res.status(500).send("Database error");
      }

      // Pass the result and selected limit to the EJS template
      res.render("player_with_most_assists", { 
          players: result, 
          selectedLimit: parseInt(limit) 
      });
  });
});

module.exports = router;
const express = require("express");
const con = require("../server/connection");
const router = express.Router();

// Reusable function for rendering update success response
function renderUpdateSuccess(res, table, recordId, viewUrl) {
    res.send(`
        <h1>Update Successful</h1>
        <p>The record with ID <strong>${recordId}</strong> has been updated successfully in the ${table} table.</p>
        <a href="${viewUrl}" style="font-size: 18px; color: blue; text-decoration: underline;">
            Back to ${table.charAt(0).toUpperCase() + table.slice(1)} List
        </a>
    `);
}

// Update squad info
router.post("/tables/update-squad-info", (req, res) => {
    const { squad_id, squad_name } = req.body;
    const sql = "UPDATE squads SET squad_name = ? WHERE squad_id = ?";
    con.query(sql, [squad_name, squad_id], (err, result) => {
        if (err) {
            console.error("Error updating squad:", err);
            return res.status(500).send("Database error");
        }
        renderUpdateSuccess(res, 'Squad', squad_id, '/view_tables/squads');
    });
});

// Update club info
router.post("/tables/update-club-info", (req, res) => {
    const { club_id, club_name } = req.body;
    const sql = "UPDATE clubs SET club_name = ? WHERE club_id = ?";
    con.query(sql, [club_name, club_id], (err, result) => {
        if (err) {
            console.error("Error updating club:", err);
            return res.status(500).send("Database error");
        }
        renderUpdateSuccess(res, 'Club', club_id, '/view_tables/clubs');
    });
});

// Update position info
router.post("/tables/update-position-info", (req, res) => {
    const { position_id, position_name } = req.body;
    const sql = "UPDATE positions SET position_name = ? WHERE position_id = ?";
    con.query(sql, [position_name, position_id], (err, result) => {
        if (err) {
            console.error("Error updating position:", err);
            return res.status(500).send("Database error");
        }
        renderUpdateSuccess(res, 'Position', position_id, '/view_tables/positions');
    });
});

// Update stadium info
router.post("/tables/update-stadium-info", (req, res) => {
    const { stadium_id, stadium_name, capacity, total_match_played } = req.body;
    const sql = "UPDATE stadiums SET stadium_name = ?, capacity = ?, total_match_played = ? WHERE stadium_id = ?";
    con.query(sql, [stadium_name, capacity, total_match_played, stadium_id], (err, result) => {
        if (err) {
            console.error("Error updating stadium:", err);
            return res.status(500).send("Database error");
        }
        renderUpdateSuccess(res, 'Stadium', stadium_id, '/view_tables/stadiums');
    });
});

// Update player stats
router.post("/tables/update-player-stats", (req, res) => {
    const { player_stats_id, goals, yellow_cards, red_cards } = req.body;
    const sql = "UPDATE players_stats SET goals = ?, yellow_cards = ?, red_cards = ? WHERE player_stats_id = ?";
    con.query(sql, [goals, yellow_cards, red_cards, player_stats_id], (err, result) => {
        if (err) {
            console.error("Error updating player stats:", err);
            return res.status(500).send("Database error");
        }
        renderUpdateSuccess(res, 'Player Stats', player_stats_id, '/view_tables/players_stats');
    });
});

module.exports = router;
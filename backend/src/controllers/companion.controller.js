import { dbQuery, dbRun } from '../config/sqlite.js';

export const getCompanions = async (req, res) => {
  try {
    const companions = await dbQuery("SELECT * FROM companions ORDER BY created_at DESC");
    
    // Convert comma-separated interests back to an array for the frontend
    const formatted = companions.map(c => ({
      ...c,
      interests: c.interests ? c.interests.split(', ') : []
    }));
    
    res.json({ success: true, companions: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCompanion = async (req, res) => {
  try {
    const { name, destination, dates, interests, bio } = req.body;
    
    // Basic validation
    if (!name || !destination || !dates) {
      return res.status(400).json({ success: false, message: "Name, destination, and dates are required" });
    }

    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    const match = Math.floor(Math.random() * (99 - 75 + 1)) + 75; // Random match %
    const interestsStr = Array.isArray(interests) ? interests.join(', ') : (interests || "");

    const result = await dbRun(
      `INSERT INTO companions (name, avatar, match, destination, dates, interests, bio) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, avatar, match, destination, dates, interestsStr, bio || ""]
    );

    res.status(201).json({ 
      success: true, 
      companion: {
        id: result.id,
        name,
        avatar,
        match,
        destination,
        dates,
        interests: Array.isArray(interests) ? interests : [interestsStr],
        bio
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

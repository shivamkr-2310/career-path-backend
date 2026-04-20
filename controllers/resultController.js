const { pool } = require('../config/db');
const { getGeminiResponse } = require('../config/gemini');

const careerDatabase = {
  Technology: [
    { title: "Software Engineer", description: "Design and build software systems.", reason: "High score in Technology and Analytical thinking." },
    { title: "Cloud Architect", description: "Manage cloud infrastructure.", reason: "Strong aptitude for Technology and Research." }
  ],
  Management: [
    { title: "Project Manager", description: "Lead teams and manage timelines.", reason: "Strong Management and Social skills." },
    { title: "Business Analyst", description: "Analyze business needs and solutions.", reason: "High Analytical and Management scores." }
  ],
  Creative: [
    { title: "UI/UX Designer", description: "Design user-friendly interfaces.", reason: "Exceptional Creative and Technology blend." },
    { title: "Digital Artist", description: "Create visual content for media.", reason: "Highest score in Creative category." }
  ],
  Social: [
    { title: "Educational Consultant", description: "Help students find their path.", reason: "Strong Social and Analytical skills." },
    { title: "Public Relations Specialist", description: "Manage brand reputation.", reason: "High score in Social and Management." }
  ],
  Analytical: [
    { title: "Data Scientist", description: "Extract insights from complex data.", reason: "Exceptional Analytical and Technology skills." },
    { title: "Financial Analyst", description: "Analyze financial trends.", reason: "Strong Analytical and Research background." }
  ],
  Research: [
    { title: "Scientific Researcher", description: "Conduct experiments and studies.", reason: "Strong Research and Analytical scores." },
    { title: "Policy Analyst", description: "Analyze and propose policies.", reason: "High Research and Social impact interest." }
  ]
};

const generateRuleBasedResult = async (req, res) => {
  const { scores, responses = [], level, stream, course, branch, semester, userId } = req.body;
  console.log("Generating Career Result for:", { level, course, scores });

  const is10th = level === "10th Standard";

  // 🤖 Try AI Generation First
  try {
    const prompt = `
    You are an expert Career Counselor. Analyze these category scores and specific responses from a career assessment.
    
    Category Scores: ${JSON.stringify(scores)}
    
    Student's Detailed Responses:
    ${responses.map((r, i) => `${i + 1}. Q: ${r.question}\n   A: ${r.answer}`).join('\n')}

    Student's Background:
    - Level: ${level}
    - Stream: ${stream}
    - Course: ${course}
    - Branch: ${branch}
    - Semester: ${semester}

    TASK:
    ${is10th ? `1. RECOMMENDED STREAM: Based on their answers, recommend if they should choose Science, Commerce, or Humanities for 11th grade. Provide a clear reasoning.` : ''}
    2. TOP MATCHES: Based on their strengths and interests, identify the top 2 specific career paths.
    
    For EACH career path, provide:
    1. A specific title.
    2. A match percentage.
    3. A comprehensive description.
    4. A detailed reasoning that references their specific scores and answers.
    5. A 4-step detailed roadmap tailored to their current level.

    Return ONLY this JSON structure:
    {
      ${is10th ? `"recommendedStream": "Science / Commerce / Humanities", "streamReasoning": "...",` : ''}
      "topMatches": [
        { 
          "title": "Career 1", 
          "matchPercentage": 90-100, 
          "description": "...", 
          "reason": "...",
          "roadmap": [
            { "step": "Phase 1: ...", "action": "..." },
            { "step": "Phase 2: ...", "action": "..." },
            { "step": "Phase 3: ...", "action": "..." },
            { "step": "Phase 4: ...", "action": "..." }
          ]
        },
        { 
          "title": "Career 2", 
          "matchPercentage": 80-90, 
          "description": "...", 
          "reason": "...",
          "roadmap": [
            { "step": "Phase 1...", "action": "..." },
            { "step": "Phase 2...", "action": "..." },
            { "step": "Phase 3...", "action": "..." },
            { "step": "Phase 4...", "action": "..." }
          ]
        }
      ]
    }
    `;

    const aiResponse = await getGeminiResponse(prompt);
    let cleanText = aiResponse.replace(/```json|```/g, "").trim();
    const start = cleanText.indexOf('{');
    const end = cleanText.lastIndexOf('}');
    const finalResult = JSON.parse(cleanText.substring(start, end + 1));

    // 🩹 Ensure nested roadmaps exist for each match
    finalResult.topMatches = finalResult.topMatches.map(match => {
      if (!match.roadmap || !Array.isArray(match.roadmap)) {
        match.roadmap = [{ step: "Personalized Path", action: "Follow specific industry standards for " + match.title }];
      }
      return match;
    });

    // Save to DB
    if (userId) {
      const userResult = await pool.query('SELECT results FROM users WHERE id = $1', [userId]);
      const results = userResult.rows[0]?.results || [];
      results.push({ ...finalResult, date: new Date(), scores });
      await pool.query('UPDATE users SET results = $1 WHERE id = $2', [JSON.stringify(results), userId]);
    }

    return res.json(finalResult);
  } catch (error) {
    console.error("AI Result Error, falling back to Rules:", error.message);
    
    // 🛡️ Fallback Rule-Based Logic (Consistent Structure)
    try {
      const sortedCategories = Object.entries(scores).sort(([, a], [, b]) => b - a);
      const topCategory = sortedCategories[0][0];
      const secondCategory = sortedCategories[1] ? sortedCategories[1][0] : topCategory;

      const matches = [
        careerDatabase[topCategory] ? careerDatabase[topCategory][0] : careerDatabase.Technology[0],
        careerDatabase[secondCategory] ? (careerDatabase[secondCategory][1] || careerDatabase[secondCategory][0]) : careerDatabase.Analytical[0]
      ];

      const topScore = sortedCategories[0][1];
      const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
      
      const fallbackResult = {
        topMatches: matches.map((m, i) => ({
          ...m,
          matchPercentage: i === 0 ? Math.min(98, Math.floor((topScore / totalScore) * 100 + 40)) : Math.min(90, Math.floor((sortedCategories[1][1] / totalScore) * 100 + 30)),
          roadmap: [
            { step: "Phase 1: Fundamentals", action: `Master the core concepts of ${m.title}.` },
            { step: "Phase 2: Skill Up", action: `Focus on specialized tools in the ${i === 0 ? topCategory : secondCategory} category.` },
            { step: "Phase 3: Real Projects", action: "Build a portfolio showing practical applications." },
            { step: "Phase 4: Industry Entry", action: "Network and apply for internships in this field." }
          ]
        }))
      };

      if (userId) {
        const userResult = await pool.query('SELECT results FROM users WHERE id = $1', [userId]);
        const results = userResult.rows[0]?.results || [];
        results.push({ ...fallbackResult, date: new Date(), scores });
        await pool.query('UPDATE users SET results = $1 WHERE id = $2', [JSON.stringify(results), userId]);
      }

      res.json(fallbackResult);
    } catch (fallbackError) {
      res.status(500).json({ message: "Failed to generate result" });
    }
  }
};

const saveResult = async (req, res) => {
  const { userId, scores, finalResult } = req.body;
  try {
    const userResult = await pool.query('SELECT results FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0) {
      const results = userResult.rows[0].results || [];
      results.push({ ...finalResult, scores, date: new Date() });
      await pool.query('UPDATE users SET results = $1 WHERE id = $2', [JSON.stringify(results), userId]);
      res.status(201).json({ message: 'Result saved' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getResults = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT results FROM users WHERE id = $1', [userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0].results);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { saveResult, getResults, generateRuleBasedResult };

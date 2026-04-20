const { pool } = require('../config/db');
const { getGeminiResponse } = require('../config/gemini');

exports.generateQuestions = async (req, res) => {
    const { level, stream, course, branch, semester } = req.body;
    console.log("--- Question Generation Request ---");
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("Generating Questions for:", { level, stream, course, branch, semester });

    const studentContext = `
    - Education Level: ${level}
    - Stream: ${stream || 'N/A'}
    - Course: ${course || level}
    - Specialization/Branch: ${branch || 'General'}
    - Current Year/Semester: ${semester || 'Not Specified'}
    `;

    const randomSeed = Math.floor(Math.random() * 1000000);

    const is10th = level === "10th Standard";
    
    const prompt = `
    You are an AI Career Guidance Expert. 
    Task: Generate 10 technical and aptitude MCQ questions specifically for a student with this profile:
    ${studentContext}

    ${is10th ? `SPECIAL OBJECTIVE: The student is in 10th grade. Your goal is to evaluate their interest and aptitude in:
    1. Science (Logic, Math, Physics, Natural World)
    2. Commerce (Finance, Economics, Math, Organization)
    3. Humanities/Arts (Creativity, Social Studies, Language, Expression)
    The results will be used to recommend a stream for 11th grade.` : ''}

    The questions must:
    1. Be highly relevant to their current ${is10th ? 'academic level' : 'course and specialization'}.
    2. Reflect the expected knowledge level for someone in their ${semester || 'current year'}.
    3. Include a mix of:
       - Technical Core Knowledge (relevant to their field)
       - Industry Trends
       - Career Aptitude (scenarios they might face)
    4. Each question MUST have exactly 4 options.
    5. Each option MUST have a 'score' object that assigns points (0-5) to one or more categories: Technology, Management, Creative, Social, Analytical, Research.
    
    Variety ID: ${randomSeed}

    Format: Return ONLY a JSON array.
    Example Structure:
    [
      {
        "questionText": "...",
        "category": "...",
        "options": [
          { "text": "...", "score": { "Technology": 5 } },
          ...
        ]
      }
    ]
    `;

    try {
        const aiResponse = await getGeminiResponse(prompt);
        console.log("AI Response received for questions");
        
        let cleanText = aiResponse.replace(/```json|```/g, "").trim();
        const start = cleanText.indexOf('[');
        const end = cleanText.lastIndexOf(']');
        
        if (start === -1 || end === -1) {
            console.error("AI response did not contain a JSON array:", aiResponse);
            throw new Error("Invalid AI response format");
        }
        
        const questions = JSON.parse(cleanText.substring(start, end + 1));
        res.json({ 
            source: 'Gemini AI',
            questions: questions.map((q, i) => ({ ...q, _id: `ai_${Date.now()}_${i}` })) 
        });
    } catch (error) {
        console.error("AI Question Error:", error.message);
        // Fallback to static questions from DB
        try {
            const result = await pool.query('SELECT * FROM questions LIMIT 10');
            res.json({ 
                source: 'Database Fallback',
                questions: result.rows.map(q => ({ _id: q.id, questionText: q.question_text, options: q.options })) 
            });
        } catch (dbError) {
            console.error("Database Fallback Error:", dbError.message);
            res.status(500).json({ message: "Failed to generate questions" });
        }
    }
};

exports.getAIAdvice = async (req, res) => {
    const { scores, course, semester } = req.body;
    console.log("Generating Advice for:", { course, scores });

    const prompt = `
You are an expert Career Counselor. Analyze these category scores from a career assessment: ${JSON.stringify(scores)}
The student is currently in ${course} (${semester}).

Based on their strengths and interests, identify the top 2 career paths that would suit them best.
Provide a detailed reasoning for why these paths are a good match and a step-by-step roadmap to achieve success in those fields.

Return ONLY this JSON structure:
{
  "topMatches": [
    { 
      "title": "Specific Career Title", 
      "matchPercentage": 90-100, 
      "description": "A comprehensive description of what this career entails.", 
      "reason": "Explain how their specific scores in categories like ${Object.keys(scores).join(', ')} make them a great fit." 
    },
    { 
      "title": "Another Specific Career Title", 
      "matchPercentage": 80-90, 
      "description": "Description...", 
      "reason": "Reasoning..." 
    }
  ],
  "roadmap": "A detailed, step-by-step action plan including specific skills to learn, certifications to pursue, and potential job roles."
}
`;

    try {
        const adviceResponse = await getGeminiResponse(prompt);
        let cleanText = adviceResponse.replace(/```json|```/g, "").trim();
        const start = cleanText.indexOf('{');
        const end = cleanText.lastIndexOf('}');
        
        if (start === -1) throw new Error("AI failed to return JSON");
        
        const result = JSON.parse(cleanText.substring(start, end + 1));
        res.json(result);
    } catch (err) {
        console.error("AI Advice Error:", err.message);
        // Fallback response if AI fails so the UI doesn't show "No Data Found"
        res.json({
            topMatches: [
                { title: "Career Explorer", matchPercentage: 100, description: "Analysis in progress", reason: "AI is still processing your results." },
                { title: "Growth Specialist", matchPercentage: 90, description: "Continuous learning", reason: "We recommend reviewing your skills." }
            ],
            roadmap: "Our AI is currently busy. Please check back in a few minutes for your full roadmap."
        });
    }
};

exports.seedQuestions = async (req, res) => {
    res.json({ message: "AI active" });
};

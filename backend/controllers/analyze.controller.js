import Event from "../models/event.model.js";
import { Feedback } from "../models/feedback.model.js";

const reportGenerationPrompt = 
"You are an AI assistant tasked with generating an insightful report based on volunteer feedback for an event. Your goal is to analyze the given feedback, determine the event\'s success, and provide a structured summary of key insights.\
Each feedback entry consists of:\
    Rating (1-10): A numerical score reflecting the volunteer’s overall experience.\
    Comment: The volunteer’s thoughts on the event, highlighting positives and negatives.\
    Suggestion: Recommendations for improvement.\
Your Output Should Include:\
    Overall Event Rating: Calculate the average rating and categorize the event as:\
        Highly Successful (9-10)\
        Successful (7-8)\
        Moderately Successful (5-6)\
        Needs Improvement (Below 5)\
    Key Highlights: Identify recurring positive themes from comments.\
    Areas for Improvement: Identify common negative themes and issues.\
    Actionable Suggestions: Summarize useful suggestions for future events.\
    Final Verdict: A brief conclusion stating if the event was successful or not, with reasoning.\
Ensure the report is concise, data-driven, and well-structured while maintaining a professional and neutral tone.\
Ensure that the report is in a strict json format.";

const mergeFeedbacks = async (eventId) => {
    const feedbacks = await Feedback.find({ eventId });
    let mergedFeedbacks = "";
    for(const feedback of feedbacks) {
        console.log(feedback)
        const currFeedback = 
        `Rating: ${feedback.rating}\nComment: ${feedback.comments}\nSuggestion: ${feedback.suggestions}\n\n`;
        mergedFeedbacks += currFeedback;
    }
    return mergedFeedbacks;
}

export const analyze = async (req, res) => {
    const { eventId } = req.params;
    const mergedFeedbacks = await mergeFeedbacks(eventId);
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-chat-v3-0324:free",
          "messages": [
            {
                "role": "system",
                "content": reportGenerationPrompt
            },
            {
              "role": "user",
              "content": mergedFeedbacks
            }
          ]
        })
      });
    const jsonResponse = await resp.json();
    const chatResponse = jsonResponse.choices[0].message.content;
    const chatResponseJSONPart = chatResponse.substring(8, chatResponse.length - 3);
    res.json(JSON.parse(chatResponseJSONPart));
};
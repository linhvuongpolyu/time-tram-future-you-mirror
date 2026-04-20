import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_IMAGE_MODEL = "gemini-2.5-flash-image";
const OPENROUTER_IMAGE_MODELS = (
  process.env.OPENROUTER_MODELS ||
  process.env.OPENROUTER_MODEL ||
  "black-forest-labs/flux.2-pro,black-forest-labs/flux.2-flex,google/gemini-2.5-flash-image,google/gemini-3.1-flash-image-preview,google/gemini-2.5-flash-image-preview"
)
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

const isOpenRouterKey = (apiKey: string) => apiKey.startsWith("sk-or-");

const isRetryableOpenRouterModelError = (message: string) => {
  const lower = message.toLowerCase();
  return (
    lower.includes("not available in your region") ||
    lower.includes("model is not available") ||
    lower.includes("no endpoints found") ||
    lower.includes("provider route") ||
    lower.includes("model not found")
  );
};

// Track generation progress
let generationProgress = {
  progress: 0,
  step: '',
  totalArchetypes: 4,
  currentArchetype: 0,
};

function updateProgress(current: number, total: number, archetype?: string) {
  const progressPercent = Math.round((current / total) * 100);
  generationProgress.progress = progressPercent;
  generationProgress.currentArchetype = current;
  generationProgress.step = archetype ? `Generating image ${current}/${total}: ${archetype}` : '';
  console.log(`[Progress] ${generationProgress.step} - ${progressPercent}%`);
}

function generateTextToImagePrompt(originalPrompt: string): string {
  // For Flux models, we provide the full detailed prompt as-is
  // It's already well-crafted and needs to be preserved entirely
  return originalPrompt;
}

async function detectGenderFromImage(params: {
  apiKey: string;
  imageDataUrl: string;
}): Promise<string> {
  const isUsingOpenRouter = isOpenRouterKey(params.apiKey);
  
  const detectionPrompt = `Analyze this photo and determine the person's gender presentation. 
  
  Respond with ONLY one word: either "male", "female", or "non-binary". 
  Base your determination on visible physical characteristics like facial structure, hair style, clothing, and overall presentation.
  Be objective and respectful in your assessment.
  
  Response (one word only):`;

  if (isUsingOpenRouter) {
    try {
      const requestBody = {
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: detectionPrompt },
              { type: "image_url", image_url: { url: params.imageDataUrl } },
            ],
          },
        ],
      };

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${params.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-Title": "Time Tram Mirror",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to detect gender via OpenRouter");
      }

      const payload = await response.json();
      const genderText = payload?.choices?.[0]?.message?.content?.toLowerCase() || "unknown";
      
      if (genderText.includes("female")) return "female";
      if (genderText.includes("male")) return "male";
      if (genderText.includes("non-binary") || genderText.includes("non binary")) return "non-binary";
      
      return "unknown";
    } catch (err) {
      console.error("[Gender Detection] OpenRouter error:", err);
      return "unknown";
    }
  } else {
    // Use Google AI
    const ai = new GoogleGenAI({ apiKey: params.apiKey });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            {
              inlineData: {
                data: params.imageDataUrl.split(",")[1],
                mimeType: "image/png",
              },
            },
            { text: detectionPrompt },
          ],
        },
      });

      const genderText = response?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || "unknown";
      
      if (genderText.includes("female")) return "female";
      if (genderText.includes("male")) return "male";
      if (genderText.includes("non-binary") || genderText.includes("non binary")) return "non-binary";
      
      return "unknown";
    } catch (err) {
      console.error("[Gender Detection] Google AI error:", err);
      return "unknown";
    }
  }
}

function generateArchetypeQuote(archetype: string, percentages: Record<string, number>): { intro: string; tradeoff: string } {
  const otherArchetypes = ["Career", "Relationship", "Rest", "Joy"].filter(a => a !== archetype);
  const otherPercentages = otherArchetypes.map(a => ({ name: a, value: percentages[a] || 0 }))
    .sort((a, b) => b.value - a.value);

  const archetypeScore = percentages[archetype] || 0;
  const secondHighest = otherPercentages[0];
  const lowest = otherPercentages[otherPercentages.length - 1];
  
  let intro = "";
  let tradeoff = "";

  if (archetype === "Career") {
    // Personalize intro based on dominance level
    if (archetypeScore > 75) {
      intro = "I'm the version of you that climbed all the way. Every late night, every sacrifice was worth it—I made it.";
    } else if (archetypeScore > 60) {
      intro = "I'm the version of you who built something meaningful. I achieved real success—not perfect, but real.";
    } else if (archetypeScore > 50) {
      intro = "I'm the version of you who found ambition without losing yourself completely. I grew and stayed grounded.";
    } else {
      intro = "I'm the version of you who chose work when it mattered, but didn't make it everything.";
    }
    
    // Personalize tradeoff based on what was actually sacrificed
    if (secondHighest.name === "Rest" && secondHighest.value < 20) {
      if (lowest.name === "Relationship") {
        tradeoff = "You gave me success and recognition, but I'm always tired, and I did it alone.";
      } else if (lowest.name === "Joy") {
        tradeoff = "You gave me achievement, but I forgot how to enjoy it. No rest. No play.";
      } else {
        tradeoff = "You gave me promotion after promotion, but sleep became a luxury I couldn't afford.";
      }
    } else if (secondHighest.name === "Relationship" && secondHighest.value < 25) {
      if (archetypeScore > 75) {
        tradeoff = "You gave me corner offices and corner titles, but the corner I made was mine alone.";
      } else {
        tradeoff = "You gave me career momentum, but I did it with fewer people cheering for me.";
      }
    } else if (archetypeScore > 60) {
      const sacrificed = otherPercentages.filter(a => a.value < 30).map(a => a.name.toLowerCase()).join(" and ");
      tradeoff = sacrificed 
        ? `You gave me recognition and progress, but I had to trade away time for ${sacrificed}.`
        : "You gave me recognition, and I kept some of the other things too.";
    } else {
      tradeoff = "I got to build something real without burning everything else down in the process.";
    }
  } else if (archetype === "Relationship") {
    // Personalize intro based on balance
    if (archetypeScore > 75) {
      intro = "I'm the version of you who chose people. Every gathering, every call, every moment of presence built the life I cherish.";
    } else if (archetypeScore > 60) {
      intro = "I'm the version of you who made room for both. My career grew and my relationships stayed rooted.";
    } else {
      intro = "I'm the version of you who learned that presence is a choice. I chose it often enough to matter.";
    }
    
    // Personalize tradeoff
    if (percentages["Career"] > 60 && archetypeScore > 60) {
      tradeoff = "You gave me deep connections and a partner who knows all my selves—and somehow a career that thrived too.";
    } else if (percentages["Career"] > 60) {
      tradeoff = "You let my relationships bloom, but there were promotions I said no to. I still think about them sometimes.";
    } else if (lowest.name === "Rest") {
      tradeoff = "You gave me belonging and love, but I'm always 'on' for everyone. Rest feels selfish.";
    } else if (lowest.name === "Joy") {
      tradeoff = "You gave me deep connection and family, but sometimes I wonder what creative thing I might have made.";
    } else {
      tradeoff = "I have the relationships that matter most. Some doors closed, but the ones that stayed open were the right ones.";
    }
  } else if (archetype === "Rest") {
    // Personalize intro based on peace level
    if (archetypeScore > 75) {
      intro = "I'm the version of you that learned to stop. To sleep. To be. I found something you thought was indulgent: wholeness.";
    } else if (archetypeScore > 60) {
      intro = "I'm the version of you who set boundaries. I didn't burn out. No regrets on that one.";
    } else {
      intro = "I'm the version of you who learned that rest isn't laziness—it's survival.";
    }
    
    // Personalize tradeoff
    if (percentages["Career"] > 60) {
      if (archetypeScore > 60) {
        tradeoff = "You let me rest without guilt, and somehow I still built something stable. Worth it.";
      } else {
        tradeoff = "You gave me peace and health, but the career I could have had went to someone else.";
      }
    } else if (lowest.name === "Joy") {
      tradeoff = "You gave me peace and stability, but I'm not quite alive the way I could be.";
    } else if (lowest.name === "Relationship") {
      tradeoff = "You gave me tranquility and space, but I did it quietly. Without many people around.";
    } else {
      tradeoff = "I got to keep myself intact. That cost something, but I was wrong about what.";
    }
  } else if (archetype === "Joy") {
    // Personalize intro based on how much play mattered
    if (archetypeScore > 75) {
      intro = "I'm the version of you that played and created and explored. Life became a thing you don't just survive—you celebrate.";
    } else if (archetypeScore > 60) {
      intro = "I'm the version of you who made room for what made you come alive. Work and wonder together.";
    } else {
      intro = "I'm the version of you who remembered what joy felt like. Not often enough for regrets, but often enough to matter.";
    }
    
    // Personalize tradeoff
    if (percentages["Relationship"] > 50) {
      if (archetypeScore > 60) {
        tradeoff = "You gave me creativity and connection—and I got to share both. That's the dream.";
      } else {
        tradeoff = "You gave me joy and people to share it with, though not as much innovative work as I imagined.";
      }
    } else if (percentages["Career"] > 60) {
      tradeoff = "You gave me the freedom to create, but in the margins of a bigger ambition. Still more than most get.";
    } else if (lowest.name === "Rest") {
      if (archetypeScore > 60) {
        tradeoff = "You gave me aliveness and passion, but I'm always on. The cost was quiet.";
      } else {
        tradeoff = "You let me create and play, but I never really learned to stop.";
      }
    } else {
      tradeoff = "I got to live colorfully. The version of me in the spreadsheets never got a voice, and I prefer it that way.";
    }
  }

  return { intro, tradeoff };
}

function generateGoodbyeMessage(archetype: string, percentages: Record<string, number>, dominantArchetype: string): string {
  const archetypeScore = percentages[archetype] || 0;
  const otherArchetypes = ["Career", "Relationship", "Rest", "Joy"].filter(a => a !== archetype);
  const otherPercentages = otherArchetypes.map(a => ({ name: a, value: percentages[a] || 0 }))
    .sort((a, b) => b.value - a.value);

  let goodbye = "";

  if (archetype === "Career") {
    if (archetypeScore > 60) {
      goodbye = "I understood ambition. I would have climbed mountains for you. But you chose connection and peace instead. I'll wait in the roads not taken. Be kind to yourself—success was never worth the sacrifice anyway.";
    } else if (archetypeScore > 40) {
      goodbye = "I was there—the steady climb, the quiet accomplishment. You almost chose me. But somewhere, you knew there was more to life than climbing. That wisdom will serve you well. Goodbye.";
    } else {
      goodbye = "I was barely there, just a whisper of ambition. You were right to let me go. The world needs people who know when to stop. Thank you for choosing something better.";
    }
  } else if (archetype === "Relationship") {
    if (archetypeScore > 60) {
      goodbye = "I was surrounded by love—partners, friends, family, always close. You could have chosen me. But you listened to a different calling. I'll carry all those moments with me. Be well.";
    } else if (archetypeScore > 40) {
      goodbye = "I knew your people by name. I held your hand at every gathering. I would have made you feel less alone. But you chose a different path. I understand. Safe travels.";
    } else {
      goodbye = "Connection was my world, but yours was larger. You needed something more than I could give. I release you with no resentment—only hope.";
    }
  } else if (archetype === "Rest") {
    if (archetypeScore > 60) {
      goodbye = "I offered you peace—deep, real peace. Quiet mornings. Unhurried days. You almost accepted. But you chose to stay engaged with the world instead. I will wait, should you ever need me again.";
    } else if (archetypeScore > 40) {
      goodbye = "I whispered rest to you. You listened, sometimes. But not enough to choose me entirely. That's okay. The world needed your energy more than it needed your stillness.";
    } else {
      goodbye = "Rest was too quiet for you. You needed more. I'll remember the moments when you did pause—they meant more than you know. Go. Live.";
    }
  } else if (archetype === "Joy") {
    if (archetypeScore > 60) {
      goodbye = "I was color, music, laughter, creation. I would have made your life a celebration. You nearly chose me. But somewhere between play and purpose, you found another way. I'll echo in your smile anyway.";
    } else if (archetypeScore > 40) {
      goodbye = "I was the spark. I danced through your thoughts. You gave me moments—not a lifetime, but moments. That was enough. Go build your chosen future. I'll be in every laugh you don't take for granted.";
    } else {
      goodbye = "Joy was a side note in your story, not the main theme. That's not sadness—that's honesty. Live what you chose. That's the only joy that matters.";
    }
  }

  return goodbye;
}

function extractOpenRouterImageDataUrl(payload: any): string {
  const firstChoice = payload?.choices?.[0];
  const message = firstChoice?.message;

  const imageUrl = message?.images?.[0]?.image_url?.url || message?.image_url?.url;
  if (typeof imageUrl === "string" && imageUrl.length > 0) {
    return imageUrl;
  }

  const content = message?.content;
  if (Array.isArray(content)) {
    for (const part of content) {
      const partUrl = part?.image_url?.url;
      if (typeof partUrl === "string" && partUrl.length > 0) {
        return partUrl;
      }

      const b64 = part?.b64_json;
      if (typeof b64 === "string" && b64.length > 0) {
        return `data:image/png;base64,${b64}`;
      }
    }
  }

  const topB64 = payload?.images?.[0]?.b64_json;
  if (typeof topB64 === "string" && topB64.length > 0) {
    return `data:image/png;base64,${topB64}`;
  }

  const textContent = Array.isArray(content)
    ? content.map((part: any) => part?.text || "").join(" ")
    : typeof content === "string"
      ? content
      : "";

  const markdownImageMatch = textContent.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (markdownImageMatch?.[1]) {
    return markdownImageMatch[1];
  }

  throw new Error("OpenRouter response did not contain an image payload");
}

async function generateImageWithOpenRouter(params: {
  apiKey: string;
  prompt: string;
  imageDataUrl: string;
}) {
  const models = OPENROUTER_IMAGE_MODELS.length > 0
    ? OPENROUTER_IMAGE_MODELS
    : [
        "google/gemini-2.5-flash-image",
        "google/gemini-3.1-flash-image-preview",
        "black-forest-labs/flux.2-pro",
      ];

  let lastError = "Unknown OpenRouter error";
  let attemptedModels: string[] = [];

  for (const model of models) {
    attemptedModels.push(model);
    console.log(
      `[Image Generation] Attempting model ${attemptedModels.length}/${models.length}: ${model}`
    );

    const isFluxModel = model.includes("flux");
    const requestBody = isFluxModel
      ? {
          model,
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: generateTextToImagePrompt(params.prompt)
                },
                {
                  type: "image_url",
                  image_url: { url: params.imageDataUrl }
                }
              ],
            },
          ],
        }
      : {
          model,
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: params.prompt },
                { type: "image_url", image_url: { url: params.imageDataUrl } },
              ],
            },
          ],
        };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout per attempt

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${params.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-Title": "Time Tram Mirror",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          payload?.error?.message ||
          payload?.message ||
          `OpenRouter request failed with status ${response.status}`;
        const trimmedError = errorMessage.substring(0, 100);
        console.log(`[Image Generation] ${model} failed: ${trimmedError}`);

        if (errorMessage.toLowerCase().includes("api key")) {
          throw new Error(
            `API Key Error (tried ${attemptedModels.length} model(s)): ${errorMessage}`
          );
        }

        lastError = `${model}: ${errorMessage}`;
        if (isRetryableOpenRouterModelError(errorMessage)) {
          console.log(
            `[Image Generation] ${model} retryable, trying next model...`
          );
          continue;
        }

        console.log(
          `[Image Generation] ${model} non-retryable error, stopping`
        );
        throw new Error(lastError);
      }

      console.log(`[Image Generation] ${model} succeeded`);
      try {
        return extractOpenRouterImageDataUrl(payload);
      } catch (parseErr: any) {
        console.log(
          `[Image Generation] ${model} response parse failed: ${parseErr?.message}`
        );
        lastError = `${model}: ${parseErr?.message || "Could not parse image response"}`;
        continue;
      }
    } catch (fetchErr: any) {
      const errorMsg = fetchErr?.message || String(fetchErr);
      console.log(`[Image Generation] ${model} fetch error: ${errorMsg}`);
      lastError = `${model}: ${errorMsg}`;
      continue;
    }
  }

  const allModelsList = attemptedModels.join(", ");
  const summary =
    `All ${attemptedModels.length} OpenRouter image models failed. ` +
    `Tried: ${allModelsList}. ` +
    `Last error: ${lastError}. ` +
    `If this persists, check OpenRouter status or try setting OPENROUTER_MODELS in .env`;
  console.error("[Image Generation] Fatal failure:", summary);
  throw new Error(summary);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

  // API Route for detecting gender from image
  app.post("/api/detect-gender", async (req, res) => {
    try {
      const { image } = req.body;
      const apiKey = process.env.OPENROUTER_API_KEY;

      if (!image || typeof image !== "string" || !image.includes(",")) {
        return res.status(400).json({ error: "Invalid image payload" });
      }

      if (!apiKey) {
        return res.status(500).json({
          error:
            "OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env.local",
        });
      }

      const gender = await detectGenderFromImage({
        apiKey,
        imageDataUrl: image,
      });

      console.log(`[Gender Detection] Detected gender: ${gender}`);
      res.json({ gender });
    } catch (error: any) {
      console.error("Error detecting gender:", error);
      res.status(500).json({ error: error.message || "Failed to detect gender" });
    }
  });

  // API Route for generating futures
  app.post("/api/generate-futures", async (req, res) => {
    try {
      const { image, percentages, dominantArchetype, gender } = req.body;
      const detectedGender = gender || "unknown";
      const apiKey = process.env.OPENROUTER_API_KEY;

      if (!image || typeof image !== "string" || !image.includes(",")) {
        return res.status(400).json({ error: "Invalid image payload" });
      }

      if (!apiKey) {
        return res.status(500).json({
          error:
            "OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env.local",
        });
      }

      const useOpenRouter = isOpenRouterKey(apiKey);
      const ai = useOpenRouter ? null : new GoogleGenAI({ apiKey });

      const archetypes = ["Career", "Relationship", "Rest", "Joy"];
      const generatedImages = [];

      console.log(`[API] Starting generation for ${archetypes.length} archetypes`);
      
      // We need to generate 4 images, one for each archetype
      // To save time/quota in a real installation, we could parallelize or generate one by one
      // For this implementation, we'll loop through them.
      
      for (let i = 0; i < archetypes.length; i++) {
        const archetype = archetypes[i];
        const score = percentages[archetype] || 0;
        const isDominant = archetype === dominantArchetype;
        
        console.log(`[API] Generating image ${i + 1}/4 for archetype: ${archetype}`);
        updateProgress(i + 1, archetypes.length, archetype);
        
        // Build context description based on percentage distribution
        let contextualMood = "";
        let toneDescription = "";
        let clothingDescription = "";
        
        if (archetype === "Career") {
          if (score > 70) {
            contextualMood = "highly successful executive in a modern high-rise office at night, sharp focused expression, but showing signs of weariness and isolation";
            toneDescription = "successful but visibly carrying the weight of sacrificed relationships and rest, late-night city lights in background, polished but tired";
            clothingDescription = "formal tailored business suit (dark or charcoal), crisp white shirt, executive tie or elegant accessories, polished and impeccably groomed";
          } else if (score > 50) {
            contextualMood = "accomplished professional in a balanced career setting, skilled and respected, with less burnout than a pure career path";
            toneDescription = "dedicated professional who maintained some boundaries, modern office with warm lighting, content and measured";
            clothingDescription = "smart casual business attire (blazer with dress shirt or professional blouse), well-tailored but not overly formal, approachable yet professional";
          } else {
            contextualMood = "someone who pursued career growth but not as a sole priority, balanced approach to work";
            toneDescription = "a professional who made career choices but kept time for other values, relaxed office setting";
            clothingDescription = "business casual clothing (dress pants/skirt with quality knit or casual blouse), comfortable but put-together";
          }
        } else if (archetype === "Relationship") {
          if (percentages["Career"] > 60) {
            contextualMood = "warm person surrounded by loved ones but showing some of the weight of balancing relationships with career demands";
            toneDescription = "connected and present with family/partner, soft intimate lighting, some fatigue from juggling multiple priorities";
            clothingDescription = "casual warm clothing with a personal touch (cozy sweater, comfortable jeans or relaxed pants, maybe a scarf or sentimental jewelry)";
          } else {
            contextualMood = "deeply connected person surrounded by loved ones, partners, close friends, radiating warmth and belonging";
            toneDescription = "warm and joyful, surrounded by people who clearly love them, soft glowing light, cozy home or gathering environment, visibly present and happy";
            clothingDescription = "comfortable casual wear that shows genuine warmth (soft sweater, well-worn favorite jeans or relaxed pants, items that feel loved and familiar, maybe holding children or pet)";
          }
        } else if (archetype === "Rest") {
          if (percentages["Career"] > 60) {
            contextualMood = "person who chose rest despite career pressure, showing contentment with their decision";
            toneDescription = "relaxed but maybe showing lingering thoughts of what could have been, natural light, calm but contemplative";
            clothingDescription = "relaxed comfortable clothing with natural fabrics (soft linen or cotton shirt, comfortable pants or loungewear, barefoot or in simple sandals)";
          } else {
            contextualMood = "deeply peaceful person in harmony with nature or a serene personal space, radiating health and tranquility";
            toneDescription = "visibly healthy, glowing with vitality from rest and balance, soft natural light, peaceful expression, surrounded by nature or minimalist calm home";
            clothingDescription = "flowing natural clothing in soft earth tones (linen shirt, comfortable yoga pants or relaxed linen trousers, maybe in natural fabrics like hemp or organic cotton, minimal jewelry)";
          }
        } else if (archetype === "Joy") {
          if (percentages["Relationship"] > 50) {
            contextualMood = "creative person joyfully creating and sharing with others, vibrant and alive, social energy";
            toneDescription = "playful, creative energy radiating outward, surrounded by art/music and people, expressive and laughing, warm social atmosphere";
            clothingDescription = "artistic colorful clothing that expresses personality (vibrant patterned shirt or artistic blouse, unique accessories, maybe paint-stained or creative wear that shows passion for art/music)";
          } else {
            contextualMood = "creatively expressive person in their element, surrounded by their passions and projects, radiant with purpose";
            toneDescription = "playful and creative, fully immersed in art or music or creative expression, vibrant colors, expressive and alive, energetic atmosphere";
            clothingDescription = "boldly creative clothing expressing artistic identity (unexpected color combinations, artistic patterns, unique pieces, maybe denim covered in patches or paint, expressive style)";
          }
        }

        const prompt = `Generate a vibrant, semi-realistic painterly illustration of this person's future self at age 35-40, approximately 15-20 years from now.
        
        IMPORTANT - Gender Specification: The person in the reference photo is ${detectedGender}. Use this information explicitly to create ${detectedGender}-appropriate styling, clothing, and physical features in the future self. The generated image should reflect the natural progression of their appearance based on their actual gender presentation.
        
        CRITICAL - Facial Features: PRESERVE the person's recognizable facial features, bone structure, distinctive features, and expressions from the reference photo. The face should be clearly recognizable as the same person - just older and more radiant. The person should look like their future self, not a different person.
        
        Archetype Focus: ${archetype}
        Context & Setting: ${contextualMood}
        Overall Appearance: The person looks ${toneDescription}.
        Clothing & Style: ${clothingDescription}
        
        Key attributes: 
        - Face and facial features MUST remain recognizable from the original photo - increase warmth, add signs of wisdom, make the face more radiant
        - Youthful vitality with subtle wisdom from lived experience - radiant and alive, not aged-looking
        - Embodiment of life choices made: Career = confident, sharp eyes, composed; Relationship = warm eyes, genuine smile, open expression; Rest = peaceful clear eyes, serene face; Joy = bright engaging eyes, expressive animated face
        - Natural, flattering lighting that emphasizes wellness and healthy presence
        Style: Painterly with expressive, confident brushstrokes, contemporary artistic style, vibrant yet refined. Semi-realistic with an artistic, almost portrait-quality feel. Warm, inviting color palette optimized for the chosen archetype's aesthetic.
        
        Intent: This person appears vitally alive and present, directly connecting with their younger self across time. They should be unmistakably the same person as in the reference image, just fulfilled through the lens of their chosen archetype path.`;

        let base64Image = "";

        if (useOpenRouter) {
          base64Image = await generateImageWithOpenRouter({
            apiKey,
            prompt,
            imageDataUrl: image,
          });
        } else {
          const response = await ai!.models.generateContent({
            model: GOOGLE_IMAGE_MODEL,
            contents: {
              parts: [
                {
                  inlineData: {
                    data: image.split(",")[1], // Remove data:image/png;base64,
                    mimeType: "image/png",
                  },
                },
                { text: prompt },
              ],
            },
          });

          const parts = response?.candidates?.[0]?.content?.parts ?? [];
          for (const part of parts) {
            if (part.inlineData) {
              base64Image = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        if (!base64Image) {
          throw new Error(`Could not generate ${archetype} image: Model did not return an image`);
        }

        // Generate quotes only for the dominant archetype
        let quote = null;
        let goodbye = null;
        if (isDominant) {
          quote = generateArchetypeQuote(archetype, percentages);
        } else {
          goodbye = generateGoodbyeMessage(archetype, percentages, dominantArchetype);
        }

        generatedImages.push({
          archetype,
          image: base64Image,
          score,
          isDominant,
          quote,
          goodbye
        });
      }

      console.log(`[API] Successfully generated 4 images, sending to client`);
      res.json({ images: generatedImages });
    } catch (error: any) {
      console.error("Error generating futures:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for getting generation progress
  app.get("/api/progress", (req, res) => {
    res.json({
      progress: generationProgress.progress,
      step: generationProgress.step,
      currentArchetype: generationProgress.currentArchetype,
      totalArchetypes: generationProgress.totalArchetypes
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

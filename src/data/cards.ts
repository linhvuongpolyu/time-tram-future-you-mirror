export interface Card {
  id: string;
  choiceName: string;
  quote: string;
  weights: {
    career: number;
    relationship: number;
    rest: number;
    joy: number;
  };
}

// Placeholder for 32 cards. The user will provide the actual data later.
// For now, I'll just provide a few examples to make the app functional.
export const CARDS = [
  {
    id: "C1",
    choiceName: "Midnight Study Session",
    quote: "You gave your sleep to the textbook so I could stay one step ahead.",
    weights: {
      career: 1,
      relationship: 0,
      rest: -0.3,
      joy: 0.1
    }
  },
  {
    id: "C2",
    choiceName: "Extra Shift Accepted",
    quote: "You kept saying yes to hours now so my future title could sound heavier.",
    weights: {
      career: 1,
      relationship: -0.3,
      rest: -0.2,
      joy: 0
    }
  },
  {
    id: "C3",
    choiceName: "Productivity Planner",
    quote: "You sliced your days into boxes so I could move in straight lines.",
    weights: {
      career: 0.9,
      relationship: 0,
      rest: 0.1,
      joy: 0
    }
  },
  {
    id: "C4",
    choiceName: "New Work Laptop",
    quote: "You upgraded your tools so my future work could run faster than my doubts.",
    weights: {
      career: 0.9,
      relationship: 0,
      rest: 0,
      joy: 0.1
    }
  },
  {
    id: "C5",
    choiceName: "Professional Course Ticket",
    quote: "You traded a free night for skills I'll be using for years.",
    weights: {
      career: 1,
      relationship: 0,
      rest: -0.1,
      joy: 0.1
    }
  },
  {
    id: "C6",
    choiceName: "Internship / Promotion Token",
    quote: "You let pressure stack up on you so the ladder would open for me.",
    weights: {
      career: 1,
      relationship: -0.2,
      rest: -0.2,
      joy: 0
    }
  },
  {
    id: "C7",
    choiceName: "No-Break Badge",
    quote: "You wore this like an honor every time you skipped a pause for my progress.",
    weights: {
      career: 1,
      relationship: 0,
      rest: -0.5,
      joy: 0
    }
  },
  {
    id: "C8",
    choiceName: "Focus Mode Lock-In",
    quote: "You locked the world out so I could push one more thing a little further.",
    weights: {
      career: 0.9,
      relationship: -0.2,
      rest: 0,
      joy: 0.1
    }
  },
  {
    id: "R1",
    choiceName: "Slow Dinner with Family",
    quote: "You stayed at the table long enough for another story to belong to us.",
    weights: {
      career: -0.2,
      relationship: 1,
      rest: 0.1,
      joy: 0.1
    }
  },
  {
    id: "R2",
    choiceName: "Long Call with a Parent",
    quote: "You let the notifications wait so their voice could stay familiar in my life.",
    weights: {
      career: 0,
      relationship: 1,
      rest: 0.1,
      joy: 0
    }
  },
  {
    id: "R3",
    choiceName: "Friend Hangout Night",
    quote: "You chose a night of laughter over one more task, and I didn't grow up alone.",
    weights: {
      career: -0.2,
      relationship: 1,
      rest: 0,
      joy: 0.3
    }
  },
  {
    id: "R4",
    choiceName: "Hey, It's Been a While Text",
    quote: "You nudged a quiet door open so this version of us could still exist.",
    weights: {
      career: 0,
      relationship: 0.9,
      rest: 0,
      joy: 0.1
    }
  },
  {
    id: "R5",
    choiceName: "Apology Message Sent",
    quote: "You spent a bit of pride so our timeline could stay connected instead of clean.",
    weights: {
      career: 0,
      relationship: 1,
      rest: 0.1,
      joy: 0
    }
  },
  {
    id: "R6",
    choiceName: "Shared Memory Box",
    quote: "You kept proof that we were here together, not just busy beside each other.",
    weights: {
      career: 0,
      relationship: 0.9,
      rest: 0,
      joy: 0.3
    }
  },
  {
    id: "R7",
    choiceName: "Date Card for Two",
    quote: "You protected one small evening just for us in a calendar full of other people's demands.",
    weights: {
      career: -0.1,
      relationship: 1,
      rest: 0,
      joy: 0.3
    }
  },
  {
    id: "R8",
    choiceName: "Reunion / Group Photo Ticket",
    quote: "You showed up so I wouldn't have to remember this decade without faces.",
    weights: {
      career: 0,
      relationship: 1,
      rest: 0,
      joy: 0.2
    }
  },
  {
    id: "H1",
    choiceName: "Full-Night Sleep Pass",
    quote: "You let one day be unfinished so my future mind could stay clear.",
    weights: {
      career: 0.2,
      relationship: 0,
      rest: 1,
      joy: 0
    }
  },
  {
    id: "H2",
    choiceName: "Afternoon Nap Voucher",
    quote: "You lay down now so I wouldn't have to crash somewhere further down the line.",
    weights: {
      career: 0,
      relationship: 0,
      rest: 1,
      joy: 0.1
    }
  },
  {
    id: "H3",
    choiceName: "Quiet Room Access",
    quote: "You gave me an hour where nothing pulled at me so I could remember how 'enough' feels.",
    weights: {
      career: 0,
      relationship: 0,
      rest: 1,
      joy: 0.1
    }
  },
  {
    id: "H4",
    choiceName: "Stretch & Breathe Break",
    quote: "You let the body you live in interrupt your schedule so I can keep carrying you.",
    weights: {
      career: 0.1,
      relationship: 0,
      rest: 1,
      joy: 0
    }
  },
  {
    id: "H5",
    choiceName: "Nourishing Meal Ticket",
    quote: "You fed me like someone you planned to keep around for a while.",
    weights: {
      career: 0,
      relationship: 0,
      rest: 1,
      joy: 0.1
    }
  },
  {
    id: "H6",
    choiceName: "20-Minute Walk Outside",
    quote: "You let your feet move so the future version of me wouldn't be stuck inside your tension.",
    weights: {
      career: 0.1,
      relationship: 0,
      rest: 1,
      joy: 0.2
    }
  },
  {
    id: "H7",
    choiceName: "One-Hour Digital Detox",
    quote: "You turned the screen off so my nervous system could unclench a little.",
    weights: {
      career: 0,
      relationship: 0.1,
      rest: 1,
      joy: 0.1
    }
  },
  {
    id: "H8",
    choiceName: "Therapy / Reflection Session",
    quote: "You stopped running and sat with the mess so I don't have to hold it alone later.",
    weights: {
      career: 0,
      relationship: 0.2,
      rest: 1,
      joy: 0
    }
  },
  {
    id: "J1",
    choiceName: "Comfort Drink & Snack Ritual",
    quote: "You let a small, unnecessary sweetness interrupt the rush so I could enjoy being here.",
    weights: {
      career: 0,
      relationship: 0,
      rest: 0.1,
      joy: 1
    }
  },
  {
    id: "J2",
    choiceName: "Game Night Token",
    quote: "You played for no reason except that it felt good to exist with other people for a while.",
    weights: {
      career: -0.1,
      relationship: 0.3,
      rest: 0,
      joy: 1
    }
  },
  {
    id: "J3",
    choiceName: "30 Minutes of Doing Nothing",
    quote: "You gave me half an hour where I wasn't useful, just alive and a little bit stupid in a good way.",
    weights: {
      career: 0,
      relationship: 0,
      rest: 0.7,
      joy: 0.7
    }
  },
  {
    id: "J4",
    choiceName: "Sketchbook Night In",
    quote: "You 'wasted' an evening drawing so I could think in lines and colors instead of bullet points.",
    weights: {
      career: 0.3,
      relationship: 0,
      rest: 0,
      joy: 1
    }
  },
  {
    id: "J5",
    choiceName: "Mystery Object from Another Timeline",
    quote: "You brought home something that made no sense to anyone except the future version of you that needed it.",
    weights: {
      career: 0,
      relationship: 0,
      rest: 0,
      joy: 1
    }
  },
  {
    id: "J6",
    choiceName: "Museum / Cinema Ticket",
    quote: "You stepped into a story that wasn't about you so I could grow sideways, not just upwards.",
    weights: {
      career: 0.1,
      relationship: 0.1,
      rest: 0,
      joy: 1
    }
  },
  {
    id: "J7",
    choiceName: "Tiny Art Supply Kit",
    quote: "You bought tools for the parts of you that don't have KPIs attached.",
    weights: {
      career: 0.1,
      relationship: 0,
      rest: 0,
      joy: 1
    }
  },
  {
    id: "J8",
    choiceName: "Hobby Hour Token",
    quote: "You guarded one quiet hour where the only goal was to enjoy being this person.",
    weights: {
      career: 0,
      relationship: 0,
      rest: 0.2,
      joy: 1
    }
  }
];

const CARD_MAP = new Map(CARDS.map((card) => [card.id, card]));

export const normalizeCardId = (id: string) => id.trim().toUpperCase();

export const isKnownCardId = (id: string) => CARD_MAP.has(normalizeCardId(id));

export const getCardById = (id: string): Card | undefined => {
  return CARD_MAP.get(normalizeCardId(id));
};

export const computeArchetypeScores = (selectedIds: string[]) => {
  const scores = { career: 0, relationship: 0, rest: 0, joy: 0 };
  
  selectedIds.forEach(id => {
    const card = getCardById(id);
    if (!card) return;
    scores.career += card.weights.career;
    scores.relationship += card.weights.relationship;
    scores.rest += card.weights.rest;
    scores.joy += card.weights.joy;
  });

  // Calculate percentages based on positive sums to avoid negative percentages in UI
  const pCareer = Math.max(0, scores.career);
  const pRelationship = Math.max(0, scores.relationship);
  const pRest = Math.max(0, scores.rest);
  const pJoy = Math.max(0, scores.joy);
  
  const total = pCareer + pRelationship + pRest + pJoy || 1;

  const percentages = {
    Career: Math.round((pCareer / total) * 100),
    Relationship: Math.round((pRelationship / total) * 100),
    Rest: Math.round((pRest / total) * 100),
    Joy: Math.round((pJoy / total) * 100),
  };

  const sortedArchetypes = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
  const dominantArchetype = sortedArchetypes[0][0];

  return { scores, percentages, dominantArchetype, sortedArchetypes };
};

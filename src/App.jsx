import { useState, useEffect } from "react";

// ── API CONFIG ───────────────────────────────────────────
const API = "https://coresix-backend-production.up.railway.app";

// Generate or get device ID — persists in localStorage
const getDeviceId = () => {
  let id = localStorage.getItem("coresix_device_id");
  if (!id) {
    id = "cs_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("coresix_device_id", id);
  }
  return id;
};

// API helper
const api = async (method, path, body) => {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("API call failed, using local state:", err.message);
    return null; // Graceful fallback to localStorage
  }
};

// ── PILLARS ──────────────────────────────────────────────
const PILLARS = {
  fuel:    { name:"Fuel",    emoji:"⚡", color:"#F59E0B", grad:"linear-gradient(135deg,#F59E0B,#FBBF24)", light:"#FFFBEB", border:"#FDE68A", desc:"Nutrition & Energy" },
  move:    { name:"Move",    emoji:"💪", color:"#10B981", grad:"linear-gradient(135deg,#10B981,#34D399)", light:"#ECFDF5", border:"#A7F3D0", desc:"Movement & Fitness" },
  rest:    { name:"Rest",    emoji:"😴", color:"#8B5CF6", grad:"linear-gradient(135deg,#8B5CF6,#A78BFA)", light:"#F5F3FF", border:"#DDD6FE", desc:"Sleep & Recovery" },
  calm:    { name:"Calm",    emoji:"🧘", color:"#0EA5E9", grad:"linear-gradient(135deg,#0EA5E9,#38BDF8)", light:"#F0F9FF", border:"#BAE6FD", desc:"Stress & Mind" },
  connect: { name:"Connect", emoji:"🤝", color:"#EC4899", grad:"linear-gradient(135deg,#EC4899,#F472B6)", light:"#FDF2F8", border:"#FBCFE8", desc:"Relationships" },
  focus:   { name:"Focus",   emoji:"🎯", color:"#F97316", grad:"linear-gradient(135deg,#F97316,#FB923C)", light:"#FFF7ED", border:"#FED7AA", desc:"Purpose & Clarity" },
};
const PIDS = ["fuel","move","rest","calm","connect","focus"];

// ── COACHING CONTENT ─────────────────────────────────────
const COACHING = {
  // Welcome screen coaching
  welcome: {
    title: "Before we begin",
    message: "CoreSix is built on one simple truth: you don't need more willpower. You need better design.\n\nResearch by BJ Fogg at Stanford shows that behaviour happens when Motivation, Ability, and a Prompt come together at the same moment. Most people fail not because they lack motivation — but because their habits are too big, too vague, or missing a trigger.\n\nIn the next few minutes, you'll answer 10 honest questions about your life. No right or wrong answers. Just truth. The more honest you are, the better CoreSix can personalise your experience.\n\nLet's begin."
  },

  // After each questionnaire answer — pillar specific coaching
  q_coaching: {
    fuel: {
      low:  "Your Fuel pillar needs the most attention. Here's what the science says: 40% of what you eat is driven by habit — not hunger, not choice. That means the food decisions that feel automatic right now were actually learned. And anything learned can be changed.\n\nWe will start with one tiny anchor habit — something so small it takes less than 2 minutes. That's how real change begins.",
      high: "Your Fuel pillar is already strong. That's a real foundation. We will build on what's working rather than starting from scratch.\n\nThe goal here is to deepen your nutrition habits — move from good to intentional, from consistent to optimised.",
    },
    move: {
      low:  "Your Move pillar is where we can make the fastest visible change. Physical activity has a direct impact on every other pillar — it improves sleep, reduces stress, sharpens focus, and boosts mood.\n\nHere's the key insight from BJ Fogg: you don't start with a workout. You start with 5 push-ups. Tiny actions, anchored to existing routines, are the foundation of lasting movement habits.",
      high: "You are already active — that's a significant advantage. Research shows physically active people have stronger willpower, better sleep, and lower stress across the board.\n\nWe'll focus on deepening consistency, adding progressive challenge, and making recovery as intentional as training.",
    },
    rest: {
      low:  "Poor sleep is not just tiredness. It directly impairs your prefrontal cortex — the seat of willpower, decision-making, and impulse control. Every other habit you try to build becomes harder when you're sleep deprived.\n\nThe good news: sleep habits respond quickly to small changes. One consistent bedtime. One screen-free window. That's enough to start rebuilding your sleep foundation.",
      high: "Strong sleep is one of the most underrated performance advantages. While you sleep, your brain consolidates memories, repairs tissue, and recharges the prefrontal cortex that powers all your other habits.\n\nWe'll use this pillar to deepen your recovery and protect this foundation you've already built.",
    },
    calm: {
      low:  "Chronic stress literally shrinks the prefrontal cortex and enlarges the amygdala — meaning you become more reactive and less controlled over time. This affects every decision you make, every habit you try to build.\n\nBut here's the powerful truth: even 5 minutes of mindful breathing activates the parasympathetic nervous system and restores calm. We'll start there.",
      high: "Your ability to manage stress is a superpower. Research shows that people with strong stress regulation make better decisions, form habits faster, and maintain them longer under pressure.\n\nWe'll build on your existing practices and deepen them — turning good stress management into genuine emotional mastery.",
    },
    connect: {
      low:  "Loneliness and social disconnection activate the same brain regions as physical pain. Connection is not a luxury — it is a biological need as fundamental as food and sleep.\n\nMore importantly: social support is one of the strongest predictors of habit success. People who share goals with others are significantly more likely to follow through. CoreSix will help you build connection as a daily practice.",
      high: "Your social connections are one of your greatest health assets. Research consistently shows that people with strong relationships live longer, recover faster from illness, and maintain healthy habits more easily.\n\nWe'll focus on deepening the quality and intentionality of your connections — not just maintaining what you have.",
    },
    focus: {
      low:  "The average person checks their phone 96 times a day. Every interruption costs 23 minutes of deep focus to recover from. If you feel scattered, it's not a character flaw — it's a design problem.\n\nThe solution is not trying harder. It's reducing friction, creating structure, and building the identity of someone who protects their attention. We'll start with one focused work block — just 25 minutes. That's enough.",
      high: "Your ability to focus and work with purpose is rare and valuable. Research shows that deep work — uninterrupted, cognitively demanding work — is the most powerful predictor of professional success and personal satisfaction.\n\nWe'll build on your existing focus practices and push toward true mastery — protecting peak energy, eliminating decision fatigue, and working at your highest level consistently.",
    },
  },

  // After questionnaire complete — profile reveal coaching
  profile_reveal: {
    prefix: "Based on your answers, here is what CoreSix knows about you.",
    why_three: "Why 3 pillars? Because research is clear: trying to change everything at once changes nothing. The brain can only sustain focused habit formation in a small number of areas simultaneously.\n\nStarting with your 3 weakest pillars creates the fastest, most visible improvement. As these become stronger, we expand. This is how lasting change works.",
    science_note: "CoreSix uses the B=MAP framework by BJ Fogg: Behaviour happens when Motivation, Ability, and a Prompt meet at the same moment. Every habit you pick will be tiny enough to do even on your worst day, anchored to something you already do, and prompted at the right moment.",
  },

  // Rung coaching — shown before picking a habit
  rung_coaching: {
    fuel: [
      "Rung 1 is about one thing: creating a foundation. Hydration and structured meal timing are the two pillars of nutrition. When you eat 2-3 structured meals and stay hydrated, your hunger signals become clearer, your cravings reduce, and your energy stabilises throughout the day.\n\nThe science: people who eat structured meals rather than grazing have better insulin sensitivity, lower body fat, and more consistent energy. Start with one anchor — water before your first meal, or committing to 3 meals today.",
      "Rung 2 is about how you eat, not what you eat. Research shows that eating mindfully — slowly, without screens, paying attention — naturally reduces overeating, improves digestion, and builds a healthier relationship with food.\n\nThis is harder than it sounds in our distracted world. One mindful meal a day is the target.",
      "Rung 3 is about nutrition quality. Protein is the most important macronutrient for body composition, satiety, and muscle maintenance. Most people eat far less than they need.\n\nWe're not counting calories. We're adding one good thing at a time — vegetables, protein, whole foods. Addition, not restriction.",
      "Rung 4 is about planning. Research consistently shows that people who plan their meals make healthier choices, spend less money, and stick to their nutrition goals at dramatically higher rates.\n\n5 minutes of planning tonight saves hours of poor decisions tomorrow.",
      "Rung 5 is nutrition mastery. You have built the foundation — hydration, mindful eating, quality nutrition, planning. Now we integrate everything into a fully intentional relationship with food.\n\nThis is not a diet. This is an identity: you are someone who fuels their body with intention.",
    ],
    move: [
      "Rung 1 is not about fitness. It's about proof. Proof to yourself that you can show up consistently.\n\n5 push-ups before your shower is not a workout. It's a signal. A signal to your nervous system that you are someone who moves. Identity change starts with tiny, repeated actions — not heroic efforts.",
      "Rung 2 is about making movement part of your day rather than a separate event. Walking after meals improves blood sugar regulation by up to 30%. It's one of the most researched and underutilised health interventions available.\n\nNo gym required. No equipment. Just 10 minutes and a direction.",
      "Rung 3 is where you start building real physical capacity. Three bodyweight sessions per week is the minimum effective dose for strength, metabolic health, and mood regulation.\n\nResearch shows even 20 minutes of resistance training has measurable effects on depression, anxiety, and cognitive function within weeks.",
      "Rung 4 is about daily consistency. 7000 steps and 30 minutes of exercise daily is the threshold research identifies for long-term health protection — reducing cardiovascular disease risk by 50%, improving longevity markers, and sustaining mental health.\n\nYou're not exercising to look a certain way. You're moving to protect your future self.",
      "Rung 5 is movement mastery. You no longer exercise because you have to. You move because it's who you are.\n\nAt this rung, the habit is fully automatic. The challenge becomes optimisation — training smarter, recovering better, and expanding what your body can do.",
    ],
    rest: [
      "Rung 1 targets your morning, not your night. Making your bed is a keystone habit — a small action that triggers a cascade of other ordered behaviours throughout the day.\n\nResearch by Admiral William McRaven showed this simple habit correlates with higher productivity, better mood, and stronger sense of personal discipline. It takes 2 minutes. It changes how you feel all day.",
      "Rung 2 targets the biggest sleep disruptor in modern life: blue light from screens. Blue light suppresses melatonin production by up to 50%, delaying your natural sleep onset by 90 minutes or more.\n\nPutting your phone in another room removes the temptation entirely. No willpower required — just distance.",
      "Rung 3 is about circadian rhythm. Your body's internal clock is regulated primarily by light and timing consistency — not the number of hours you sleep.\n\nGoing to bed at the same time every night, even on weekends, synchronises your sleep cycle and dramatically improves sleep quality within 1-2 weeks.",
      "Rung 4 is about sleep architecture. Morning light exposure within 30 minutes of waking sets your cortisol rhythm for the day, which directly determines when you feel tired at night.\n\nYour bedroom environment — temperature, darkness, noise — determines sleep depth. Cool, dark, and quiet is the science-backed formula.",
      "Rung 5 is sleep mastery. You have built a complete sleep system — morning anchors, evening wind-down, consistent timing, optimised environment.\n\nAt this level, sleep is no longer something that happens to you. It's something you architect. And the returns — in energy, focus, willpower, and longevity — compound every single night.",
    ],
    calm: [
      "Rung 1 is about creating a pause. Between stimulus and response, there is a space. In that space lies your power to choose.\n\nDeep breathing activates the vagus nerve and triggers the parasympathetic nervous system — your body's natural calm response. Three breaths takes 30 seconds. The neurological effect lasts hours.",
      "Rung 2 is about training your brain to notice what's good. Gratitude practice physically rewires the prefrontal cortex over time — strengthening the neural pathways associated with positive emotion and reducing reactivity.\n\nThis isn't toxic positivity. It's neuroscience. What you focus on, you strengthen.",
      "Rung 3 is about stillness. In a world designed for constant stimulation, the ability to sit in silence is a radical act — and a powerful one.\n\nResearch shows 5-10 minutes of daily mindfulness practice reduces cortisol, improves emotional regulation, and strengthens the anterior cingulate cortex — the brain region responsible for impulse control.",
      "Rung 4 is meditation. Consistent meditation practice produces measurable changes in brain structure within 8 weeks — including increased grey matter density in the prefrontal cortex and reduced amygdala reactivity.\n\nYou are literally rebuilding your brain. 10 minutes a day is the minimum effective dose.",
      "Rung 5 is calm mastery. You have developed a complete mindfulness system. Stress no longer controls you — you respond to it with intention.\n\nAt this level, the practice deepens into genuine equanimity: the ability to remain grounded regardless of external circumstances. This is one of the most powerful advantages a human being can have.",
    ],
    connect: [
      "Rung 1 is about breaking the silence. Social connection begins with initiation — someone has to go first.\n\nResearch shows that people significantly underestimate how much others appreciate being reached out to. The person you're thinking of messaging? They want to hear from you. Send the message.",
      "Rung 2 is about presence. We live in a world of constant partial attention. Giving someone your full, undivided attention — phone face down, eyes up — is one of the rarest and most meaningful gifts you can offer.\n\nResearch shows people feel significantly more satisfied with conversations when their phone is completely absent, even if it was never touched.",
      "Rung 3 is about depth. Most social interactions remain at the level of information exchange. Real connection requires vulnerability — sharing how you actually feel, asking real questions, listening without preparing your response.\n\nDeep conversations, even brief ones, significantly increase feelings of meaning and connection compared to small talk.",
      "Rung 4 is about investment. Relationships are living things — they grow with attention or wither without it. Research by John Gottman shows that the single strongest predictor of relationship quality is the ratio of positive to negative interactions.\n\nScheduling connection — a weekly call, a monthly dinner — removes the friction that lets important relationships fade.",
      "Rung 5 is connection mastery. You have built a rich, intentional social life. Your relationships are not accidental — they are cultivated.\n\nAt this level, you give more than you take. You create community. You become the person who holds others together — and that, research consistently shows, is one of the strongest predictors of long life, health, and happiness.",
    ],
    focus: [
      "Rung 1 is about clarity before chaos. The most important decision of your workday is what you do first — before email, before messages, before the world starts making demands.\n\nWriting your Most Important Task before opening any app takes 2 minutes. It activates the prefrontal cortex and orients your entire day around what actually matters.",
      "Rung 2 is about protecting your attention. The average knowledge worker loses 2.1 hours per day to unnecessary interruptions. Every notification is a request to drop whatever you're doing and redirect your attention.\n\n25 minutes of uninterrupted focus — one Pomodoro — has been shown to produce more output than 3 hours of distracted work. Silence your phone. Close your tabs. Begin.",
      "Rung 3 is about deep work. Cal Newport defines deep work as professional activity performed in a state of distraction-free concentration that pushes your cognitive capabilities to their limit.\n\nThis kind of work creates new value, improves skill, and cannot be replicated by distracted effort. It is the work that actually moves your life forward. Protect it.",
      "Rung 4 is about systems. Weekly planning is the meta-habit — the one that makes all other focus habits work. Without it, you're reactive. With it, you're intentional.\n\nA weekly review takes 30 minutes. It identifies what worked, what didn't, and what the next week's most important work actually is. Leaders and high performers universally report weekly planning as their most valuable habit.",
      "Rung 5 is focus mastery. You have designed your environment, protected your attention, and built systems that keep you working on what matters.\n\nAt this level, you do not fight distraction — you have eliminated it. You do not motivate yourself to do deep work — you have built the structures that make it automatic. Your time and attention are fully yours.",
    ],
  },

  // After checking in a habit
  checkin_coaching: [
    { title:"You just proved something.", message:"Not to me — to yourself. Your brain just received a signal that you are someone who follows through. That signal compounds. Every check-in makes the next one more likely. This is how identity changes." },
    { title:"Emotions create habits.", message:"The positive feeling you have right now? That's not just satisfaction — it's neurological programming. BJ Fogg's research shows that celebrating a tiny win immediately after doing it rewires your brain to want to repeat the behaviour. Feel it fully." },
    { title:"Repetition builds the road.", message:"Every time you repeat an action, the neural pathway associated with it gets thicker and faster. What feels like effort now will feel automatic in weeks. You are not just doing a habit — you are building a road in your brain." },
    { title:"40% is already yours.", message:"40% of what you do every day is habit — not conscious choice. Every time you check in, you're reclaiming a small piece of that 40% and redesigning it with intention. Over time, this changes everything." },
    { title:"Small is not a compromise.", message:"The size of the habit does not determine its impact. The consistency does. A 2-minute habit done every day for a year creates more change than an intense routine done occasionally. You chose the right strategy." },
  ],

  // Before unlocking next rung
  unlock_coaching: [
    "Mastery is not about perfection. It's about the habit becoming automatic — something you do without deliberation, without negotiation with yourself.\n\nIf this habit now happens naturally, without resistance, you are ready. The next rung builds on this foundation.",
    "You have spent real days on this habit. That time was not wasted even if it didn't feel dramatic. Invisible progress is still progress. The neural pathways you've built are permanent — even if you can't see them.",
    "Research shows it takes an average of 66 days for a behaviour to become fully automatic — though this varies widely by person and habit complexity. Whether it took you 7 days or 30, you have built something real.\n\nThe next rung awaits.",
  ],

  // Celebrate screen coaching
  celebrate: [
    { title:"This is who you are becoming.", message:"You didn't just complete today's habits. You sent your brain a message — three times — that you are someone who shows up. Identity is built in exactly these moments." },
    { title:"Trust the process you can't see yet.", message:"The most important changes happening right now are invisible. Neural pathways deepening. Stress hormones declining. Sleep architecture improving. The visible results come later — but they come." },
    { title:"Consistency beats intensity. Always.", message:"A 2-minute habit done every day for a year is more powerful than an intense week followed by nothing. You chose the sustainable path. That's not the easy path — it's the right one." },
    { title:"You are in the top 1%.", message:"Most people who decide to change never actually start. Most who start quit within a week. The fact that you are here, checking in, means you have already separated yourself from the majority." },
  ],

  // Morning wisdom — rotates daily
  morning: [
    "Today is not about being perfect. It's about showing up. One habit. One pillar. One small proof that you are becoming who you want to be.",
    "The willpower you have right now — in this morning moment — is at its peak. Use it for what matters most before the day drains it.",
    "Research shows that people who do their most important habit before 10am are 3x more likely to sustain it long-term. The morning is your most powerful window.",
    "Every day you show up, the habit becomes more automatic. Every day you don't, it doesn't disappear — but it does require you to rebuild momentum. Show up today.",
    "You are 40% habit. Every morning you have the chance to consciously choose which 40% defines you. That choice is today's habits.",
    "BJ Fogg says: after you do a tiny habit, celebrate immediately. Even a small internal 'yes' or fist pump changes the neurochemistry. Plan to celebrate today.",
    "The gap between who you are and who you want to be is closed one day at a time. Today is one of those days.",
  ],
};

// ── EXPLORE CONTENT ──────────────────────────────────────
const EXPLORE = {
  weekly_themes: [
    { theme:"Awareness",    color:"#10B981", message:"The more you talk about your goals, the more real they become. Change does not start with action. It starts with noticing." },
    { theme:"Identity",     color:"#8B5CF6", message:"You are not trying to do this. You are becoming someone who does. Framing habits as identity increases success by 32%." },
    { theme:"Momentum",     color:"#F59E0B", message:"Not big actions. Not perfect actions. Just small ones. Every habit you complete adds to your momentum." },
    { theme:"Trust",        color:"#0EA5E9", message:"Trust the work when the results hide. Growth is often invisible before it is visible. The foundation you are building now will show up later." },
    { theme:"Better Not Perfect", color:"#EC4899", message:"Be gentle with yourself. Progress is rarely linear. What matters is that you keep coming back." },
    { theme:"Your Why",     color:"#F97316", message:"Reconnect with why you started. When your actions are rooted in purpose, change becomes natural and sustainable." },
    { theme:"Consistency",  color:"#10B981", message:"Consistency is not about being perfect every day. It is about coming back every time you slip." },
  ],
  articles: [
    {
      id:"rung_science",
      emoji:"🪜",
      title:"Why the Rung System Works",
      duration:"4 min",
      color:"#10B981",
      bg:"#ECFDF5",
      tag:"CoreSix Science",
      content:[
        { heading:"The Foundation Principle", body:"Every rung in CoreSix is built on one idea: you cannot build quality habits on top of a broken foundation. This is not a metaphor — it is biology. Trying to master nutrition without structure, or deep work without a clear priority, is like building on sand. The foundation rung prepares the biological and psychological conditions for every subsequent rung to actually work." },
        { heading:"Why 3 Habits Per Rung", body:"BJ Fogg's research shows that habit stacking — where one habit becomes the anchor for the next — works best in small clusters. One habit is too simple to build a real foundation. Six habits at once overwhelms the brain's change capacity. Three is the proven sweet spot: meaningful breadth, still achievable, each one reinforcing the others." },
        { heading:"Why You Must Earn Each Rung", body:"James Clear's identity research shows that self-perception changes through repeated small actions — not through big decisions. Each check-in is a vote for the person you are becoming. 15 check-ins across 3 habits in one rung is not arbitrary — it is the minimum repetition needed to begin rewiring the neural pathway. Rushing this process produces fragile habits. Earning it produces lasting ones." },
        { heading:"The Timeline Is The Point", body:"3 habits per rung. 5 check-ins each. 5 rungs per pillar. Roughly 4 months to full mastery of one pillar. This feels slow — and that is exactly why it works. Research consistently shows that habits formed over longer periods are significantly more resistant to relapse. The people who transform their lives are not the ones who changed everything at once. They are the ones who changed one small thing at a time and never stopped." },
      ]
    },
    {
      id:"foundation_research",
      emoji:"🔬",
      title:"The Science Behind Each Foundation",
      duration:"5 min",
      color:"#8B5CF6",
      bg:"#F5F3FF",
      tag:"Research",
      content:[
        { heading:"⚡ Fuel — Why Hydration First", body:"37% of people confuse thirst with hunger — fixing hydration first clarifies hunger signals before addressing food quality. Drinking water before meals reduces calorie intake by 13% on average (University of Birmingham). Structured meal timing reduces cortisol spikes and stabilises blood sugar, making every other food habit easier. You cannot build good eating habits on top of a dehydrated, unstructured biological base." },
        { heading:"💪 Move — Why 5 Push-Ups First", body:"Identity research (James Clear) shows small repeated actions change self-perception before behaviour changes. The neural pathway for a habit forms through repetition, not intensity — 5 push-ups daily for 30 days builds a stronger pathway than 50 push-ups twice. BJ Fogg's Motivation Wave shows most days are low-motivation days. Rung 1 habits are specifically designed to be done at motivation zero." },
        { heading:"😴 Rest — Why Making Your Bed First", body:"Admiral McRaven's research shows bed-making is a keystone habit — it creates a cascade of ordered behaviours throughout the day. Keystone habit research (Charles Duhigg) shows some small habits create ripple effects across unrelated areas. Bed-making correlates with higher productivity, stronger wellbeing, and better decision-making — not because it matters directly, but because it signals to the brain: I am in control today." },
        { heading:"🧘 Calm — Why 3 Breaths First", body:"3 slow breaths activate the parasympathetic nervous system in under 30 seconds — measurable cortisol reduction. The pause between stimulus and response is the foundation of all emotional regulation. Everything else — meditation, gratitude, mindfulness — builds on this pause. BJ Fogg's celebration principle shows that a 30-second habit creating an immediate positive feeling is what wires it permanently into the brain." },
        { heading:"🤝 Connect — Why One Message First", body:"Even minimal social contact reduces cortisol and increases oxytocin — one genuine message has a measurable biological effect (Holt-Lunstad). People consistently underestimate how much others appreciate being reached out to — fixing this belief requires action, not thinking. One outreach creates a connection loop. The foundation habit starts that loop." },
        { heading:"🎯 Focus — Why Writing Your MIT First", body:"Willpower is highest in the morning and depletes with every decision (Baumeister). Writing MIT before opening any app uses peak willpower for what matters most. Writing a specific intention increases follow-through by 91% (Gollwitzer, NYU). The act of writing activates the prefrontal cortex and orients attention before distractions compete for it." },
      ]
    },
    {
      id:"willpower_brain",
      emoji:"🧠",
      title:"How Your Brain Controls Willpower",
      duration:"3 min",
      color:"#8B5CF6",
      bg:"#F5F3FF",
      tag:"Science",
      content:[
        { heading:"The Prefrontal Cortex", body:"Willpower is not about mental strength — it has a physical basis in the brain. The prefrontal cortex, located right behind your forehead, is the control centre for willpower. It helps you plan, make decisions, and resist impulses." },
        { heading:"Willpower Is Like a Muscle", body:"The good news is that willpower is not something you either have or do not have. It is more like a muscle — it can be trained, strengthened, and also tired out if you push it too much without rest." },
        { heading:"Willpower Is Like a Battery", body:"Every urge, temptation, or tough decision drains it a little. Recharge it with rest, healthy food, and breaks. Do not waste it on unnecessary battles — make the healthy choice the easy choice." },
        { heading:"What This Means for You", body:"Sleep recharges your prefrontal cortex. Stress drains it. Food fuels it. Every pillar in CoreSix directly supports your willpower capacity. This is not coincidence — it is design." },
      ]
    },
    {
      id:"fuel_science",
      emoji:"⚡",
      title:"The Science of Nutrition Habits",
      duration:"3 min",
      color:"#F59E0B",
      bg:"#FFFBEB",
      tag:"Fuel",
      content:[
        { heading:"40% Is Already Habit", body:"40% of what you eat every day is driven by habit — not hunger, not conscious choice. That means the food decisions that feel automatic right now were actually learned. And anything learned can be changed." },
        { heading:"Add, Don't Restrict", body:"Research shows you are more likely to accomplish a goal focused on doing something rather than avoiding something. Instead of 'eat less junk food' — set a goal like 'add one vegetable to your day.' Addition builds momentum. Restriction builds resistance." },
        { heading:"Cravings Pass on Their Own", body:"On average it takes about 15-20 minutes before cravings go away. Left on their own, cravings will eventually disappear — the key is to remember this and ride the wave instead of giving in." },
        { heading:"2-3 Structured Meals", body:"Eating 2-3 structured meals rather than grazing throughout the day improves insulin sensitivity, stabilises energy, and makes hunger signals clearer. Your body works better with rhythm than with constant input." },
      ]
    },
    {
      id:"move_science",
      emoji:"💪",
      title:"Why Movement Changes Everything",
      duration:"2 min",
      color:"#10B981",
      bg:"#ECFDF5",
      tag:"Move",
      content:[
        { heading:"Movement Is Medicine", body:"Physical activity has a direct impact on every other pillar. It improves sleep quality, reduces stress hormones, sharpens focus, boosts mood, and strengthens willpower. No other single habit has this breadth of effect." },
        { heading:"The 5 Push-Up Principle", body:"BJ Fogg's research shows that tiny actions anchored to existing routines are the foundation of lasting movement habits. You do not start with a workout. You start with 5 push-ups before your shower. Identity change starts with repeated tiny actions — not heroic efforts." },
        { heading:"Walking After Meals", body:"Walking for just 10 minutes after eating improves blood sugar regulation by up to 30%. It is one of the most researched and underutilised health interventions available. No gym required." },
        { heading:"The Minimum Effective Dose", body:"Research shows that 7000 steps and 20-30 minutes of movement daily is the threshold for long-term health protection — reducing cardiovascular disease risk by 50% and improving longevity markers significantly." },
      ]
    },
    {
      id:"rest_science",
      emoji:"😴",
      title:"Sleep Is Your Superpower",
      duration:"3 min",
      color:"#8B5CF6",
      bg:"#F5F3FF",
      tag:"Rest",
      content:[
        { heading:"Sleep and Willpower", body:"Poor sleep directly impairs your prefrontal cortex — the seat of willpower, decision-making, and impulse control. Every habit you try to build becomes harder when you are sleep deprived. Sleep is not rest. It is maintenance." },
        { heading:"The Screen Problem", body:"Blue light from screens suppresses melatonin production by up to 50%, delaying your natural sleep onset by 90 minutes or more. Putting your phone in another room removes the temptation entirely. No willpower required — just distance." },
        { heading:"Consistency Over Duration", body:"Your body's internal clock is regulated primarily by timing consistency — not the number of hours you sleep. Going to bed at the same time every night, even on weekends, synchronises your sleep cycle and dramatically improves sleep quality within 1-2 weeks." },
        { heading:"Morning Light", body:"Natural light exposure within 30 minutes of waking sets your cortisol rhythm for the day, which directly determines when you feel tired at night. This one habit protects your entire sleep architecture." },
      ]
    },
    {
      id:"calm_science",
      emoji:"🧘",
      title:"The Neuroscience of Calm",
      duration:"2 min",
      color:"#0EA5E9",
      bg:"#F0F9FF",
      tag:"Calm",
      content:[
        { heading:"Stress Shrinks Your Brain", body:"Chronic stress literally shrinks the prefrontal cortex and enlarges the amygdala — meaning you become more reactive and less controlled over time. This affects every decision you make and every habit you try to build." },
        { heading:"The 30-Second Reset", body:"Deep breathing activates the vagus nerve and triggers the parasympathetic nervous system — your body's natural calm response. Three breaths takes 30 seconds. The neurological effect lasts hours. This is not wellness advice. It is biology." },
        { heading:"Gratitude Rewires the Brain", body:"Gratitude practice physically rewires the prefrontal cortex over time — strengthening the neural pathways associated with positive emotion and reducing reactivity. What you focus on, you strengthen." },
        { heading:"8 Weeks to a Calmer Brain", body:"Consistent meditation practice produces measurable changes in brain structure within 8 weeks — including increased grey matter density in the prefrontal cortex and reduced amygdala reactivity. You are literally rebuilding your brain. 10 minutes a day is the minimum effective dose." },
      ]
    },
    {
      id:"connect_science",
      emoji:"🤝",
      title:"Connection Is a Biological Need",
      duration:"2 min",
      color:"#EC4899",
      bg:"#FDF2F8",
      tag:"Connect",
      content:[
        { heading:"Loneliness Is Physical Pain", body:"Loneliness and social disconnection activate the same brain regions as physical pain. Connection is not a luxury — it is a biological need as fundamental as food and sleep. Isolation has the same mortality risk as smoking 15 cigarettes a day." },
        { heading:"Connection Doubles Habit Success", body:"Social support is one of the strongest predictors of habit success. People who share goals with others are significantly more likely to follow through. Accountability is not weakness — it is one of the most powerful tools in behavioural science." },
        { heading:"Quality Over Quantity", body:"Research by John Gottman shows that what matters is not how often you see people — it is the quality of attention you give them. One conversation with full presence is worth more than ten distracted ones." },
        { heading:"Go First", body:"Research shows that people significantly underestimate how much others appreciate being reached out to. The person you are thinking of messaging? They want to hear from you. The habit is simple: you go first." },
      ]
    },
    {
      id:"focus_science",
      emoji:"🎯",
      title:"The Science of Deep Focus",
      duration:"3 min",
      color:"#F97316",
      bg:"#FFF7ED",
      tag:"Focus",
      content:[
        { heading:"The Attention Economy", body:"The average person checks their phone 96 times a day. Every interruption costs 23 minutes of deep focus to recover from. If you feel scattered, it is not a character flaw — it is a design problem. Your environment is working against your focus." },
        { heading:"Deep Work Is Rare and Valuable", body:"Cal Newport defines deep work as professional activity performed in a state of distraction-free concentration that pushes your cognitive capabilities to their limit. This kind of work creates new value and cannot be replicated by distracted effort." },
        { heading:"Decision Fatigue Is Real", body:"Willpower weakens with every decision you make. The most important decision of your workday is what you do first — before email, before messages, before the world starts making demands. Writing your Most Important Task before opening any app takes 2 minutes and changes your entire day." },
        { heading:"The Pomodoro Effect", body:"25 minutes of uninterrupted focus — one Pomodoro — has been shown to produce more output than 3 hours of distracted work. The secret is not working harder. It is working in protected time blocks with nothing else competing for your attention." },
      ]
    },
  ]
};

// ── LAYER 1 — FUEL ───────────────────────────────────────

// Macro calculator — based on Mifflin-St Jeor equation
const calculateMacros = (weight, heightCm, age, sex, goal, activity) => {
  // BMR
  const bmr = sex === "male"
    ? 10 * weight + 6.25 * heightCm - 5 * age + 5
    : 10 * weight + 6.25 * heightCm - 5 * age - 161;

  // Activity multipliers
  const activityMap = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
  };
  const tdee = bmr * (activityMap[activity] || 1.55);

  // Goal adjustments
  const calorieMap = { lose: tdee - 500, maintain: tdee, gain: tdee + 300 };
  const calories = Math.round(calorieMap[goal] || tdee);

  // Macro splits
  const protein = Math.round(weight * (goal === "gain" ? 2.2 : 1.8));
  const fat     = Math.round((calories * 0.25) / 9);
  const carbs   = Math.round((calories - protein * 4 - fat * 9) / 4);

  // Fiber target — 14g per 1000 kcal (dietary guidelines)
  const fiber = Math.round((calories / 1000) * 14);
  return { calories, protein, carbs, fat, fiber, bmr: Math.round(bmr), tdee: Math.round(tdee) };
};

// Meal nutrition estimates (per 100g or per unit)
const MEAL_PRESETS = [
  { name:"Grilled chicken breast", emoji:"🍗", cal:165, protein:31, carbs:0,  fat:4,  fiber:0,  unit:"100g" },
  { name:"Brown rice (cooked)",     emoji:"🍚", cal:112, protein:2,  carbs:24, fat:1,  fiber:2,  unit:"100g" },
  { name:"Broccoli",                emoji:"🥦", cal:34,  protein:3,  carbs:7,  fat:0,  fiber:3,  unit:"100g" },
  { name:"Whole egg",               emoji:"🥚", cal:78,  protein:6,  carbs:1,  fat:5,  fiber:0,  unit:"1 egg" },
  { name:"Oats",                    emoji:"🥣", cal:389, protein:17, carbs:66, fat:7,  fiber:10, unit:"100g" },
  { name:"Banana",                  emoji:"🍌", cal:89,  protein:1,  carbs:23, fat:0,  fiber:3,  unit:"1 medium" },
  { name:"Salmon fillet",           emoji:"🐟", cal:208, protein:20, carbs:0,  fat:13, fiber:0,  unit:"100g" },
  { name:"Greek yogurt",            emoji:"🥛", cal:59,  protein:10, carbs:4,  fat:0,  fiber:0,  unit:"100g" },
  { name:"Almonds",                 emoji:"🌰", cal:164, protein:6,  carbs:6,  fat:14, fiber:4,  unit:"28g handful" },
  { name:"Sweet potato",            emoji:"🍠", cal:86,  protein:2,  carbs:20, fat:0,  fiber:3,  unit:"100g" },
  { name:"Lentils (cooked)",        emoji:"🫘", cal:116, protein:9,  carbs:20, fat:1,  fiber:8,  unit:"100g" },
  { name:"Olive oil",               emoji:"🫒", cal:119, protein:0,  carbs:0,  fat:14, fiber:0,  unit:"1 tbsp" },
  { name:"Whole wheat bread",       emoji:"🍞", cal:69,  protein:4,  carbs:12, fat:1,  fiber:2,  unit:"1 slice" },
  { name:"Tuna (canned)",           emoji:"🐠", cal:132, protein:29, carbs:0,  fat:1,  fiber:0,  unit:"100g" },
  { name:"Apple",                   emoji:"🍎", cal:52,  protein:0,  carbs:14, fat:0,  fiber:4,  unit:"1 medium" },
  { name:"Cottage cheese",          emoji:"🧀", cal:98,  protein:11, carbs:3,  fat:4,  fiber:0,  unit:"100g" },
  { name:"Quinoa (cooked)",         emoji:"🌾", cal:120, protein:4,  carbs:21, fat:2,  fiber:3,  unit:"100g" },
  { name:"Avocado",                 emoji:"🥑", cal:160, protein:2,  carbs:9,  fat:15, fiber:7,  unit:"half" },
];

// ── LAYER 2 — MOVE ───────────────────────────────────────
const WORKOUT_PRESETS = [
  { name:"Walking",          emoji:"🚶", met:3.5, unit:"min" },
  { name:"Running",          emoji:"🏃", met:8.0, unit:"min" },
  { name:"Cycling",          emoji:"🚴", met:7.0, unit:"min" },
  { name:"Push-ups",         emoji:"💪", met:4.0, unit:"sets" },
  { name:"Squats",           emoji:"🏋️", met:5.0, unit:"sets" },
  { name:"Plank",            emoji:"🧘", met:3.0, unit:"min" },
  { name:"Jumping Jacks",    emoji:"⭐", met:8.0, unit:"min" },
  { name:"Yoga",             emoji:"🌿", met:2.5, unit:"min" },
  { name:"Swimming",         emoji:"🏊", met:8.0, unit:"min" },
  { name:"HIIT",             emoji:"🔥", met:10.0, unit:"min" },
  { name:"Pull-ups",         emoji:"🏋️", met:4.0, unit:"sets" },
  { name:"Lunges",           emoji:"🦵", met:4.0, unit:"sets" },
  { name:"Stretching",       emoji:"🤸", met:2.5, unit:"min" },
  { name:"Stair climbing",   emoji:"🪜", met:9.0, unit:"min" },
  { name:"Bodyweight circuit",emoji:"⚡", met:7.0, unit:"min" },
];

// ── LADDER ───────────────────────────────────────────────
const LADDER = {
  fuel: [
    { title:"Foundation — Hydration", options:["Drink a full glass of water before my first coffee every morning","Drink 8 glasses of water spread throughout the day","Drink a glass of water before every meal","Replace one sugary drink with water every day","Start my day with 500ml of water before anything else","Eat 3 structured meals today — breakfast, lunch and dinner — no skipping"] },
    { title:"Mindful Eating", options:["Eat breakfast sitting down with no phone or screens","Chew slowly and put my fork down between every bite","Eat 2-3 structured meals today with no snacking between them","Stop eating when I feel 80% full — not stuffed","Sit at a table for every meal today — no desk, no sofa","Take 3 deep breaths before eating my first meal"] },
    { title:"Protein & Nutrients", options:["Add a source of protein to every meal today","Include one vegetable or salad with lunch and dinner","Eat exactly 3 meals today — protein, vegetables and complex carbs in each","Cook at home for at least one meal today","Eat 2 meals today with a 5-6 hour gap between them","Eat at least 3 different coloured vegetables across my meals today"] },
    { title:"Meal Planning", options:["Plan my 3 meals for tomorrow — times and what I will eat — before bed","Prep all 3 meals for tomorrow in one 20-minute session tonight","Write a grocery list for a full week of 2-3 meals per day","Batch cook protein and vegetables on the weekend for the week","Set fixed meal times for tomorrow — breakfast, lunch, dinner — and stick to them","Plan exactly 2 meals for tomorrow and eat nothing in between"] },
    { title:"Nutrition Mastery", options:["Eat whole foods for every meal today — nothing ultra-processed","Eat exactly 2-3 balanced meals today with no eating outside those windows","Track my protein intake across my 2-3 meals and hit my daily target","Follow my meal plan exactly — right foods, right times, right portions","Cook every meal from scratch today — breakfast, lunch and dinner","Eat the rainbow across my meals — 6 different coloured plants today"] },
  ],
  move: [
    { title:"Foundation — Just Start", options:["Do 5 push-ups before stepping into the shower","Do 10 jumping jacks the moment my alarm goes off","Walk to the end of the street and back before breakfast","Do 10 calf raises while brushing my teeth","Stretch my arms above my head for 60 seconds after waking","March in place for 2 minutes while my kettle boils"] },
    { title:"Daily Walk", options:["Take a 10-minute walk outside after lunch every day","Walk to a colleague instead of sending a message","Take the stairs instead of the lift every time today","Park further away and walk the extra distance","Go for a 15-minute walk before or after dinner","Walk while taking phone calls instead of sitting"] },
    { title:"Bodyweight Training", options:["Complete a 15-minute bodyweight workout 3 times this week","Do 3 sets of push-ups, squats and lunges every morning","Complete a 7-minute HIIT workout before breakfast","Do 20 squats every time I stand up from my desk","Follow a beginner workout video on YouTube 3x this week","Do a 10-minute yoga flow every morning before work"] },
    { title:"Consistent Training", options:["Hit 7000 steps every day this week — track it","Complete a 30-minute workout 4 times this week","Go to the gym or follow my training plan as scheduled","Cycle, swim or run for 20 minutes 3 times this week","Do a full workout without skipping any exercises","Complete my planned workout even when I don't feel like it"] },
    { title:"Movement Mastery", options:["Complete my full planned training session — no shortcuts","Hit 10000 steps and 30 minutes of exercise today","Train the muscle group I have been avoiding this week","Do my workout at the same time every day this week","Add one extra set to every exercise in my session today","Complete all planned workouts this week without missing any"] },
  ],
  rest: [
    { title:"Foundation — Morning Win", options:["Make my bed within 5 minutes of waking up every day","Sit in silence for 2 minutes before picking up my phone","Drink a glass of water the moment I wake up","Open the curtains and get natural light within 10 minutes of waking","Take 5 slow deep breaths before getting out of bed","Do not check my phone for the first 10 minutes after waking"] },
    { title:"Screen Boundaries", options:["Put my phone in another room 15 minutes before sleep","Turn off all screens at least 30 minutes before my bedtime","Use my phone on Do Not Disturb mode from 9pm onwards","No social media after 9pm — any app counts","Put my phone charger in the hallway or kitchen overnight","Switch my phone to grayscale mode after 8pm"] },
    { title:"Sleep Schedule", options:["Go to bed at exactly the same time every night this week","Set a bedtime alarm 30 minutes before I want to sleep","Wake up at the same time every morning — including weekends","Get into bed 20 minutes before my target sleep time","Write tomorrow's top task before I close my eyes","Avoid caffeine after 2pm to protect tonight's sleep"] },
    { title:"Sleep Environment", options:["Get 10 minutes of natural light within 30 minutes of waking","Keep my bedroom cool and dark — open a window or use blackout curtains","Take a warm shower before bed to lower my body temperature","Use white noise or earplugs if there is noise in my environment","Remove all screens from my bedroom permanently","Spray lavender on my pillow or use a diffuser before sleep"] },
    { title:"Rest Mastery", options:["Follow my complete wind-down routine every night without exception","Get 7-8 hours of sleep and track it for the whole week","Wake up refreshed — adjust bedtime if I am still tired","Complete my morning and evening routine without any deviation","Review my sleep quality and make one improvement this week","Sleep and wake at the exact same time every day this week"] },
  ],
  calm: [
    { title:"Foundation — The Pause", options:["Take 3 slow deep breaths before opening any social media app","Take one slow breath before replying to any stressful message","Pause for 5 seconds before reacting to anything today","Do 4-7-8 breathing when I feel tension — 4 in, 7 hold, 8 out","Step away from my phone for 5 minutes when I feel overwhelmed","Name my emotion out loud when I feel stressed — it reduces it"] },
    { title:"Gratitude Practice", options:["Write one thing I am grateful for before checking my phone","Write 3 specific things that went well today before bed","Tell one person today what I appreciate about them","Notice one beautiful thing in my environment right now","Write a gratitude note to someone who helped me recently","List 5 things I take for granted that I am actually lucky to have"] },
    { title:"Mindful Moments", options:["Sit in silence for 5 minutes with my morning drink","Spend 10 minutes outside with no phone or headphones","Do a 5-minute body scan — notice where I hold tension and release it","Eat one meal today in complete silence — no screens, no music","Take a 5-minute break every 90 minutes — just breathe","Do a 10-minute walk with no destination and no phone"] },
    { title:"Meditation Practice", options:["Do a 10-minute guided meditation every morning before work","Use a meditation app for 10 minutes after waking up","Do a 10-minute breathing exercise before bed every night","Practice loving-kindness meditation for 10 minutes today","Meditate for 10 minutes at the same time every day this week","Do a body scan meditation for 10 minutes before sleep"] },
    { title:"Calm Mastery", options:["Complete my full mindfulness practice every day this week","Meditate for 20 minutes without guided audio — just breath","Journal every morning and evening for the full week","Maintain a stress journal — note every trigger and my response","Do a weekly emotional review — what patterns did I notice","Spend 30 minutes in complete silence and solitude every day"] },
  ],
  connect: [
    { title:"Foundation — Reach Out", options:["Send one genuine message to someone I care about today","Reply to one message I have been putting off","Text someone just to say I was thinking of them","Send a voice note to a friend instead of a text","Wish a colleague a genuine good morning today","Write a 2-line message to someone I have not spoken to in a while"] },
    { title:"Present Connections", options:["Have one conversation today with my phone face-down","Give one specific genuine compliment to someone today","Ask someone how they really are — and actually listen","Make eye contact and smile at the next person I pass","Thank someone who helped me recently — be specific","Put my phone away during my next meal with another person"] },
    { title:"Deeper Conversations", options:["Call instead of texting one person today","Ask a meaningful question in my next conversation","Share something real about how I am feeling with someone I trust","Have lunch with a colleague instead of eating alone","Tell someone one thing I appreciate about them","Ask someone to share something good that happened to them"] },
    { title:"Investing in Relationships", options:["Plan and schedule a catch-up with a friend I have been meaning to see","Write a heartfelt message to someone who shaped who I am","Organise a group activity or dinner with people I care about","Have a 20-minute uninterrupted conversation with someone I love","Reach out to someone I have lost touch with","Do something kind for someone without being asked"] },
    { title:"Connection Mastery", options:["Plan one meaningful in-person connection every week from now on","Create a connection ritual — weekly call, walk or dinner with someone","Invest one focused hour of undivided attention in a key relationship","Resolve a misunderstanding or conflict I have been avoiding","Build something together with someone — a goal, a project, a habit","Express love or appreciation in a non-verbal way to someone today"] },
  ],
  focus: [
    { title:"Foundation — Name Your Priority", options:["Write my single most important task before opening email","Say my top priority out loud before sitting at my desk","Write tomorrow's most important task before closing my laptop tonight","Identify the one thing that if done will make everything else easier","Write my goal for today in one clear sentence before I start","Choose one task to finish completely before starting anything else"] },
    { title:"Distraction-Free Work", options:["Set a 25-minute timer and work on one thing only","Turn off all notifications for the next 30 minutes","Close all browser tabs except the one I am working on","Put my phone in another room while I work for 30 minutes","Use airplane mode for 25 minutes to do deep work","Work in a distraction-free environment for one full hour"] },
    { title:"Deep Work Blocks", options:["Complete three Pomodoros — 25 min work, 5 min rest — before lunch","Block 60 minutes of deep work before any meetings today","Batch all my emails into one 20-minute block today","Do my most creative work in the first 2 hours of the day","Complete my three most important tasks before reactive work","Work on my most important project for 45 minutes without stopping"] },
    { title:"Weekly Planning", options:["Do a weekly review every Sunday — what worked, what did not","Plan next week every Friday before finishing work","Write my top 3 goals for the week every Monday morning","Review my progress toward my monthly goal every week","Block my key tasks in my calendar before the week starts","Delete one low-value task from my list every week"] },
    { title:"Focus Mastery", options:["Complete a full 90-minute deep work session every day this week","Finish every day with a shutdown ritual — clear, plan, close","Protect my peak energy hours for my most important work every day","Complete all planned deep work sessions without skipping","Review my quarterly goals and align today's work with them","Track how I spend every 30-minute block for one full day"] },
  ],
};

// ── MINI REASSESSMENT QUESTIONS ─────────────────────────
const MINI_ASSESSMENT = {
  fuel: [
    { q:"How would you describe your eating habits now compared to when you started?", options:["Still the same","Slightly more structured","Noticeably better","Much more intentional"] },
    { q:"How is your energy throughout the day?", options:["Same as before","A little more stable","Noticeably better","Much more consistent"] },
  ],
  move: [
    { q:"How active do you feel compared to 7 days ago?", options:["About the same","A little more active","Noticeably more active","Much more active"] },
    { q:"How does your body feel physically?", options:["Same as before","Slightly better","Noticeably better","Stronger and energised"] },
  ],
  rest: [
    { q:"How is your sleep compared to when you started?", options:["Still struggling","Slightly better","Noticeably improved","Much better"] },
    { q:"How do you feel when you wake up?", options:["Still tired","A little more rested","Noticeably more rested","Refreshed and ready"] },
  ],
  calm: [
    { q:"How are your stress levels compared to 7 days ago?", options:["Still high","Slightly more manageable","Noticeably calmer","Much calmer"] },
    { q:"How would you rate your overall mental state?", options:["Same as before","A little more balanced","Noticeably more grounded","Very calm and centred"] },
  ],
  connect: [
    { q:"How connected do you feel to the people around you?", options:["Same as before","Slightly more connected","Noticeably more connected","Much more connected"] },
    { q:"How intentional have your relationships felt this week?", options:["Same as before","A little more intentional","Noticeably more meaningful","Much deeper"] },
  ],
  focus: [
    { q:"How focused do you feel compared to 7 days ago?", options:["About the same","Slightly more focused","Noticeably more focused","Much sharper"] },
    { q:"How productive have you been this week?", options:["Same as before","A little more productive","Noticeably more productive","Highly productive"] },
  ],
};

const RUNG_MIN_DAYS = [7, 14, 21, 30]; // min days required per rung before level up

const canLevelUp = (ladder, pid) => {
  const rung = ladder[pid]?.rung || 0;
  const days = ladder[pid]?.days || 0;
  const minDays = RUNG_MIN_DAYS[rung] || 7;
  return days >= minDays && rung < 4;
};

const daysToLevelUp = (ladder, pid) => {
  const rung = ladder[pid]?.rung || 0;
  const days = ladder[pid]?.days || 0;
  const minDays = RUNG_MIN_DAYS[rung] || 7;
  return Math.max(0, minDays - days);
};

// ── MINI PILLAR ASSESSMENTS (after 7 days) ──────────────
const MINI_ASSESSMENTS = {
  fuel: {
    title: "⚡ Fuel Check-in",
    intro: "You've been working on your Fuel habit for 7 days. Let's see what's changed.",
    questions: [
      {
        q: "How do your energy levels feel compared to 7 days ago?",
        options: [{t:"About the same",s:1},{t:"Slightly more stable",s:2},{t:"Noticeably better",s:3},{t:"Much more energised",s:4}]
      },
      {
        q: "How intentional are your eating habits now?",
        options: [{t:"Still pretty random",s:1},{t:"A bit more structured",s:2},{t:"More consistent than before",s:3},{t:"Very intentional",s:4}]
      },
    ]
  },
  move: {
    title: "💪 Move Check-in",
    intro: "You've been doing your Move habit for 7 days. Let's see what's changed.",
    questions: [
      {
        q: "How active do you feel compared to 7 days ago?",
        options: [{t:"About the same",s:1},{t:"Slightly more active",s:2},{t:"Noticeably more active",s:3},{t:"Much more active",s:4}]
      },
      {
        q: "Has your body felt different this week?",
        options: [{t:"Not really",s:1},{t:"A little lighter or stronger",s:2},{t:"Definitely more energised",s:3},{t:"Significantly better",s:4}]
      },
    ]
  },
  rest: {
    title: "😴 Rest Check-in",
    intro: "You've been working on your Rest habit for 7 days. Let's see what's changed.",
    questions: [
      {
        q: "How is your sleep quality compared to 7 days ago?",
        options: [{t:"About the same",s:1},{t:"Slightly better",s:2},{t:"Noticeably better",s:3},{t:"Much better",s:4}]
      },
      {
        q: "How do you feel in the mornings now?",
        options: [{t:"Still tired most days",s:1},{t:"A little more rested",s:2},{t:"More refreshed than before",s:3},{t:"Waking up energised",s:4}]
      },
    ]
  },
  calm: {
    title: "🧘 Calm Check-in",
    intro: "You've been working on your Calm habit for 7 days. Let's see what's changed.",
    questions: [
      {
        q: "How do you handle stress now compared to 7 days ago?",
        options: [{t:"About the same",s:1},{t:"Slightly calmer",s:2},{t:"Noticeably more grounded",s:3},{t:"Much calmer and in control",s:4}]
      },
      {
        q: "How present do you feel in daily life?",
        options: [{t:"Still scattered and reactive",s:1},{t:"A little more aware",s:2},{t:"More present than before",s:3},{t:"Very present and grounded",s:4}]
      },
    ]
  },
  connect: {
    title: "🤝 Connect Check-in",
    intro: "You've been working on your Connect habit for 7 days. Let's see what's changed.",
    questions: [
      {
        q: "How connected do you feel to people around you compared to 7 days ago?",
        options: [{t:"About the same",s:1},{t:"Slightly more connected",s:2},{t:"Noticeably more connected",s:3},{t:"Much more connected",s:4}]
      },
      {
        q: "How intentional are your relationships now?",
        options: [{t:"Still pretty passive",s:1},{t:"A little more proactive",s:2},{t:"Reaching out more than before",s:3},{t:"Very intentional about connection",s:4}]
      },
    ]
  },
  focus: {
    title: "🎯 Focus Check-in",
    intro: "You've been working on your Focus habit for 7 days. Let's see what's changed.",
    questions: [
      {
        q: "How focused do you feel compared to 7 days ago?",
        options: [{t:"About the same",s:1},{t:"Slightly sharper",s:2},{t:"Noticeably more focused",s:3},{t:"Much more focused and clear",s:4}]
      },
      {
        q: "How clear are your daily priorities now?",
        options: [{t:"Still scattered",s:1},{t:"A little clearer",s:2},{t:"More structured than before",s:3},{t:"Very clear and intentional",s:4}]
      },
    ]
  },
};

const QUESTIONNAIRE = [
  { id:"fuel",    emoji:"⚡", question:"How would you describe your eating habits?", answers:[{t:"I eat whatever, whenever — not much thought",s:1},{t:"Pretty decent but inconsistent — good and bad days",s:2},{t:"I eat well most of the time — mostly whole foods",s:3},{t:"Very intentional — I plan and prioritise nutrition",s:4}] },
  { id:"move",    emoji:"💪", question:"How active are you on a typical week?", answers:[{t:"Mostly sedentary — I sit most of the day",s:1},{t:"Light activity — occasional walks or casual exercise",s:2},{t:"Moderately active — I exercise 2-3 times a week",s:3},{t:"Very active — I train regularly and hit my step goals",s:4}] },
  { id:"rest",    emoji:"😴", question:"How well do you sleep and recover?", answers:[{t:"Poorly — I rarely get enough and feel tired daily",s:1},{t:"Inconsistent — some good nights, many bad ones",s:2},{t:"Fairly well — I usually get 6-7 hours most nights",s:3},{t:"Really well — 7-8 hours, consistent, wake refreshed",s:4}] },
  { id:"calm",    emoji:"🧘", question:"How do you handle stress and your mental state?", answers:[{t:"I feel overwhelmed often — stress controls me",s:1},{t:"I manage but it takes effort — some anxiety day to day",s:2},{t:"Pretty balanced — I have tools to manage stress",s:3},{t:"Very calm and grounded — strong mindfulness practices",s:4}] },
  { id:"connect", emoji:"🤝", question:"How would you describe your relationships and social life?", answers:[{t:"Isolated — I feel disconnected from people around me",s:1},{t:"Okay but surface level — I want deeper connections",s:2},{t:"Good relationships — I have people I can rely on",s:3},{t:"Thriving — rich meaningful relationships and community",s:4}] },
  { id:"focus",   emoji:"🎯", question:"How focused and purposeful do you feel in daily life?", answers:[{t:"Scattered — I feel lost, distracted and without direction",s:1},{t:"Somewhat focused — I have goals but struggle to stay on track",s:2},{t:"Pretty focused — I know my priorities and work toward them",s:3},{t:"Laser focused — clear purpose, deep work, consistent execution",s:4}] },
  { id:"age",     emoji:"🎂", question:"How old are you?", answers:[{t:"Under 25",s:null},{t:"25-35",s:null},{t:"36-50",s:null},{t:"Over 50",s:null}] },
  { id:"sex",     emoji:"👤", question:"What is your biological sex?", answers:[{t:"Male",s:null},{t:"Female",s:null},{t:"Prefer not to say",s:null}] },
  { id:"health",  emoji:"🏥", question:"How would you describe your overall physical health?", answers:[{t:"Very healthy — no ongoing health concerns",s:null},{t:"Generally healthy with minor issues",s:null},{t:"Managing one or more ongoing health conditions",s:null},{t:"Health is a significant challenge for me right now",s:null}] },
  { id:"goal",    emoji:"🏆", question:"What is your biggest goal right now?", answers:[{t:"Lose weight and improve my body",s:null},{t:"Reduce stress and feel more calm",s:null},{t:"Build better daily routines and discipline",s:null},{t:"Improve energy and feel better every day",s:null},{t:"Perform better at work or sport",s:null},{t:"Live a longer healthier life",s:null}] },
];

const STAGES = [
  { name:"Awakening", days:[0,6],   color:"#10B981", bg:"#ECFDF5", desc:"Every journey begins with one step." },
  { name:"Building",  days:[7,20],  color:"#F59E0B", bg:"#FFFBEB", desc:"The habit is taking root in you." },
  { name:"Momentum",  days:[21,44], color:"#8B5CF6", bg:"#F5F3FF", desc:"You are becoming someone new." },
  { name:"Mastery",   days:[45,999],color:"#EC4899", bg:"#FDF2F8", desc:"This is who you are now." },
];

// ── WEEKLY IMPACT ────────────────────────────────────────
const IMPACT_QUESTIONS = {
  fuel:    { question:"How did your Fuel habit feel this week?", options:[{emoji:"😴",label:"Struggling"},{emoji:"😐",label:"Same"},{emoji:"😊",label:"Better"},{emoji:"⚡",label:"Much better"}] },
  move:    { question:"How does your body feel this week?",      options:[{emoji:"😓",label:"Tired"},{emoji:"💪",label:"Solid"},{emoji:"🔥",label:"Stronger"},{emoji:"⭐",label:"Best yet"}] },
  rest:    { question:"How was your sleep this week?",           options:[{emoji:"😴",label:"Poor"},{emoji:"😐",label:"Fair"},{emoji:"😊",label:"Good"},{emoji:"⭐",label:"Great"}] },
  calm:    { question:"How stressed did you feel this week?",    options:[{emoji:"🔴",label:"Very stressed"},{emoji:"🟡",label:"Some stress"},{emoji:"🟢",label:"Manageable"},{emoji:"💚",label:"Calm"}] },
  connect: { question:"How connected did you feel this week?",   options:[{emoji:"😔",label:"Isolated"},{emoji:"😐",label:"Okay"},{emoji:"😊",label:"Connected"},{emoji:"🤝",label:"Thriving"}] },
  focus:   { question:"How focused were you this week?",         options:[{emoji:"🌀",label:"Scattered"},{emoji:"😐",label:"Okay"},{emoji:"🎯",label:"Focused"},{emoji:"⚡",label:"In flow"}] },
};

const IMPACT_TRENDS = ["needs attention ↓","same →","getting better ↑","strong ↑"];
const IMPACT_LABELS = ["Struggling","Same / Okay","Getting better","Thriving"];

const getStage = s => STAGES.find(st=>s>=st.days[0]&&s<=st.days[1])||STAGES[0];
const getPillar = id => PILLARS[id];
const getRand = arr => arr[Math.floor(Math.random()*arr.length)];

const SAVE_KEY = "coresix_v2";
const DEVICE_ID = getDeviceId();
const loadState = () => { try { const d=localStorage.getItem(SAVE_KEY); return d?migrateState(JSON.parse(d)):null; } catch { return null; } };
const saveState = s => { try { localStorage.setItem(SAVE_KEY,JSON.stringify(s)); } catch {} };

const initState = () => ({
  name:"", screen:"splash",
  qIndex:0, qAnswers:{}, scores:{}, profile:{},
  ladder: Object.fromEntries(PIDS.map(pid=>[pid,{
    rung: 0,
    habits: [],     // [{habit, checkins, mastered}] — active habits in current rung
    days: 0,        // total checkins across all habits this rung
    selected: null, // current primary habit (for backward compat)
  }])),
  checkedToday: Object.fromEntries(PIDS.map(pid=>[pid,false])),
  streak:0, lastDate:null, history:[], tab:"today",
  weeklyImpact:{}, impactHistory:[],
  showWeeklyCheckin:false,
  selectedPillars:null,
  coachingRead: {},
  morningIdx:0,
  fuel:{
    setup:false, weight:"", heightCm:"", age:"", sex:"male",
    goal:"maintain", activity:"moderate",
    targets:{calories:2000,protein:150,carbs:200,fat:67,fiber:28},
    meals:[], waterGlasses:0, waterDate:"",
  },
  move:{
    stepGoal:7000, stepsToday:0, stepsDate:"",
    workouts:[],
  },
  rest:{
    bedtime:"", wakeTime:"", sleepDate:"",
    quality:0, // 1-5
    windDown:[], // completed wind-down items
    sleepHistory:[], // [{date, hours, quality, windDownCount}]
  },
  calm:{stressLevel:0,mood:"",gratitude:[],breathingDone:false,meditationMins:0,calmActivities:[],calmDate:""},
  connect:{
    connections:[],     // [{date, name, type, quality, note}]
    socialBattery:0,    // 1-10 energy level
    kindness:[],        // acts of kindness done today
    relationships:[],   // [{name, lastContact, importance, notes}]
    connectDate:"",
  },
  focus:{mit:"",pomodoros:0,pomodoroMins:25,distractions:[],deepWorkMins:0,energyLevel:0,tasks:[],weeklyGoals:[],focusDate:""},
});

// Migrate old state — add fuel if missing
const migrateState = (s) => {
  if (!s) return s;
  if (!s.fuel) {
    s.fuel = {
      setup:false, weight:"", heightCm:"", age:"", sex:"male",
      goal:"maintain", activity:"moderate",
      targets:{calories:2000,protein:150,carbs:200,fat:67,fiber:28},
      meals:[], waterGlasses:0, waterDate:"",
    };
  }
  if (!s.fuel.targets) s.fuel.targets = {calories:2000,protein:150,carbs:200,fat:67,fiber:28};
  if (s.fuel.targets && !s.fuel.targets.fiber) s.fuel.targets.fiber = 28;
  if (!s.move) s.move = {stepGoal:7000,stepsToday:0,stepsDate:"",workouts:[]};
  if (!s.rest) s.rest = {bedtime:"",wakeTime:"",sleepDate:"",quality:0,windDown:[],sleepHistory:[]};
  if (!s.calm) s.calm = {stressLevel:0,mood:"",gratitude:[],breathingDone:false,meditationMins:0,calmActivities:[],calmDate:""};
  // Migrate ladder to new multi-habit format
  if (s.ladder) {
    Object.keys(s.ladder).forEach(pid => {
      const l = s.ladder[pid];
      if (!l.habits) {
        l.habits = l.selected ? [{habit:l.selected,checkins:l.days||0,mastered:(l.days||0)>=5}] : [];
      }
    });
  }
  if (!s.connect) s.connect = {connections:[],socialBattery:0,kindness:[],relationships:[],connectDate:""};
  if (!s.focus) s.focus = {mit:"",pomodoros:0,pomodoroMins:25,distractions:[],deepWorkMins:0,energyLevel:0,tasks:[],weeklyGoals:[],focusDate:""};
  return s;
};

// ── COACHING CARD COMPONENT ───────────────────────────────
function CoachCard({ icon, title, message, color="#6D28D9", bg="linear-gradient(135deg,#F5F3FF,#EFF6FF)", border="#DDD6FE", onContinue, continueLabel="Continue →" }) {
  const lines = message.split("\n\n");
  return (
    <div style={{background:bg,borderRadius:20,padding:"24px 22px",border:`1.5px solid ${border}`,boxShadow:`0 8px 32px ${color}18`}}>
      {icon && <div style={{fontSize:36,marginBottom:14,textAlign:"center"}}>{icon}</div>}
      {title && <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:20,color:"#0f0f0f",marginBottom:14,letterSpacing:-0.3,lineHeight:1.2}}>{title}</div>}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {lines.map((line,i)=>(
          <p key={i} style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:14,color:"#374151",lineHeight:1.75}}>{line}</p>
        ))}
      </div>
      {onContinue && (
        <button onClick={onContinue} style={{width:"100%",marginTop:20,padding:"14px",borderRadius:14,border:"none",background:color,color:"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",letterSpacing:0.3}}>
          {continueLabel}
        </button>
      )}
    </div>
  );
}

// ── FUEL LAYER COMPONENT ─────────────────────────────────
function FuelLayer({ st, update, S, onMealAdded, goToHabits, fuelHabit, fetchAIInsight, buildRungContext }) {
  const [view, setView] = useState("dashboard"); // dashboard | setup | log | photo
  const [logSearch, setLogSearch] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoResult, setPhotoResult] = useState(null);
  const [customMeal, setCustomMeal] = useState({name:"",cal:"",protein:"",carbs:"",fat:"",fiber:""});
  const [fuelInsight, setFuelInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  // Analyse how meal data relates to the current Fuel habit
  const analyzeFuelHabit = () => {
    if (!fuelHabit) return null;
    const habit = fuelHabit.toLowerCase();
    const mealCount = todayMeals.length;
    const proteinPct = targets.protein > 0 ? Math.round((totals.protein/targets.protein)*100) : 0;
    const calPct = targets.calories > 0 ? Math.round((totals.cal/targets.calories)*100) : 0;
    const fiberPct = (targets.fiber||28) > 0 ? Math.round((totals.fiber/(targets.fiber||28))*100) : 0;

    // Match habit to tracked data
    if (habit.includes("3 meals") || habit.includes("3 structured")) {
      return { goal:`3 meals today`, actual:`${mealCount} meals logged`, met: mealCount >= 3 };
    } else if (habit.includes("2 meals") || habit.includes("2-3")) {
      return { goal:`2-3 meals today`, actual:`${mealCount} meals logged`, met: mealCount >= 2 && mealCount <= 3 };
    } else if (habit.includes("protein")) {
      return { goal:`Hit protein target`, actual:`${proteinPct}% of protein goal`, met: proteinPct >= 90 };
    } else if (habit.includes("water") || habit.includes("glass")) {
      const waterPct = Math.round((waterToday/8)*100);
      return { goal:`8 glasses of water`, actual:`${waterToday} glasses today`, met: waterToday >= 8 };
    } else if (habit.includes("calori") || habit.includes("track")) {
      return { goal:`Track all meals`, actual:`${mealCount} meals logged`, met: mealCount >= 2 };
    }
    return { goal:fuelHabit, actual:`${mealCount} meals logged`, met: mealCount >= 2 };
  };

  const getFuelAIInsight = async () => {
    if (!fetchAIInsight) return;
    setInsightLoading(true);
    const habitAnalysis = analyzeFuelHabit();
    const rungCtx = buildRungContext ? buildRungContext("fuel") : {};
    const context = {
      habit: fuelHabit,
      meals_logged: todayMeals.length,
      meal_names: todayMeals.map(m=>m.name).join(", "),
      calories_pct: targets.calories > 0 ? Math.round((totals.cal/targets.calories)*100) : 0,
      protein_pct: targets.protein > 0 ? Math.round((totals.protein/targets.protein)*100) : 0,
      fiber_pct: (targets.fiber||28) > 0 ? Math.round((totals.fiber/(targets.fiber||28))*100) : 0,
      water_glasses: waterToday,
      habit_met: habitAnalysis?.met,
    };
    // Build a specific prompt
    const insight = await fetchAIInsight("fuel_insight", JSON.stringify(context));
    setFuelInsight(insight || "Keep logging your meals — every entry builds a clearer picture of your nutrition.");
    setInsightLoading(false);
  };

  const fuel = st.fuel || {};
  const targets = fuel.targets || {calories:2000,protein:150,carbs:200,fat:67,fiber:28};
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = (fuel.meals||[]).filter(m=>m.date===today);

  // Totals for today
  const totals = todayMeals.reduce((acc,m)=>({
    cal:     acc.cal     + (m.cal||0),
    protein: acc.protein + (m.protein||0),
    carbs:   acc.carbs   + (m.carbs||0),
    fat:     acc.fat     + (m.fat||0),
    fiber:   acc.fiber   + (m.fiber||0),
  }), {cal:0,protein:0,carbs:0,fat:0,fiber:0});

  // Water tracking
  const waterToday = fuel.waterDate===today && fuel.waterDate ? (fuel.waterGlasses||0) : 0;

  const addMeal = (meal) => {
    const newMeals = [...(fuel.meals||[]), {...meal, date:today, time:new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}];
    const newFuel = {...fuel, meals:newMeals.slice(-50)};
    update({fuel:newFuel});
    setView("dashboard");
    setLogSearch("");
    // Show confirmation
    const newTotals = newMeals.filter(m=>m.date===today).reduce((acc,m)=>({
      cal:acc.cal+(m.cal||0), protein:acc.protein+(m.protein||0)
    }),{cal:0,protein:0});
    const targets = fuel.targets||{calories:2000,protein:150};
    const proteinPct = Math.round((newTotals.protein/targets.protein)*100);
    const calPct = Math.round((newTotals.cal/targets.calories)*100);
    if (onMealAdded) onMealAdded(`✅ ${meal.name} logged! Protein: ${proteinPct}% · Calories: ${calPct}% of daily goal`);
  };

  const addWater = () => {
    update({fuel:{...fuel, waterGlasses:(waterToday+1), waterDate:today}});
  };

  const saveSetup = () => {
    const {weight,heightCm,age,sex,goal,activity} = fuel;
    if (!weight||!heightCm||!age) return;
    const targets = calculateMacros(
      parseFloat(weight), parseFloat(heightCm),
      parseInt(age), sex, goal, activity
    );
    update({fuel:{...fuel, targets, setup:true}});
    setView("dashboard");
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoLoading(true);
    setPhotoResult(null);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(",")[1];
        const res = await fetch("https://coresix-backend-production.up.railway.app/api/food-photo", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({image:base64, mimeType:file.type})
        });
        const data = await res.json();
        setPhotoResult(data);
        setPhotoLoading(false);
      };
      reader.readAsDataURL(file);
    } catch(err) {
      setPhotoLoading(false);
      setPhotoResult({error:"Could not analyse photo. Try again."});
    }
  };

  const pct = (val,target) => Math.min(100,Math.round((val/target)*100));
  const remaining = (val,target) => Math.max(0, target-val);

  const MacroBar = ({label,val,target,color,unit="g"}) => (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,fontWeight:600,color:"#444"}}>{label}</span>
        <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#888"}}>{val}{unit} / {target}{unit}</span>
      </div>
      <div style={{background:"#f0f0f0",borderRadius:6,height:8,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:6,background:color,width:`${pct(val,target)}%`,transition:"width 0.6s ease"}}/>
      </div>
      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#bbb",marginTop:3}}>{remaining(val,target)}{unit} remaining</div>
    </div>
  );

  // ── SETUP SCREEN ──
  if (view==="setup") return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setView("dashboard")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>←</button>
        <h3 style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f"}}>Your Nutrition Targets</h3>
      </div>
      <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",lineHeight:1.6}}>Based on your body stats, we calculate your personalised daily macro targets using the Mifflin-St Jeor equation.</p>

      {[
        {label:"Weight (kg)",    key:"weight",    placeholder:"e.g. 75",  type:"number"},
        {label:"Height (cm)",    key:"heightCm",  placeholder:"e.g. 175", type:"number"},
        {label:"Age",            key:"age",        placeholder:"e.g. 32",  type:"number"},
      ].map(field=>(
        <div key={field.key}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,fontWeight:600,color:"#444",marginBottom:6}}>{field.label}</div>
          <input type={field.type} value={fuel[field.key]||""} onChange={e=>update({fuel:{...fuel,[field.key]:e.target.value}})}
            placeholder={field.placeholder} style={{...S.input,padding:"12px 16px"}}/>
        </div>
      ))}

      <div>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,fontWeight:600,color:"#444",marginBottom:6}}>Biological Sex</div>
        <div style={{display:"flex",gap:8}}>
          {["male","female"].map(s=>(
            <button key={s} onClick={()=>update({fuel:{...fuel,sex:s}})}
              style={{flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${fuel.sex===s?"#F59E0B":"#e8e8e8"}`,background:fuel.sex===s?"#FFFBEB":"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,fontWeight:600,color:fuel.sex===s?"#F59E0B":"#666",cursor:"pointer",textTransform:"capitalize"}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,fontWeight:600,color:"#444",marginBottom:6}}>Goal</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[{k:"lose",l:"Lose fat"},{k:"maintain",l:"Maintain"},{k:"gain",l:"Build muscle"}].map(g=>(
            <button key={g.k} onClick={()=>update({fuel:{...fuel,goal:g.k}})}
              style={{flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${fuel.goal===g.k?"#F59E0B":"#e8e8e8"}`,background:fuel.goal===g.k?"#FFFBEB":"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,fontWeight:600,color:fuel.goal===g.k?"#F59E0B":"#666",cursor:"pointer"}}>
              {g.l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,fontWeight:600,color:"#444",marginBottom:6}}>Activity Level</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[
            {k:"sedentary",l:"Sedentary — desk job, little exercise"},
            {k:"light",l:"Light — exercise 1-3 days/week"},
            {k:"moderate",l:"Moderate — exercise 3-5 days/week"},
            {k:"active",l:"Active — exercise 6-7 days/week"},
            {k:"very_active",l:"Very active — physical job + training"},
          ].map(a=>(
            <button key={a.k} onClick={()=>update({fuel:{...fuel,activity:a.k}})}
              style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`1.5px solid ${fuel.activity===a.k?"#F59E0B":"#e8e8e8"}`,background:fuel.activity===a.k?"#FFFBEB":"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:fuel.activity===a.k?"#F59E0B":"#444",cursor:"pointer",textAlign:"left",fontWeight:fuel.activity===a.k?600:400}}>
              {a.l}
            </button>
          ))}
        </div>
      </div>

      <button onClick={saveSetup} style={S.btn("linear-gradient(135deg,#F59E0B,#FBBF24)","0 8px 24px #F59E0B44")}>
        Calculate My Targets →
      </button>
    </div>
  );

  // ── LOG MEAL SCREEN ──
  if (view==="log") return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>{setView("dashboard");setLogSearch("");}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>←</button>
        <h3 style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f"}}>Log a Meal</h3>
      </div>

      <input value={logSearch} onChange={e=>setLogSearch(e.target.value)} placeholder="Search food..." style={{...S.input,padding:"12px 16px"}}/>

      {/* Food presets */}
      <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:340,overflowY:"auto"}}>
        {MEAL_PRESETS.filter(m=>!logSearch||m.name.toLowerCase().includes(logSearch.toLowerCase())).map((meal,i)=>(
          <button key={i} onClick={()=>addMeal(meal)}
            style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:14,border:"1.5px solid #f0f0f0",background:"white",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
            <span style={{fontSize:24,flexShrink:0}}>{meal.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:"#0f0f0f"}}>{meal.name}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>{meal.unit} · {meal.cal} kcal · P:{meal.protein}g · C:{meal.carbs}g · F:{meal.fat}g · Fiber:{meal.fiber||0}g</div>
            </div>
            <span style={{color:"#10B981",fontSize:18}}>+</span>
          </button>
        ))}
      </div>

      {/* Custom meal */}
      <div style={{...S.card,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#444"}}>✏️ Add custom meal</div>
        <input value={customMeal.name} onChange={e=>setCustomMeal(m=>({...m,name:e.target.value}))} placeholder="Meal name" style={{...S.input,padding:"10px 14px",fontSize:13}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[{k:"cal",l:"Calories"},{k:"protein",l:"Protein (g)"},{k:"carbs",l:"Carbs (g)"},{k:"fat",l:"Fat (g)"},{k:"fiber",l:"Fiber (g)"}].map(f=>(
            <div key={f.k}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#aaa",marginBottom:3}}>{f.l}</div>
              <input type="number" value={customMeal[f.k]} onChange={e=>setCustomMeal(m=>({...m,[f.k]:e.target.value}))} placeholder="0" style={{...S.input,padding:"8px 12px",fontSize:13}}/>
            </div>
          ))}
        </div>
        <button onClick={()=>{
          if(!customMeal.name) return;
          addMeal({name:customMeal.name,emoji:"🍽️",cal:parseInt(customMeal.cal)||0,protein:parseInt(customMeal.protein)||0,carbs:parseInt(customMeal.carbs)||0,fat:parseInt(customMeal.fat)||0,fiber:parseInt(customMeal.fiber)||0,unit:"custom"});
          setCustomMeal({name:"",cal:"",protein:"",carbs:"",fat:"",fiber:""});
        }} style={{...S.btn("linear-gradient(135deg,#F59E0B,#FBBF24)"),padding:"11px"}}>
          Add Meal
        </button>
      </div>
    </div>
  );

  // ── PHOTO SCREEN ──
  if (view==="photo") return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>{setView("dashboard");setPhotoResult(null);}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>←</button>
        <h3 style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f"}}>Analyse My Meal</h3>
      </div>
      <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",lineHeight:1.6}}>Take a photo of your meal — AI will identify the food and estimate the macros.</p>

      <label style={{...S.btn("linear-gradient(135deg,#F59E0B,#FBBF24)","0 8px 24px #F59E0B44"),display:"block",textAlign:"center",cursor:"pointer"}}>
        📸 Take or Choose Photo
        <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{display:"none"}}/>
      </label>

      {photoLoading && (
        <div style={{...S.card,textAlign:"center",padding:"28px"}}>
          <div style={{fontSize:32,marginBottom:8,animation:"float 1.5s ease-in-out infinite"}}>🔍</div>
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888"}}>Analysing your meal...</p>
        </div>
      )}

      {photoResult && !photoResult.error && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{...S.card,border:"1.5px solid #FDE68A"}}>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:18,color:"#0f0f0f",marginBottom:10}}>
              {photoResult.foods?.join(", ") || "Meal detected"}
            </div>
            <MacroBar label="Calories" val={photoResult.calories||0} target={targets.calories} color="#F59E0B" unit=" kcal"/>
            <MacroBar label="Protein"  val={photoResult.protein||0}  target={targets.protein}  color="#10B981"/>
            <MacroBar label="Carbs"    val={photoResult.carbs||0}    target={targets.carbs}    color="#0EA5E9"/>
            <MacroBar label="Fat"      val={photoResult.fat||0}      target={targets.fat}      color="#8B5CF6"/>
          </div>
          {photoResult.insight && (
            <div style={{background:"linear-gradient(135deg,#FFFBEB,white)",borderRadius:16,padding:"14px 16px",border:"1px solid #FDE68A"}}>
              <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#92400E",lineHeight:1.7}}>{photoResult.insight}</p>
            </div>
          )}
          <button onClick={()=>{
            addMeal({
              name: photoResult.foods?.join(", ")||"Photo meal",
              emoji:"📸",
              cal:photoResult.calories||0,
              protein:photoResult.protein||0,
              carbs:photoResult.carbs||0,
              fat:photoResult.fat||0,
              unit:"photo"
            });
            setPhotoResult(null);
            setView("dashboard");
          }} style={S.btn("linear-gradient(135deg,#F59E0B,#FBBF24)","0 8px 24px #F59E0B44")}>
            ✓ Add to Today's Log
          </button>
        </div>
      )}

      {photoResult?.error && (
        <div style={{...S.card,border:"1.5px solid #fee2e2"}}>
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#ef4444"}}>{photoResult.error}</p>
        </div>
      )}
    </div>
  );

  // ── DASHBOARD ──
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:24,color:"#0f0f0f"}}>⚡ Fuel</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>Today's nutrition</div>
        </div>
        <button onClick={()=>setView("setup")} style={{background:"#FFFBEB",border:"1.5px solid #FDE68A",borderRadius:10,padding:"7px 12px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:600,color:"#F59E0B",cursor:"pointer"}}>
          ⚙️ Targets
        </button>
      </div>

      {/* Today's Fuel habit connection */}
      {fuelHabit && (()=>{
        const ha = analyzeFuelHabit();
        return (
          <div style={{background:ha?.met?"linear-gradient(135deg,#ECFDF5,white)":"linear-gradient(135deg,#FFFBEB,white)",borderRadius:16,padding:"14px 16px",border:`1.5px solid ${ha?.met?"#A7F3D0":"#FDE68A"}`}}>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Today's Fuel Habit</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#0f0f0f",lineHeight:1.5,marginBottom:8,fontStyle:"italic"}}>"{fuelHabit}"</div>
            {ha && (
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontSize:16}}>{ha.met?"✅":"🎯"}</div>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:ha.met?"#10B981":"#F59E0B",fontWeight:600}}>
                  {ha.actual} — {ha.met ? "Habit goal met!" : `Goal: ${ha.goal}`}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Calories ring */}
      <div style={{...S.card,display:"flex",alignItems:"center",gap:16,border:"1.5px solid #FDE68A"}}>
        <div style={{position:"relative",width:80,height:80,flexShrink:0}}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#FDE68A" strokeWidth="6"/>
            <circle cx="40" cy="40" r="32" fill="none" stroke="#F59E0B" strokeWidth="6"
              strokeDasharray={`${201*pct(totals.cal,targets.calories)/100} 201`}
              strokeLinecap="round" transform="rotate(-90 40 40)"
              style={{transition:"stroke-dasharray 0.6s ease"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:16,color:"#0f0f0f",lineHeight:1}}>{totals.cal}</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:8,color:"#aaa"}}>kcal</div>
          </div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:14,color:"#0f0f0f",marginBottom:2}}>
            {remaining(totals.cal,targets.calories)} kcal remaining
          </div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",marginBottom:10}}>
            Goal: {targets.calories} kcal
          </div>
          <div style={{display:"flex",gap:10}}>
            {[
              {l:"Protein",v:totals.protein,t:targets.protein,c:"#10B981"},
              {l:"Carbs",  v:totals.carbs,  t:targets.carbs,  c:"#0EA5E9"},
              {l:"Fat",    v:totals.fat,    t:targets.fat,    c:"#8B5CF6"},
              {l:"Fiber",  v:totals.fiber,  t:targets.fiber||28, c:"#F97316"},
            ].map(m=>(
              <div key={m.l} style={{textAlign:"center"}}>
                <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:14,color:m.c}}>{m.v}g</div>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Water tracker */}
      <div style={{...S.card}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f"}}>💧 Water</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#0EA5E9",fontWeight:600}}>{waterToday} / 8 glasses</div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {Array.from({length:8},(_,i)=>(
            <div key={i} style={{flex:1,height:24,borderRadius:6,background:i<waterToday?"#0EA5E9":"#f0f0f0",transition:"all 0.3s"}}/>
          ))}
        </div>
        <button onClick={addWater} style={{...S.btn("linear-gradient(135deg,#0EA5E9,#38BDF8)","0 4px 12px #0EA5E944"),padding:"10px"}}>
          + Add Glass
        </button>
      </div>

      {/* Action buttons */}
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>setView("log")} style={{...S.btn("linear-gradient(135deg,#F59E0B,#FBBF24)","0 6px 18px #F59E0B44"),flex:2,padding:"13px",fontSize:13}}>
          🍽️ Log a Meal
        </button>
        <button onClick={()=>setView("photo")} style={{...S.btn("linear-gradient(135deg,#10B981,#34D399)","0 6px 18px #10B98144"),flex:1,padding:"13px",fontSize:13}}>
          📸 Photo
        </button>
      </div>

      {/* Today's meals */}
      {todayMeals.length > 0 && (
        <div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Today's meals</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {todayMeals.map((meal,i)=>(
              <div key={i} style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"12px 14px"}}>
                <span style={{fontSize:22}}>{meal.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:"#0f0f0f"}}>{meal.name}</div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>{meal.time} · {meal.cal} kcal · P:{meal.protein}g</div>
                </div>
                <button onClick={()=>{
                  const newMeals = (fuel.meals||[]).filter((_,idx)=>{
                    const todayIdx = (fuel.meals||[]).filter(m=>m.date===today).indexOf(meal);
                    return !(_.date===today && (fuel.meals||[]).filter(m=>m.date===today).indexOf(_)===todayIdx);
                  });
                  update({fuel:{...fuel,meals:newMeals}});
                }} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#ddd"}}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayMeals.length===0 && (
        <div style={{textAlign:"center",padding:"20px",color:"#bbb"}}>
          <div style={{fontSize:32,marginBottom:8}}>🍽️</div>
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,lineHeight:1.6}}>No meals logged yet today.<br/>Tap Log a Meal or take a photo.</p>
        </div>
      )}



      {/* Daily summary */}
      {todayMeals.length > 0 && (
        <div style={{background:"linear-gradient(135deg,#FFFBEB,white)",borderRadius:16,padding:"16px",border:"1px solid #FDE68A"}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#92400E",marginBottom:10}}>Today's summary</div>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            {[
              {l:"Calories",v:totals.cal,t:targets.calories,u:"kcal",c:"#F59E0B"},
              {l:"Protein", v:totals.protein,t:targets.protein,u:"g",c:"#10B981"},
              {l:"Carbs",   v:totals.carbs,t:targets.carbs,u:"g",c:"#0EA5E9"},
              {l:"Fat",     v:totals.fat,t:targets.fat,u:"g",c:"#8B5CF6"},
              {l:"Fiber",   v:totals.fiber,t:targets.fiber||28,u:"g",c:"#F97316"},
            ].map(m=>(
              <div key={m.l} style={{flex:1,textAlign:"center"}}>
                <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:14,color:m.c}}>{Math.round((m.v/m.t)*100)}%</div>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#92400E",lineHeight:1.6,fontStyle:"italic"}}>
            {totals.protein >= targets.protein && totals.fiber >= (targets.fiber||28)
              ? "🎯 Protein and fiber targets reached! Your Fuel habit is working."
              : totals.protein >= targets.protein
              ? `🟢 Protein done! Still need ${(targets.fiber||28) - totals.fiber}g fiber — add vegetables or legumes.`
              : totals.fiber >= (targets.fiber||28)
              ? `🟢 Fiber done! Still need ${targets.protein - totals.protein}g protein today.`
              : `${targets.protein - totals.protein}g protein and ${(targets.fiber||28) - totals.fiber}g fiber remaining today.`}
          </div>
        </div>
      )}

      {/* AI Insight — connected to habit + meal data */}
      <div style={{...S.card,border:"1.5px solid #DDD6FE",background:"linear-gradient(135deg,#F5F3FF,white)"}}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#6D28D9",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🤖 AI Fuel Coach</div>
        {fuelInsight ? (
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.75,fontStyle:"italic",marginBottom:12}}>"{fuelInsight}"</p>
        ) : (
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",lineHeight:1.6,marginBottom:10}}>
            Log your meals first — then get a personalised insight based on your habit and nutrition data.
          </p>
        )}
        <button onClick={getFuelAIInsight} disabled={insightLoading||todayMeals.length===0}
          style={{...S.btn("linear-gradient(135deg,#8B5CF6,#A78BFA)","0 4px 12px #8B5CF644"),padding:"11px",fontSize:13,opacity:(insightLoading||todayMeals.length===0)?0.5:1}}>
          {insightLoading ? "Thinking..." : todayMeals.length===0 ? "Log meals first to unlock" : fuelInsight ? "Get New Insight →" : "Analyse My Fuel Day →"}
        </button>
      </div>

      {/* Back to habits */}
      {goToHabits && (
        <button onClick={goToHabits} style={{...S.btn(),marginTop:4}}>
          ← Back to Habits
        </button>
      )}

      {/* Setup prompt if not set up */}
      {!fuel.setup && (
        <div style={{background:"linear-gradient(135deg,#FFFBEB,white)",borderRadius:16,padding:"16px",border:"1px solid #FDE68A"}}>
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#92400E",lineHeight:1.6,marginBottom:10}}>
            Set up your nutrition targets for personalised macro tracking based on your body and goals.
          </p>
          <button onClick={()=>setView("setup")} style={{...S.btn("linear-gradient(135deg,#F59E0B,#FBBF24)"),padding:"11px",fontSize:13}}>
            Set Up My Targets →
          </button>
        </div>
      )}
    </div>
  );
}


// ── MOVE LAYER COMPONENT ─────────────────────────────────
function MoveLayer({ st, update, S, moveHabit, fetchAIInsight, goToHabits, buildRungContext }) {
  const [moveInsight, setMoveInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [stepInput, setStepInput] = useState("");

  const move = st.move || {};
  const today = new Date().toISOString().slice(0,10);
  const stepGoal = move.stepGoal || 7000;
  const stepsToday = move.stepsDate===today ? (move.stepsToday||0) : 0;
  const todayWorkouts = (move.workouts||[]).filter(w=>w.date===today);

  // Total minutes moved today
  const totalMinutes = todayWorkouts.reduce((acc,w)=>acc+(parseInt(w.duration)||0),0);
  const stepPct = Math.min(100, Math.round((stepsToday/stepGoal)*100));

  // Analyse habit vs tracking
  const analyzeMovement = () => {
    if (!moveHabit) return null;
    const habit = moveHabit.toLowerCase();
    if (habit.includes("push-up") || habit.includes("pushup")) {
      const done = todayWorkouts.some(w=>w.name.toLowerCase().includes("push"));
      return { goal:"Do push-ups today", actual: done?"Push-ups logged ✓":"Not logged yet", met:done };
    } else if (habit.includes("walk") || habit.includes("steps")) {
      const target = habit.includes("10000")?10000:7000;
      return { goal:`${target.toLocaleString()} steps`, actual:`${stepsToday.toLocaleString()} steps`, met:stepsToday>=target };
    } else if (habit.includes("stair")) {
      const done = todayWorkouts.some(w=>w.name.toLowerCase().includes("stair"));
      return { goal:"Take stairs today", actual:done?"Logged ✓":"Not logged yet", met:done };
    } else if (habit.includes("workout") || habit.includes("exercise") || habit.includes("hiit")) {
      return { goal:"Complete a workout", actual:todayWorkouts.length>0?`${todayWorkouts.length} workout(s) logged`:"No workout logged", met:todayWorkouts.length>0 };
    } else if (habit.includes("yoga") || habit.includes("stretch")) {
      const done = todayWorkouts.some(w=>["yoga","stretch"].some(k=>w.name.toLowerCase().includes(k)));
      return { goal:"Yoga or stretching", actual:done?"Logged ✓":"Not logged yet", met:done };
    } else if (habit.includes("minute") || habit.includes("min")) {
      const match = moveHabit.match(/(\d+)/);
      const target = match ? parseInt(match[1]) : 20;
      return { goal:`${target} minutes of movement`, actual:`${totalMinutes} minutes logged`, met:totalMinutes>=target };
    }
    return { goal:moveHabit, actual:todayWorkouts.length>0?`${todayWorkouts.length} activity logged`:"No activity logged", met:todayWorkouts.length>0 };
  };

  const addWorkout = (workout) => {
    const newWorkouts = [...(move.workouts||[]), {...workout, date:today, time:new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}];
    update({move:{...move, workouts:newWorkouts.slice(-50)}});
    setView("dashboard");
  };

  const getMoveInsight = async () => {
    if (!fetchAIInsight) return;
    setInsightLoading(true);
    const ha = analyzeMovement();
    const rungCtx = buildRungContext ? buildRungContext("move") : {};
    const context = JSON.stringify({
      habit: moveHabit,
      steps_today: stepsToday,
      step_goal: stepGoal,
      steps_pct: stepPct,
      workouts_logged: todayWorkouts.length,
      workout_names: todayWorkouts.map(w=>w.name).join(", "),
      total_minutes: totalMinutes,
      habit_met: ha?.met,
      ...rungCtx,
    });
    const insight = await fetchAIInsight("move_insight", context);
    setMoveInsight(insight || "Every step counts. Keep moving — your body notices even when your mind doesn't.");
    setInsightLoading(false);
  };

  // ── LOG WORKOUT ──
  if (view==="log") return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setView("dashboard")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>←</button>
        <h3 style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f"}}>Log a Workout</h3>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:380,overflowY:"auto"}}>
        {WORKOUT_PRESETS.map((w,i)=>(
          <button key={i} onClick={()=>{
            addWorkout({name:w.name,emoji:w.emoji,duration:20,sets:3,unit:w.unit,calories:Math.round(w.met*20*0.25)});
          }} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:14,border:"1.5px solid #f0f0f0",background:"white",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
            <span style={{fontSize:24,flexShrink:0}}>{w.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:"#0f0f0f"}}>{w.name}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>Tap to log · adjust duration after</div>
            </div>
            <span style={{color:"#10B981",fontSize:18}}>+</span>
          </button>
        ))}
      </div>

      <div style={{...S.card,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#444"}}>✏️ Custom activity</div>
        <input value={customWorkout.name} onChange={e=>setCustomWorkout(w=>({...w,name:e.target.value}))} placeholder="Activity name" style={{...S.input,padding:"10px 14px",fontSize:13}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#aaa",marginBottom:3}}>Duration (min)</div>
            <input type="number" value={customWorkout.duration} onChange={e=>setCustomWorkout(w=>({...w,duration:e.target.value}))} placeholder="20" style={{...S.input,padding:"8px 12px",fontSize:13}}/>
          </div>
          <div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#aaa",marginBottom:3}}>Sets (optional)</div>
            <input type="number" value={customWorkout.sets} onChange={e=>setCustomWorkout(w=>({...w,sets:e.target.value}))} placeholder="3" style={{...S.input,padding:"8px 12px",fontSize:13}}/>
          </div>
        </div>
        <button onClick={()=>{
          if(!customWorkout.name) return;
          addWorkout({name:customWorkout.name,emoji:"🏃",duration:parseInt(customWorkout.duration)||20,sets:parseInt(customWorkout.sets)||0,unit:"min",calories:0});
          setCustomWorkout({name:"",duration:"",sets:"",unit:"min"});
        }} style={{...S.btn("linear-gradient(135deg,#10B981,#34D399)"),padding:"11px"}}>
          Add Activity
        </button>
      </div>
    </div>
  );

  // ── STEPS SCREEN ──
  if (view==="steps") return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setView("dashboard")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>←</button>
        <h3 style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f"}}>Log Steps</h3>
      </div>
      <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",lineHeight:1.6}}>Enter your step count from your phone health app or pedometer.</p>

      <div style={{...S.card,textAlign:"center",padding:"28px"}}>
        <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:64,color:"#10B981",lineHeight:1}}>{stepsToday.toLocaleString()}</div>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa",marginTop:4}}>steps today</div>
        <div style={{background:"#f0f0f0",borderRadius:8,height:8,overflow:"hidden",margin:"16px 0"}}>
          <div style={{height:"100%",borderRadius:8,background:"linear-gradient(90deg,#10B981,#34D399)",width:`${stepPct}%`,transition:"width 0.6s ease"}}/>
        </div>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>{stepGoal.toLocaleString()} step goal · {stepPct}%</div>
      </div>

      <input type="number" value={stepInput} onChange={e=>setStepInput(e.target.value)} placeholder="Enter your steps e.g. 4500" style={{...S.input,padding:"14px 18px",fontSize:18,textAlign:"center"}}/>

      <div style={{display:"flex",gap:8}}>
        {[2000,5000,7000,10000].map(n=>(
          <button key={n} onClick={()=>setStepInput(String(n))} style={{flex:1,padding:"10px",borderRadius:12,border:`1.5px solid ${stepInput===String(n)?"#10B981":"#e8e8e8"}`,background:stepInput===String(n)?"#ECFDF5":"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,fontWeight:600,color:stepInput===String(n)?"#10B981":"#666",cursor:"pointer"}}>
            {(n/1000).toFixed(0)}k
          </button>
        ))}
      </div>

      <button onClick={()=>{
        if(!stepInput) return;
        update({move:{...move,stepsToday:parseInt(stepInput),stepsDate:today}});
        setStepInput("");
        setView("dashboard");
      }} style={S.btn("linear-gradient(135deg,#10B981,#34D399)","0 8px 24px #10B98144")}>
        Save Steps →
      </button>

      <div>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Step goal</div>
        <div style={{display:"flex",gap:8}}>
          {[5000,7000,8000,10000].map(n=>(
            <button key={n} onClick={()=>update({move:{...move,stepGoal:n}})} style={{flex:1,padding:"10px",borderRadius:12,border:`1.5px solid ${stepGoal===n?"#10B981":"#e8e8e8"}`,background:stepGoal===n?"#ECFDF5":"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:600,color:stepGoal===n?"#10B981":"#666",cursor:"pointer"}}>
              {(n/1000).toFixed(0)}k
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD ──
  const ha = analyzeMovement();
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:24,color:"#0f0f0f"}}>💪 Move</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>Today's movement</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:28,color:"#10B981",lineHeight:1}}>{totalMinutes}</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:1}}>min active</div>
        </div>
      </div>

      {/* Move habit connection */}
      {moveHabit && (
        <div style={{background:ha?.met?"linear-gradient(135deg,#ECFDF5,white)":"linear-gradient(135deg,#F0FDF4,white)",borderRadius:16,padding:"14px 16px",border:`1.5px solid ${ha?.met?"#A7F3D0":"#D1FAE5"}`}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Today's Move Habit</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#0f0f0f",lineHeight:1.5,marginBottom:8,fontStyle:"italic"}}>"{moveHabit}"</div>
          {ha && (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:16}}>{ha.met?"✅":"🎯"}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:ha.met?"#10B981":"#F59E0B",fontWeight:600}}>
                {ha.actual} — {ha.met?"Habit goal met!":ha.goal}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step tracker */}
      <div style={{...S.card,border:"1.5px solid #A7F3D0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f"}}>👟 Steps</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#10B981",fontWeight:600}}>{stepsToday.toLocaleString()} / {stepGoal.toLocaleString()}</div>
        </div>
        <div style={{background:"#f0f0f0",borderRadius:8,height:10,overflow:"hidden",marginBottom:10}}>
          <div style={{height:"100%",borderRadius:8,background:"linear-gradient(90deg,#10B981,#34D399)",width:`${stepPct}%`,transition:"width 0.6s ease"}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setView("steps")} style={{...S.btn("linear-gradient(135deg,#10B981,#34D399)","0 4px 12px #10B98144"),flex:1,padding:"10px",fontSize:13}}>
            👟 Log Steps
          </button>
          {stepsToday>=stepGoal&&<div style={{display:"flex",alignItems:"center",padding:"0 12px",fontSize:20}}>🎉</div>}
        </div>
      </div>

      {/* Action buttons */}
      <button onClick={()=>setView("log")} style={{...S.btn("linear-gradient(135deg,#10B981,#34D399)","0 6px 18px #10B98144"),padding:"14px",fontSize:14}}>
        🏃 Log a Workout
      </button>

      {/* Today's workouts */}
      {todayWorkouts.length>0&&(
        <div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Today's workouts</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {todayWorkouts.map((w,i)=>(
              <div key={i} style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"12px 14px",border:"1.5px solid #A7F3D0"}}>
                <span style={{fontSize:22}}>{w.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:"#0f0f0f"}}>{w.name}</div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>
                    {w.time} · {w.duration} min{w.sets?` · ${w.sets} sets`:""}
                    {w.calories?` · ~${w.calories} kcal`:""}
                  </div>
                </div>
                <button onClick={()=>{
                  const newWorkouts=(move.workouts||[]).filter((_,idx)=>idx!==((move.workouts||[]).indexOf(w)));
                  update({move:{...move,workouts:newWorkouts}});
                }} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#ddd"}}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayWorkouts.length===0&&stepsToday===0&&(
        <div style={{textAlign:"center",padding:"20px",color:"#bbb"}}>
          <div style={{fontSize:32,marginBottom:8}}>🏃</div>
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,lineHeight:1.6}}>No movement logged yet.<br/>Log steps or a workout to track your progress.</p>
        </div>
      )}

      {/* Daily summary */}
      {(todayWorkouts.length>0||stepsToday>0)&&(
        <div style={{background:"linear-gradient(135deg,#ECFDF5,white)",borderRadius:16,padding:"16px",border:"1px solid #A7F3D0"}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#065F46",marginBottom:10}}>Today's movement summary</div>
          <div style={{display:"flex",gap:12}}>
            {[
              {l:"Steps",v:`${stepPct}%`,c:"#10B981"},
              {l:"Active min",v:totalMinutes,c:"#10B981"},
              {l:"Workouts",v:todayWorkouts.length,c:"#10B981"},
            ].map(m=>(
              <div key={m.l} style={{flex:1,textAlign:"center"}}>
                <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:18,color:m.c}}>{m.v}</div>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Move Coach */}
      <div style={{...S.card,border:"1.5px solid #A7F3D0",background:"linear-gradient(135deg,#ECFDF5,white)"}}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#065F46",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🤖 AI Move Coach</div>
        {moveInsight?(
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.75,fontStyle:"italic",marginBottom:12}}>"{moveInsight}"</p>
        ):(
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",lineHeight:1.6,marginBottom:10}}>
            Log steps or a workout — then get a personalised coaching insight.
          </p>
        )}
        <button onClick={getMoveInsight} disabled={insightLoading||(todayWorkouts.length===0&&stepsToday===0)}
          style={{...S.btn("linear-gradient(135deg,#10B981,#34D399)","0 4px 12px #10B98144"),padding:"11px",fontSize:13,opacity:(insightLoading||(todayWorkouts.length===0&&stepsToday===0))?0.5:1}}>
          {insightLoading?"Thinking...":todayWorkouts.length===0&&stepsToday===0?"Log movement first to unlock":moveInsight?"Get New Insight →":"Analyse My Move Day →"}
        </button>
      </div>

      {goToHabits&&(
        <button onClick={goToHabits} style={{...S.btn(),marginTop:4}}>← Back to Habits</button>
      )}
    </div>
  );
}


// ── REST LAYER COMPONENT ──────────────────────────────────
const WIND_DOWN_ITEMS = [
  { id:"phone",    emoji:"📵", label:"Phone in another room" },
  { id:"screens",  emoji:"🖥️", label:"All screens off 30 min before bed" },
  { id:"dim",      emoji:"💡", label:"Dimmed lights in the evening" },
  { id:"caffeine", emoji:"☕", label:"No caffeine after 2pm" },
  { id:"temp",     emoji:"🌡️", label:"Bedroom cool and dark" },
  { id:"journal",  emoji:"📓", label:"Wrote tomorrow's top task" },
  { id:"breathe",  emoji:"🌬️", label:"Did a breathing exercise" },
  { id:"read",     emoji:"📖", label:"Read a book instead of scrolling" },
];

function RestLayer({ st, update, S, restHabit, fetchAIInsight, goToHabits, buildRungContext }) {
  const [view, setView] = useState("dashboard");
  const [restInsight, setRestInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [wakeTime, setWakeTime] = useState("");

  const rest = st.rest || {};
  const windDone = rest.windDown || [];
  const windPct = Math.round((windDone.length / WIND_DOWN_ITEMS.length) * 100);

  // Calculate sleep hours
  const calcSleepHours = (bed, wake) => {
    if (!bed || !wake) return 0;
    const [bh, bm] = bed.split(":").map(Number);
    const [wh, wm] = wake.split(":").map(Number);
    let hours = wh - bh + (wm - bm) / 60;
    if (hours < 0) hours += 24;
    return Math.round(hours * 10) / 10;
  };

  const sleepHours = calcSleepHours(rest.bedtime, rest.wakeTime);
  const sleepScore = () => {
    if (!sleepHours) return 0;
    let score = 0;
    if (sleepHours >= 7 && sleepHours <= 9) score += 40;
    else if (sleepHours >= 6) score += 25;
    else score += 10;
    score += (rest.quality || 0) * 8;
    score += Math.round(windDone.length * 2.5);
    return Math.min(100, score);
  };

  const score = sleepScore();
  const scoreColor = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  const scoreLabel = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs work";

  const analyzeRest = () => {
    if (!restHabit) return null;
    const habit = restHabit.toLowerCase();
    if (habit.includes("phone") || habit.includes("screen")) {
      const done = windDone.includes("phone") || windDone.includes("screens");
      return { goal:"No screens before bed", actual: done ? "Done ✓" : "Not done yet", met: done };
    } else if (habit.includes("bed") && (habit.includes("time") || habit.includes("same"))) {
      const done = !!rest.bedtime;
      return { goal:"Consistent bedtime", actual: done ? `Logged: ${rest.bedtime}` : "Not logged", met: done };
    } else if (habit.includes("wake") || habit.includes("morning")) {
      const done = !!rest.wakeTime;
      return { goal:"Consistent wake time", actual: done ? `Woke at: ${rest.wakeTime}` : "Not logged", met: done };
    } else if (habit.includes("7") || habit.includes("8") || habit.includes("hour")) {
      const target = habit.includes("8") ? 8 : 7;
      return { goal:`${target}+ hours sleep`, actual: sleepHours ? `${sleepHours} hours` : "Not tracked", met: sleepHours >= target };
    } else if (habit.includes("wind") || habit.includes("routine")) {
      return { goal:"Wind-down routine", actual: `${windDone.length}/${WIND_DOWN_ITEMS.length} done`, met: windDone.length >= 4 };
    }
    return { goal: restHabit, actual: sleepHours ? `${sleepHours}h sleep` : "Not tracked", met: sleepHours >= 7 };
  };

  const getRestInsight = async () => {
    if (!fetchAIInsight) return;
    setInsightLoading(true);
    const ha = analyzeRest();
    const rungCtx = buildRungContext ? buildRungContext("rest") : {};
    const context = JSON.stringify({
      habit: restHabit,
      sleep_hours: sleepHours,
      sleep_quality: rest.quality,
      sleep_score: score,
      wind_down_completed: windDone.length,
      wind_down_total: WIND_DOWN_ITEMS.length,
      bedtime: rest.bedtime,
      wake_time: rest.wakeTime,
      habit_met: ha?.met,
      ...rungCtx,
    });
    const insight = await fetchAIInsight("rest_insight", context);
    setRestInsight(insight || "Quality sleep is the foundation of everything. Protect it tonight.");
    setInsightLoading(false);
  };

  const ha = analyzeRest();

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:24,color:"#0f0f0f"}}>😴 Rest</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>Sleep tracking & wind-down</div>
        </div>
        {score > 0 && (
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:28,color:scoreColor,lineHeight:1}}>{score}</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:1}}>{scoreLabel}</div>
          </div>
        )}
      </div>

      {/* Rest habit connection */}
      {restHabit && (
        <div style={{background:ha?.met?"linear-gradient(135deg,#F5F3FF,white)":"linear-gradient(135deg,#FAF5FF,white)",borderRadius:16,padding:"14px 16px",border:`1.5px solid ${ha?.met?"#DDD6FE":"#EDE9FE"}`}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Today's Rest Habit</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#0f0f0f",lineHeight:1.5,marginBottom:8,fontStyle:"italic"}}>"{restHabit}"</div>
          {ha && (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:16}}>{ha.met?"✅":"🎯"}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:ha.met?"#8B5CF6":"#F59E0B",fontWeight:600}}>
                {ha.actual} — {ha.met?"Habit goal met!":ha.goal}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sleep tracker */}
      <div style={{...S.card,border:"1.5px solid #DDD6FE"}}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f",marginBottom:12}}>🌙 Last Night's Sleep</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa",marginBottom:6}}>Bedtime</div>
            <input type="time" value={rest.bedtime||""} onChange={e=>update({rest:{...rest,bedtime:e.target.value}})}
              style={{...S.input,padding:"10px 12px",fontSize:15,textAlign:"center"}}/>
          </div>
          <div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa",marginBottom:6}}>Wake time</div>
            <input type="time" value={rest.wakeTime||""} onChange={e=>update({rest:{...rest,wakeTime:e.target.value}})}
              style={{...S.input,padding:"10px 12px",fontSize:15,textAlign:"center"}}/>
          </div>
        </div>
        {sleepHours > 0 && (
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px",background:"#F5F3FF",borderRadius:12,marginBottom:12}}>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:32,color:"#8B5CF6",lineHeight:1}}>{sleepHours}h</div>
            <div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:"#0f0f0f"}}>
                {sleepHours >= 8 ? "Excellent sleep! 🌟" : sleepHours >= 7 ? "Good sleep ✅" : sleepHours >= 6 ? "Fair — aim for 7+ hours" : "Too little sleep ⚠️"}
              </div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa",marginTop:2}}>
                {sleepHours >= 7 ? "Your brain is recharged" : "Try an earlier bedtime tonight"}
              </div>
            </div>
          </div>
        )}
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#666",marginBottom:8}}>Sleep quality</div>
        <div style={{display:"flex",gap:8}}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>update({rest:{...rest,quality:n}})}
              style={{flex:1,padding:"10px",borderRadius:12,border:`1.5px solid ${(rest.quality||0)>=n?"#8B5CF6":"#e8e8e8"}`,background:(rest.quality||0)>=n?"#F5F3FF":"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:16,cursor:"pointer",transition:"all 0.2s"}}>
              {n<=2?"😴":n<=3?"😐":n<=4?"😊":"⭐"}
            </button>
          ))}
        </div>
      </div>

      {/* Wind-down routine */}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f"}}>🌙 Wind-Down Routine</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#8B5CF6",fontWeight:600}}>{windDone.length}/{WIND_DOWN_ITEMS.length}</div>
        </div>
        <div style={{background:"#f0f0f0",borderRadius:6,height:6,overflow:"hidden",marginBottom:12}}>
          <div style={{height:"100%",borderRadius:6,background:"linear-gradient(90deg,#8B5CF6,#A78BFA)",width:`${windPct}%`,transition:"width 0.4s ease"}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {WIND_DOWN_ITEMS.map(item=>{
            const done = windDone.includes(item.id);
            return (
              <button key={item.id} onClick={()=>{
                const newDone = done ? windDone.filter(x=>x!==item.id) : [...windDone, item.id];
                update({rest:{...rest, windDown:newDone}});
              }} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:14,border:`1.5px solid ${done?"#DDD6FE":"#f0f0f0"}`,background:done?"#F5F3FF":"white",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${done?"#8B5CF6":"#ddd"}`,background:done?"#8B5CF6":"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                  {done&&<div style={{color:"white",fontSize:12}}>✓</div>}
                </div>
                <span style={{fontSize:18,flexShrink:0}}>{item.emoji}</span>
                <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:done?"#8B5CF6":"#444",fontWeight:done?600:400,textDecoration:done?"line-through":"none"}}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sleep score breakdown */}
      {score > 0 && (
        <div style={{background:"linear-gradient(135deg,#F5F3FF,white)",borderRadius:16,padding:"16px",border:"1px solid #DDD6FE"}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#6D28D9",marginBottom:10}}>Sleep Score Breakdown</div>
          <div style={{display:"flex",gap:12}}>
            {[
              {l:"Duration",v:sleepHours?`${sleepHours}h`:"—",c:"#8B5CF6"},
              {l:"Quality",v:rest.quality?`${rest.quality}/5`:"—",c:"#8B5CF6"},
              {l:"Routine",v:`${windDone.length}/${WIND_DOWN_ITEMS.length}`,c:"#8B5CF6"},
            ].map(m=>(
              <div key={m.l} style={{flex:1,textAlign:"center"}}>
                <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:16,color:m.c}}>{m.v}</div>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:9,color:"#bbb",textTransform:"uppercase",letterSpacing:0.5}}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Rest Coach */}
      <div style={{...S.card,border:"1.5px solid #DDD6FE",background:"linear-gradient(135deg,#F5F3FF,white)"}}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#6D28D9",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🤖 AI Rest Coach</div>
        {restInsight?(
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.75,fontStyle:"italic",marginBottom:12}}>"{restInsight}"</p>
        ):(
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",lineHeight:1.6,marginBottom:10}}>
            Log your sleep times or complete wind-down items to unlock your personalised insight.
          </p>
        )}
        <button onClick={getRestInsight} disabled={insightLoading||(!sleepHours&&windDone.length===0)}
          style={{...S.btn("linear-gradient(135deg,#8B5CF6,#A78BFA)","0 4px 12px #8B5CF644"),padding:"11px",fontSize:13,opacity:(insightLoading||(!sleepHours&&windDone.length===0))?0.5:1}}>
          {insightLoading?"Thinking...":(!sleepHours&&windDone.length===0)?"Log sleep first to unlock":restInsight?"Get New Insight →":"Analyse My Sleep →"}
        </button>
      </div>

      {goToHabits&&(
        <button onClick={goToHabits} style={{...S.btn(),marginTop:4}}>← Back to Habits</button>
      )}
    </div>
  );
}



// ── CALM LAYER COMPONENT ──────────────────────────────────
const CALM_ACTIVITIES = [
  { id:"breathing",   emoji:"🌬️", label:"4-7-8 Breathing",        desc:"4 in · 7 hold · 8 out",     mins:2,  type:"breath" },
  { id:"box",         emoji:"📦", label:"Box Breathing",           desc:"4 in · 4 hold · 4 out · 4 hold", mins:3, type:"breath" },
  { id:"meditation",  emoji:"🧘", label:"Meditation",              desc:"Sit in stillness",           mins:10, type:"meditate" },
  { id:"gratitude",   emoji:"🙏", label:"Gratitude practice",      desc:"Write 3 things",             mins:3,  type:"journal" },
  { id:"nature",      emoji:"🌿", label:"Time in nature",          desc:"Walk outside, no phone",     mins:10, type:"outdoor" },
  { id:"music",       emoji:"🎵", label:"Calming music",           desc:"Slow, instrumental",         mins:10, type:"relax" },
  { id:"journal",     emoji:"📓", label:"Journaling",              desc:"Write how you feel",         mins:5,  type:"journal" },
  { id:"body_scan",   emoji:"👁️", label:"Body scan",               desc:"Notice tension, release it", mins:5,  type:"meditate" },
  { id:"cold_water",  emoji:"💧", label:"Cold water on face",      desc:"Activates dive reflex",      mins:1,  type:"physical" },
  { id:"stretch",     emoji:"🤸", label:"Gentle stretching",       desc:"Release muscle tension",     mins:5,  type:"physical" },
  { id:"tea",         emoji:"🍵", label:"Herbal tea ritual",       desc:"Slow down, be present",      mins:5,  type:"relax" },
  { id:"sunlight",    emoji:"☀️", label:"Morning sunlight",        desc:"10 min outside",             mins:10, type:"outdoor" },
];

const MOODS = [
  { emoji:"😰", label:"Anxious",  color:"#EF4444" },
  { emoji:"😔", label:"Low",      color:"#6B7280" },
  { emoji:"😐", label:"Neutral",  color:"#F59E0B" },
  { emoji:"🙂", label:"Okay",     color:"#10B981" },
  { emoji:"😊", label:"Good",     color:"#10B981" },
  { emoji:"🌟", label:"Great",    color:"#8B5CF6" },
];

function CalmLayer({ st, update, S, calmHabit, fetchAIInsight, goToHabits, buildRungContext }) {
  const [view, setView] = useState("dashboard");
  const [calmInsight, setCalmInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [gratitudeInput, setGratitudeInput] = useState("");
  const [timer, setTimer] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const calm = st.calm || {};
  const doneFull = calm.calmActivities || [];
  const gratitude = calm.gratitude || [];
  const stressLevel = calm.stressLevel || 0;

  const stressColor = stressLevel >= 8 ? "#EF4444" : stressLevel >= 6 ? "#F59E0B" : stressLevel >= 4 ? "#10B981" : "#8B5CF6";
  const stressLabel = stressLevel >= 8 ? "High stress" : stressLevel >= 6 ? "Moderate" : stressLevel >= 4 ? "Manageable" : stressLevel > 0 ? "Low stress" : "Not rated";

  const analyzeCalm = () => {
    if (!calmHabit) return null;
    const habit = calmHabit.toLowerCase();
    if (habit.includes("breath")) {
      const done = doneFull.includes("breathing") || doneFull.includes("box");
      return { goal:"Breathing exercise", actual: done ? "Done ✓" : "Not done yet", met: done };
    } else if (habit.includes("meditat")) {
      const done = doneFull.includes("meditation") || doneFull.includes("body_scan");
      return { goal:"Meditation", actual: done ? "Done ✓" : "Not done yet", met: done };
    } else if (habit.includes("gratitude") || habit.includes("grateful")) {
      return { goal:"Gratitude practice", actual: gratitude.length > 0 ? `${gratitude.length} entries` : "Not done", met: gratitude.length >= 1 };
    } else if (habit.includes("outside") || habit.includes("nature") || habit.includes("walk")) {
      const done = doneFull.includes("nature") || doneFull.includes("sunlight");
      return { goal:"Time in nature", actual: done ? "Done ✓" : "Not done yet", met: done };
    } else if (habit.includes("journal")) {
      const done = doneFull.includes("journal") || gratitude.length > 0;
      return { goal:"Journaling", actual: done ? "Done ✓" : "Not done yet", met: done };
    }
    return { goal: calmHabit, actual: doneFull.length > 0 ? `${doneFull.length} activity done` : "Nothing done yet", met: doneFull.length > 0 };
  };

  const startTimer = (mins) => {
    setTimerSecs(mins * 60);
    setTimerRunning(true);
    const interval = setInterval(() => {
      setTimerSecs(prev => {
        if (prev <= 1) { clearInterval(interval); setTimerRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    setTimer(interval);
  };

  const formatTime = (secs) => `${Math.floor(secs/60)}:${String(secs%60).padStart(2,"0")}`;

  const getCalmInsight = async () => {
    if (!fetchAIInsight) return;
    setInsightLoading(true);
    const ha = analyzeCalm();
    const rungCtx = buildRungContext ? buildRungContext("calm") : {};
    const context = JSON.stringify({
      habit: calmHabit,
      stress_level: stressLevel,
      mood: calm.mood,
      activities_done: doneFull,
      gratitude_count: gratitude.length,
      habit_met: ha?.met,
      ...rungCtx,
    });
    const insight = await fetchAIInsight("calm_insight", context);
    setCalmInsight(insight || "Calm is not the absence of stress — it is the ability to respond to it with intention.");
    setInsightLoading(false);
  };

  const ha = analyzeCalm();

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:24,color:"#0f0f0f"}}>🧘 Calm</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>Stress · Breathing · Mind</div>
        </div>
        {stressLevel > 0 && (
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:28,color:stressColor,lineHeight:1}}>{stressLevel}/10</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:1}}>{stressLabel}</div>
          </div>
        )}
      </div>

      {/* Calm habit */}
      {calmHabit && (
        <div style={{background:ha?.met?"linear-gradient(135deg,#F0F9FF,white)":"linear-gradient(135deg,#F0F9FF,white)",borderRadius:16,padding:"14px 16px",border:`1.5px solid ${ha?.met?"#BAE6FD":"#BAE6FD"}`}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Today's Calm Habit</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#0f0f0f",lineHeight:1.5,marginBottom:8,fontStyle:"italic"}}>"{calmHabit}"</div>
          {ha && (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:16}}>{ha.met?"✅":"🎯"}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:ha.met?"#0EA5E9":"#F59E0B",fontWeight:600}}>
                {ha.actual} — {ha.met?"Habit goal met!":ha.goal}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stress level */}
      <div style={S.card}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f",marginBottom:10}}>How stressed are you today?</div>
        <div style={{display:"flex",gap:4,marginBottom:8}}>
          {[1,2,3,4,5,6,7,8,9,10].map(n=>(
            <button key={n} onClick={()=>update({calm:{...calm,stressLevel:n}})}
              style={{flex:1,padding:"8px 0",borderRadius:8,border:`1.5px solid ${stressLevel===n?(n>=7?"#EF4444":n>=4?"#F59E0B":"#10B981"):"#e8e8e8"}`,background:stressLevel===n?(n>=7?"#FEF2F2":n>=4?"#FFFBEB":"#ECFDF5"):"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:stressLevel===n?(n>=7?"#EF4444":n>=4?"#F59E0B":"#10B981"):"#aaa",cursor:"pointer",transition:"all 0.2s"}}>
              {n}
            </button>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#bbb"}}>
          <span>Calm</span><span>Very stressed</span>
        </div>
      </div>

      {/* Mood */}
      <div style={S.card}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f",marginBottom:10}}>How are you feeling?</div>
        <div style={{display:"flex",gap:8}}>
          {MOODS.map(m=>(
            <button key={m.label} onClick={()=>update({calm:{...calm,mood:m.label}})}
              style={{flex:1,padding:"10px 4px",borderRadius:12,border:`1.5px solid ${calm.mood===m.label?m.color:"#e8e8e8"}`,background:calm.mood===m.label?m.color+"18":"white",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.2s"}}>
              <span style={{fontSize:20}}>{m.emoji}</span>
              <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:9,color:calm.mood===m.label?m.color:"#aaa",fontWeight:600}}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calm activities */}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f"}}>Calm Activities</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#0EA5E9",fontWeight:600}}>{doneFull.length}/{CALM_ACTIVITIES.length}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {CALM_ACTIVITIES.map(act=>{
            const done = doneFull.includes(act.id);
            return (
              <button key={act.id} onClick={()=>{
                const newDone = done ? doneFull.filter(x=>x!==act.id) : [...doneFull, act.id];
                update({calm:{...calm, calmActivities:newDone}});
                if (!done && (act.type==="breath"||act.type==="meditate")) startTimer(act.mins);
              }} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:14,border:`1.5px solid ${done?"#BAE6FD":"#f0f0f0"}`,background:done?"#F0F9FF":"white",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${done?"#0EA5E9":"#ddd"}`,background:done?"#0EA5E9":"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                  {done&&<div style={{color:"white",fontSize:11}}>✓</div>}
                </div>
                <span style={{fontSize:18,flexShrink:0}}>{act.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:done?"#0EA5E9":"#333",fontWeight:done?600:400,textDecoration:done?"line-through":"none"}}>{act.label}</div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#bbb"}}>{act.desc} · {act.mins} min</div>
                </div>
                {(act.type==="breath"||act.type==="meditate")&&!done&&(
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#0EA5E9",background:"#F0F9FF",borderRadius:6,padding:"3px 7px",fontWeight:600}}>▶ Timer</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timer */}
      {timerSecs > 0 && (
        <div style={{...S.card,textAlign:"center",border:"1.5px solid #BAE6FD",background:"linear-gradient(135deg,#F0F9FF,white)"}}>
          <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:56,color:"#0EA5E9",lineHeight:1,marginBottom:8}}>{formatTime(timerSecs)}</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa",marginBottom:12}}>
            {timerRunning ? "Breathe. Be present." : "✅ Done! Well done."}
          </div>
          <button onClick={()=>{clearInterval(timer);setTimerSecs(0);setTimerRunning(false);}}
            style={{...S.btnGhost,padding:"10px",fontSize:12}}>Stop</button>
        </div>
      )}

      {/* Gratitude journal */}
      <div style={S.card}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f",marginBottom:10}}>🙏 Gratitude — 3 things today</div>
        {gratitude.map((g,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}>
            <span style={{color:"#10B981",fontSize:14}}>✓</span>
            <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#444"}}>{g}</span>
          </div>
        ))}
        {gratitude.length < 3 && (
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <input value={gratitudeInput} onChange={e=>setGratitudeInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&gratitudeInput.trim()){update({calm:{...calm,gratitude:[...gratitude,gratitudeInput.trim()]}});setGratitudeInput("");}}}
              placeholder={`I am grateful for...`}
              style={{...S.input,padding:"10px 14px",fontSize:13,flex:1}}/>
            <button onClick={()=>{if(gratitudeInput.trim()){update({calm:{...calm,gratitude:[...gratitude,gratitudeInput.trim()]}});setGratitudeInput("");}}}
              style={{padding:"10px 16px",borderRadius:12,border:"none",background:"#0EA5E9",color:"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,cursor:"pointer"}}>
              Add
            </button>
          </div>
        )}
        {gratitude.length >= 3 && (
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#10B981",marginTop:8,fontWeight:600}}>🎯 Gratitude practice complete!</div>
        )}
      </div>

      {/* AI Calm Coach */}
      <div style={{...S.card,border:"1.5px solid #BAE6FD",background:"linear-gradient(135deg,#F0F9FF,white)"}}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#0369A1",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🤖 AI Calm Coach</div>
        {calmInsight?(
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.75,fontStyle:"italic",marginBottom:12}}>"{calmInsight}"</p>
        ):(
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",lineHeight:1.6,marginBottom:10}}>
            Rate your stress or complete a calm activity to unlock a personalised insight.
          </p>
        )}
        <button onClick={getCalmInsight} disabled={insightLoading||(stressLevel===0&&doneFull.length===0)}
          style={{...S.btn("linear-gradient(135deg,#0EA5E9,#38BDF8)","0 4px 12px #0EA5E944"),padding:"11px",fontSize:13,opacity:(insightLoading||(stressLevel===0&&doneFull.length===0))?0.5:1}}>
          {insightLoading?"Thinking...":stressLevel===0&&doneFull.length===0?"Rate stress first to unlock":calmInsight?"Get New Insight →":"Analyse My Calm Day →"}
        </button>
      </div>

      {goToHabits&&(
        <button onClick={goToHabits} style={{...S.btn(),marginTop:4}}>← Back to Habits</button>
      )}
    </div>
  );
}



// ── CONNECT LAYER COMPONENT ───────────────────────────────
const CONNECTION_TYPES = [
  { id:"text",     emoji:"💬", label:"Text / Message" },
  { id:"call",     emoji:"📞", label:"Phone call" },
  { id:"video",    emoji:"📹", label:"Video call" },
  { id:"inperson", emoji:"🤝", label:"In person" },
  { id:"letter",   emoji:"✉️", label:"Letter / Note" },
  { id:"voice",    emoji:"🎤", label:"Voice message" },
];

const KINDNESS_ACTS = [
  { id:"compliment",  emoji:"💛", label:"Gave a genuine compliment" },
  { id:"listen",      emoji:"👂", label:"Listened without interrupting" },
  { id:"helped",      emoji:"🤲", label:"Helped someone today" },
  { id:"thanked",     emoji:"🙏", label:"Expressed genuine gratitude" },
  { id:"checked_in",  emoji:"💙", label:"Checked in on someone" },
  { id:"remembered",  emoji:"🎂", label:"Remembered something important to them" },
  { id:"encouraged",  emoji:"🌟", label:"Encouraged someone" },
  { id:"apologized",  emoji:"🕊️", label:"Apologised or resolved something" },
];

function ConnectLayer({ st, update, S, connectHabit, fetchAIInsight, goToHabits, buildRungContext }) {
  const [view, setView] = useState("dashboard");
  const [connectInsight, setConnectInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [newConn, setNewConn] = useState({name:"", type:"text", quality:3, note:""});
  const [newRel, setNewRel] = useState({name:"", importance:"close", notes:""});

  const connect = st.connect || {};
  const todayConns = (connect.connections||[]).filter(c=>c.date===today);
  const socialBattery = connect.socialBattery || 0;
  const relationships = connect.relationships || [];

  const batteryColor = socialBattery >= 7 ? "#10B981" : socialBattery >= 4 ? "#F59E0B" : socialBattery > 0 ? "#EF4444" : "#aaa";
  const batteryLabel = socialBattery >= 7 ? "Energised" : socialBattery >= 4 ? "Okay" : socialBattery > 0 ? "Drained" : "Not rated";

  const avgQuality = todayConns.length ? Math.round(todayConns.reduce((a,c)=>a+c.quality,0)/todayConns.length*10)/10 : 0;

  const analyzeConnect = () => {
    if (!connectHabit) return null;
    const habit = connectHabit.toLowerCase();
    if (habit.includes("message") || habit.includes("text")) {
      return { goal:"Send a genuine message", actual: todayConns.length>0?`${todayConns.length} connection(s) logged`:"No connections yet", met: todayConns.length>0 };
    } else if (habit.includes("call")) {
      const called = todayConns.some(c=>c.type==="call"||c.type==="video");
      return { goal:"Make a call", actual: called?"Call logged ✓":"No call yet", met: called };
    } else if (habit.includes("person") || habit.includes("lunch") || habit.includes("dinner")) {
      const met = todayConns.some(c=>c.type==="inperson");
      return { goal:"In-person connection", actual: met?"In-person logged ✓":"Not done yet", met };
    } else if (habit.includes("compliment") || habit.includes("kind")) {
      return { goal:"Act of kindness", actual: kindness.length>0?`${kindness.length} act(s) done`:"None yet", met: kindness.length>0 };
    } else if (habit.includes("thank") || habit.includes("gratitude")) {
      const done = kindness.includes("thanked");
      return { goal:"Express gratitude to someone", actual: done?"Done ✓":"Not done yet", met: done };
    }
    return { goal: connectHabit, actual: todayConns.length>0?`${todayConns.length} connection(s)`:"No connections yet", met: todayConns.length>0 };
  };

  const getConnectInsight = async () => {
    if (!fetchAIInsight) return;
    setInsightLoading(true);
    const ha = analyzeConnect();
    const rungCtx = buildRungContext ? buildRungContext("connect") : {};
    const context = JSON.stringify({
      habit: connectHabit,
      connections_today: todayConns.length,
      connection_types: todayConns.map(c=>c.type),
      avg_quality: avgQuality,
      kindness_done: kindness.length,
      social_battery: socialBattery,
      relationships_tracked: relationships.length,
      habit_met: ha?.met,
      ...rungCtx,
    });
    const insight = await fetchAIInsight("connect_insight", context);
    setConnectInsight(insight || "Every genuine connection you make today is an investment in your health — as powerful as any exercise.");
    setInsightLoading(false);
  };

  const ha = analyzeConnect();

  // ── ADD CONNECTION SCREEN ──
  if (view==="add_connection") return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setView("dashboard")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>←</button>
        <h3 style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f"}}>Log a Connection</h3>
      </div>

      <div>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#666",marginBottom:6}}>Who did you connect with?</div>
        <input value={newConn.name} onChange={e=>setNewConn(c=>({...c,name:e.target.value}))}
          placeholder="Name or relationship (e.g. Mum, Ahmed, colleague)"
          style={{...S.input,padding:"12px 16px"}}/>
      </div>

      <div>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#666",marginBottom:8}}>How did you connect?</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {CONNECTION_TYPES.map(t=>(
            <button key={t.id} onClick={()=>setNewConn(c=>({...c,type:t.id}))}
              style={{padding:"10px",borderRadius:12,border:`1.5px solid ${newConn.type===t.id?"#EC4899":"#e8e8e8"}`,background:newConn.type===t.id?"#FDF2F8":"white",cursor:"pointer",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:newConn.type===t.id?"#EC4899":"#444",display:"flex",alignItems:"center",gap:8}}>
              <span>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#666",marginBottom:6}}>Connection quality</div>
        <div style={{display:"flex",gap:8}}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>setNewConn(c=>({...c,quality:n}))}
              style={{flex:1,padding:"10px",borderRadius:12,border:`1.5px solid ${newConn.quality===n?"#EC4899":"#e8e8e8"}`,background:newConn.quality===n?"#FDF2F8":"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:16,cursor:"pointer"}}>
              {n<=1?"😐":n<=2?"🙂":n<=3?"😊":n<=4?"💙":"💝"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#666",marginBottom:6}}>Note (optional)</div>
        <input value={newConn.note} onChange={e=>setNewConn(c=>({...c,note:e.target.value}))}
          placeholder="What did you talk about?"
          style={{...S.input,padding:"12px 16px"}}/>
      </div>

      <button onClick={()=>{
        if(!newConn.name) return;
        const newConns=[...(connect.connections||[]),{...newConn,date:today,time:new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}];
        update({connect:{...connect,connections:newConns}});
        setNewConn({name:"",type:"text",quality:3,note:""});
        setView("dashboard");
      }} style={S.btn("linear-gradient(135deg,#EC4899,#F472B6)","0 8px 24px #EC489944")}>
        Log Connection →
      </button>
    </div>
  );

  // ── RELATIONSHIPS SCREEN ──
  if (view==="relationships") return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setView("dashboard")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>←</button>
        <h3 style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f"}}>My Relationships</h3>
      </div>
      <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",lineHeight:1.6}}>Track your key relationships — who matters most in your life.</p>

      {relationships.map((rel,i)=>{
        const daysSince = rel.lastContact ? Math.floor((Date.now()-new Date(rel.lastContact))/(1000*60*60*24)) : null;
        const urgency = daysSince===null?"never":daysSince>30?"overdue":daysSince>14?"soon":"recent";
        const urgencyColor = {never:"#EF4444",overdue:"#EF4444",soon:"#F59E0B",recent:"#10B981"}[urgency];
        return (
          <div key={i} style={{...S.card,border:`1.5px solid ${urgencyColor}22`}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#EC4899,#F472B6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"white",fontFamily:"Fraunces,serif",fontWeight:800,flexShrink:0}}>
                {rel.name.charAt(0).toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:14,color:"#0f0f0f"}}>{rel.name}</div>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:urgencyColor,fontWeight:600}}>
                  {daysSince===null?"Never contacted":daysSince===0?"Contacted today":`${daysSince} days ago`}
                </div>
              </div>
              <button onClick={()=>{
                const updated=[...relationships];
                updated[i]={...updated[i],lastContact:today};
                update({connect:{...connect,relationships:updated}});
              }} style={{background:"#FDF2F8",border:"1.5px solid #FBCFE8",borderRadius:10,padding:"6px 12px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:600,color:"#EC4899",cursor:"pointer"}}>
                ✓ Just connected
              </button>
            </div>
            {rel.notes&&<p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#888",marginTop:8,fontStyle:"italic"}}>{rel.notes}</p>}
          </div>
        );
      })}

      <div style={{...S.card,border:"1.5px dashed #FBCFE8"}}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#444",marginBottom:10}}>+ Add relationship to track</div>
        <input value={newRel.name} onChange={e=>setNewRel(r=>({...r,name:e.target.value}))}
          placeholder="Name" style={{...S.input,padding:"10px 14px",fontSize:13,marginBottom:8}}/>
        <input value={newRel.notes} onChange={e=>setNewRel(r=>({...r,notes:e.target.value}))}
          placeholder="Notes (optional)" style={{...S.input,padding:"10px 14px",fontSize:13,marginBottom:8}}/>
        <button onClick={()=>{
          if(!newRel.name) return;
          update({connect:{...connect,relationships:[...relationships,{...newRel,lastContact:null}]}});
          setNewRel({name:"",importance:"close",notes:""});
        }} style={{...S.btn("linear-gradient(135deg,#EC4899,#F472B6)"),padding:"11px",fontSize:13}}>
          Add
        </button>
      </div>
    </div>
  );

  // ── DASHBOARD ──
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:24,color:"#0f0f0f"}}>🤝 Connect</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>Relationships · Kindness · Connection</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:28,color:"#EC4899",lineHeight:1}}>{todayConns.length}</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:1}}>connections</div>
        </div>
      </div>

      {/* Connect habit */}
      {connectHabit && (
        <div style={{background:ha?.met?"linear-gradient(135deg,#FDF2F8,white)":"linear-gradient(135deg,#FDF2F8,white)",borderRadius:16,padding:"14px 16px",border:`1.5px solid ${ha?.met?"#FBCFE8":"#FBCFE8"}`}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Today's Connect Habit</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#0f0f0f",lineHeight:1.5,marginBottom:8,fontStyle:"italic"}}>"{connectHabit}"</div>
          {ha && (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:16}}>{ha.met?"✅":"🎯"}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:ha.met?"#EC4899":"#F59E0B",fontWeight:600}}>
                {ha.actual} — {ha.met?"Habit goal met!":ha.goal}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social battery */}
      <div style={S.card}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f",marginBottom:10}}>🔋 Social Battery — how connected do you feel?</div>
        <div style={{display:"flex",gap:4,marginBottom:6}}>
          {[1,2,3,4,5,6,7,8,9,10].map(n=>(
            <button key={n} onClick={()=>update({connect:{...connect,socialBattery:n}})}
              style={{flex:1,padding:"8px 0",borderRadius:8,border:`1.5px solid ${socialBattery===n?"#EC4899":"#e8e8e8"}`,background:socialBattery===n?"#FDF2F8":"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:socialBattery===n?"#EC4899":"#aaa",cursor:"pointer",transition:"all 0.2s"}}>
              {n}
            </button>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#bbb"}}>
          <span>Isolated</span><span>Energised</span>
        </div>
        {socialBattery>0&&<div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:batteryColor,fontWeight:600,marginTop:8}}>{batteryLabel}</div>}
      </div>

      {/* Log connection button */}
      <button onClick={()=>setView("add_connection")} style={{...S.btn("linear-gradient(135deg,#EC4899,#F472B6)","0 6px 18px #EC489944"),padding:"14px",fontSize:14}}>
        🤝 Log a Connection
      </button>

      {/* Today's connections */}
      {todayConns.length>0&&(
        <div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Today's connections</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {todayConns.map((c,i)=>{
              const ct = CONNECTION_TYPES.find(t=>t.id===c.type);
              return (
                <div key={i} style={{...S.card,display:"flex",alignItems:"center",gap:12,padding:"12px 14px",border:"1.5px solid #FBCFE8"}}>
                  <span style={{fontSize:22}}>{ct?.emoji||"🤝"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:"#0f0f0f"}}>{c.name}</div>
                    <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>{c.time} · {ct?.label} · Quality: {"💙".repeat(c.quality)}</div>
                    {c.note&&<div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#888",fontStyle:"italic",marginTop:2}}>{c.note}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {avgQuality>0&&<div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#EC4899",fontWeight:600,marginTop:8}}>Avg connection quality: {avgQuality}/5</div>}
        </div>
      )}

      {/* Acts of kindness */}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f"}}>💛 Acts of Kindness</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#EC4899",fontWeight:600}}>{kindness.length}/{KINDNESS_ACTS.length}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {KINDNESS_ACTS.map(act=>{
            const done = kindness.includes(act.id);
            return (
              <button key={act.id} onClick={()=>{
                const newK = done ? kindness.filter(k=>k!==act.id) : [...kindness,act.id];
                update({connect:{...connect,kindness:newK}});
              }} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,border:`1.5px solid ${done?"#FBCFE8":"#f0f0f0"}`,background:done?"#FDF2F8":"white",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                <div style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${done?"#EC4899":"#ddd"}`,background:done?"#EC4899":"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {done&&<div style={{color:"white",fontSize:11}}>✓</div>}
                </div>
                <span style={{fontSize:16}}>{act.emoji}</span>
                <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:done?"#EC4899":"#444",fontWeight:done?600:400,textDecoration:done?"line-through":"none"}}>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Relationships */}
      {relationships.length>0&&(
        <div style={{...S.card,border:"1.5px solid #FBCFE8"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f"}}>💝 Relationships to nurture</div>
            <button onClick={()=>setView("relationships")} style={{background:"#FDF2F8",border:"1.5px solid #FBCFE8",borderRadius:8,padding:"4px 10px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:600,color:"#EC4899",cursor:"pointer"}}>Manage</button>
          </div>
          {relationships.slice(0,3).map((rel,i)=>{
            const daysSince = rel.lastContact ? Math.floor((Date.now()-new Date(rel.lastContact))/(1000*60*60*24)) : null;
            const overdue = daysSince===null||daysSince>14;
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#EC4899,#F472B6)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontFamily:"Fraunces,serif",fontWeight:800,fontSize:14,flexShrink:0}}>
                  {rel.name.charAt(0).toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:"#0f0f0f"}}>{rel.name}</div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:overdue?"#EF4444":"#10B981"}}>
                    {daysSince===null?"Reach out soon":daysSince===0?"✓ Connected today":`${daysSince}d ago${overdue?" — reach out!":""}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {relationships.length===0&&(
        <button onClick={()=>setView("relationships")} style={{...S.btnGhost,border:"1.5px dashed #FBCFE8",color:"#EC4899",fontSize:13}}>
          💝 Track your key relationships →
        </button>
      )}

      {/* AI Connect Coach */}
      <div style={{...S.card,border:"1.5px solid #FBCFE8",background:"linear-gradient(135deg,#FDF2F8,white)"}}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#BE185D",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🤖 AI Connect Coach</div>
        {connectInsight?(
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.75,fontStyle:"italic",marginBottom:12}}>"{connectInsight}"</p>
        ):(
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",lineHeight:1.6,marginBottom:10}}>
            Log a connection or rate your social battery to unlock a personalised insight.
          </p>
        )}
        <button onClick={getConnectInsight} disabled={insightLoading||(todayConns.length===0&&socialBattery===0)}
          style={{...S.btn("linear-gradient(135deg,#EC4899,#F472B6)","0 4px 12px #EC489944"),padding:"11px",fontSize:13,opacity:(insightLoading||(todayConns.length===0&&socialBattery===0))?0.5:1}}>
          {insightLoading?"Thinking...":todayConns.length===0&&socialBattery===0?"Log a connection first":connectInsight?"Get New Insight →":"Analyse My Connect Day →"}
        </button>
      </div>

      {goToHabits&&(
        <button onClick={goToHabits} style={{...S.btn(),marginTop:4}}>← Back to Habits</button>
      )}
    </div>
  );
}



// ── FOCUS LAYER COMPONENT ─────────────────────────────────
const DISTRACTION_TYPES = [
  "Phone notification","Social media","Email","Colleague interruption",
  "Noise","Unrelated thought","Website","Food craving","Meeting",
];

const FOCUS_RITUALS = [
  { id:"phone_away",   emoji:"📵", label:"Phone in another room" },
  { id:"tabs_closed",  emoji:"💻", label:"Closed all unneeded tabs" },
  { id:"water_ready",  emoji:"💧", label:"Water bottle on desk" },
  { id:"mit_written",  emoji:"📝", label:"Wrote my Most Important Task" },
  { id:"notifications",emoji:"🔕", label:"Notifications turned off" },
  { id:"time_blocked", emoji:"📅", label:"Time blocked in calendar" },
  { id:"workspace",    emoji:"🪴", label:"Clean and ready workspace" },
  { id:"intention",    emoji:"🎯", label:"Set clear intention for session" },
];

function FocusLayer({ st, update, S, focusHabit, fetchAIInsight, goToHabits, buildRungContext }) {
  const [view, setView] = useState("dashboard");
  const [focusInsight, setFocusInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [distractionInput, setDistractionInput] = useState("");
  const [pomTimer, setPomTimer] = useState(0);
  const [pomRunning, setPomRunning] = useState(false);
  const [pomPhase, setPomPhase] = useState("work"); // work | break
  const [rituals, setRituals] = useState([]);

  const today = new Date().toISOString().slice(0,10);
  const tasks = focus.tasks || [];
  const weeklyGoals = focus.weeklyGoals || [];
  const distractions = focus.distractions || [];
  const pomodoros = focus.pomodoros || 0;
  const deepWorkMins = focus.deepWorkMins || 0;
  const energyLevel = focus.energyLevel || 0;
  const doneTasks = tasks.filter(t=>t.done).length;
  const productivityScore = () => {
    let score = 0;
    score += Math.min(40, pomodoros * 10);
    score += Math.min(20, Math.round((doneTasks/Math.max(tasks.length,1))*20));
    score += Math.min(20, energyLevel * 2);
    score += Math.min(10, rituals.length * 1.5);
    score -= Math.min(10, distractions.length * 2);
    return Math.max(0, Math.min(100, Math.round(score)));
  };
  const score = productivityScore();
  const scoreColor = score>=70?"#10B981":score>=50?"#F59E0B":"#EF4444";

  const analyzeForHabit = () => {
    if (!focusHabit) return null;
    const habit = focusHabit.toLowerCase();
    if (habit.includes("pomodoro") || habit.includes("25")) {
      return { goal:"Complete Pomodoro sessions", actual:`${pomodoros} done`, met: pomodoros>=1 };
    } else if (habit.includes("task") || habit.includes("mit") || habit.includes("important")) {
      return { goal:"Write & complete MIT", actual: focus.mit?`MIT: "${focus.mit.slice(0,30)}..."`:"MIT not set", met: !!focus.mit && tasks.some(t=>t.text===focus.mit&&t.done) };
    } else if (habit.includes("notif") || habit.includes("phone")) {
      const done = rituals.includes("phone_away")||rituals.includes("notifications");
      return { goal:"Remove distractions", actual: done?"Done ✓":"Not done yet", met: done };
    } else if (habit.includes("deep work") || habit.includes("minute") || habit.includes("hour")) {
      const match = focusHabit.match(/(\d+)/);
      const target = match ? parseInt(match[1]) : 25;
      return { goal:`${target} min deep work`, actual:`${deepWorkMins} min done`, met: deepWorkMins>=target };
    }
    return { goal: focusHabit, actual: pomodoros>0?`${pomodoros} pomodoros done`:doneTasks>0?`${doneTasks} tasks done`:"Nothing logged yet", met: pomodoros>0||doneTasks>0 };
  };

  const startPomodoro = () => {
    const mins = pomPhase==="work" ? (focus.pomodoroMins||25) : 5;
    setPomTimer(mins*60);
    setPomRunning(true);
    const iv = setInterval(()=>{
      setPomTimer(prev=>{
        if(prev<=1){
          clearInterval(iv);
          setPomRunning(false);
          if(pomPhase==="work"){
            update({focus:{...focus,pomodoros:(focus.pomodoros||0)+1,deepWorkMins:(focus.deepWorkMins||0)+(focus.pomodoroMins||25)}});
            setPomPhase("break");
            setPomTimer(5*60);
          } else {
            setPomPhase("work");
            setPomTimer((focus.pomodoroMins||25)*60);
          }
          return 0;
        }
        return prev-1;
      });
    },1000);
    setPomIntervalState(iv);
  };

  const stopPomodoro = () => {
    clearInterval(pomInterval);
    setPomRunning(false);
    setPomTimer(0);
    setPomPhase("work");
  };

  const formatTime = s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const getFocusInsight = async () => {
    if (!fetchAIInsight) return;
    setInsightLoading(true);
    const ha = analyzeForHabit();
    const rungCtx = buildRungContext ? buildRungContext("focus") : {};
    const ctx = JSON.stringify({
      habit: focusHabit,
      mit: focus.mit,
      pomodoros_done: pomodoros,
      deep_work_mins: deepWorkMins,
      tasks_total: tasks.length,
      tasks_done: doneTasks,
      distractions: distractions.length,
      energy_level: energyLevel,
      productivity_score: score,
      habit_met: ha?.met,
      ...rungCtx,
    });
    const insight = await fetchAIInsight("focus_insight", ctx);
    setFocusInsight(insight||"Deep work is rare and valuable. Every protected minute compounds into something extraordinary.");
    setInsightLoading(false);
  };

  const ha = analyzeForHabit();

  // ── WEEKLY PLANNING SCREEN ──
  if (view==="planning") return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>setView("dashboard")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>←</button>
        <h3 style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f"}}>Weekly Goals</h3>
      </div>
      <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",lineHeight:1.6}}>Research shows that writing weekly goals increases follow-through by 42%. What are your top goals this week?</p>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {weeklyGoals.map((g,i)=>(
          <div key={i} style={{...S.card,display:"flex",alignItems:"center",gap:10,padding:"12px 14px",border:`1.5px solid ${g.done?"#A7F3D0":"#f0f0f0"}`}}>
            <button onClick={()=>{
              const updated=[...weeklyGoals];
              updated[i]={...updated[i],done:!updated[i].done};
              update({focus:{...focus,weeklyGoals:updated}});
            }} style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${g.done?"#10B981":"#ddd"}`,background:g.done?"#10B981":"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",color:"white",fontSize:11}}>
              {g.done&&"✓"}
            </button>
            <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:g.done?"#10B981":"#333",textDecoration:g.done?"line-through":"none",flex:1}}>{g.text}</span>
            <button onClick={()=>update({focus:{...focus,weeklyGoals:weeklyGoals.filter((_,idx)=>idx!==i)}})}
              style={{background:"none",border:"none",color:"#ddd",cursor:"pointer",fontSize:16}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <input value={goalInput} onChange={e=>setGoalInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&goalInput.trim()){update({focus:{...focus,weeklyGoals:[...weeklyGoals,{text:goalInput.trim(),done:false}]}});setGoalInput("");}}}
          placeholder="Add a weekly goal..." style={{...S.input,padding:"12px 16px",flex:1}}/>
        <button onClick={()=>{if(goalInput.trim()){update({focus:{...focus,weeklyGoals:[...weeklyGoals,{text:goalInput.trim(),done:false}]}});setGoalInput("");}}}
          style={{padding:"12px 18px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#F97316,#FB923C)",color:"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,cursor:"pointer"}}>
          Add
        </button>
      </div>
      <div style={{background:"linear-gradient(135deg,#FFF7ED,white)",borderRadius:16,padding:"14px",border:"1px solid #FED7AA"}}>
        <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#92400E",lineHeight:1.7}}>
          💡 <strong>Weekly review:</strong> Every Sunday, review what worked, what didn't, and set next week's top 3 goals. This single habit is used by most high performers worldwide.
        </p>
      </div>
    </div>
  );

  // ── DASHBOARD ──
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:24,color:"#0f0f0f"}}>🎯 Focus</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>Deep work · Tasks · Productivity</div>
        </div>
        {score>0&&(
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:28,color:scoreColor,lineHeight:1}}>{score}</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:1}}>focus score</div>
          </div>
        )}
      </div>

      {/* Focus habit */}
      {focusHabit&&(
        <div style={{background:"linear-gradient(135deg,#FFF7ED,white)",borderRadius:16,padding:"14px 16px",border:`1.5px solid ${ha?.met?"#FED7AA":"#FED7AA"}`}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Today's Focus Habit</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#0f0f0f",lineHeight:1.5,marginBottom:8,fontStyle:"italic"}}>"{focusHabit}"</div>
          {ha&&(
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:16}}>{ha.met?"✅":"🎯"}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:ha.met?"#F97316":"#F59E0B",fontWeight:600}}>
                {ha.actual} — {ha.met?"Habit goal met!":ha.goal}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Energy level */}
      <div style={S.card}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f",marginBottom:10}}>⚡ Peak energy level right now</div>
        <div style={{display:"flex",gap:4,marginBottom:6}}>
          {[1,2,3,4,5,6,7,8,9,10].map(n=>(
            <button key={n} onClick={()=>update({focus:{...focus,energyLevel:n}})}
              style={{flex:1,padding:"8px 0",borderRadius:8,border:`1.5px solid ${energyLevel===n?"#F97316":"#e8e8e8"}`,background:energyLevel===n?"#FFF7ED":"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:energyLevel===n?"#F97316":"#aaa",cursor:"pointer",transition:"all 0.2s"}}>
              {n}
            </button>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#bbb"}}>
          <span>Drained</span><span>Peak energy</span>
        </div>
      </div>

      {/* MIT — Most Important Task */}
      <div style={S.card}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f",marginBottom:6}}>📝 Most Important Task</div>
        <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa",marginBottom:10,lineHeight:1.5}}>The one task that if done today, makes everything else easier.</p>
        <input value={focus.mit||""} onChange={e=>update({focus:{...focus,mit:e.target.value}})}
          placeholder="What is your MIT today?"
          style={{...S.input,padding:"12px 16px",marginBottom:8}}/>
        {focus.mit&&(
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"#FFF7ED",borderRadius:12}}>
            <span style={{fontSize:16}}>🎯</span>
            <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#F97316",fontWeight:600,flex:1}}>{focus.mit}</span>
          </div>
        )}
      </div>

      {/* Pomodoro timer */}
      <div style={{...S.card,border:"1.5px solid #FED7AA"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f"}}>🍅 Pomodoro Timer</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#F97316",fontWeight:600}}>{pomodoros} done · {deepWorkMins} min</div>
        </div>
        {pomTimer>0?(
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:56,color:pomPhase==="work"?"#F97316":"#10B981",lineHeight:1}}>{formatTime(pomTimer)}</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa",marginTop:4}}>{pomPhase==="work"?"Deep work — stay focused":"Break time — rest your mind"}</div>
          </div>
        ):(
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:48,color:"#ddd",lineHeight:1}}>{formatTime((focus.pomodoroMins||25)*60)}</div>
          </div>
        )}
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {!pomRunning?(
            <button onClick={startPomodoro} style={{...S.btn("linear-gradient(135deg,#F97316,#FB923C)","0 4px 12px #F9731644"),flex:1,padding:"12px",fontSize:13}}>
              ▶ Start {pomPhase==="work"?"Focus":"Break"} Session
            </button>
          ):(
            <button onClick={stopPomodoro} style={{...S.btnGhost,flex:1,padding:"12px",fontSize:13}}>⏹ Stop</button>
          )}
        </div>
        <div style={{display:"flex",gap:6}}>
          {[15,25,45,60].map(m=>(
            <button key={m} onClick={()=>update({focus:{...focus,pomodoroMins:m}})}
              style={{flex:1,padding:"7px",borderRadius:10,border:`1.5px solid ${(focus.pomodoroMins||25)===m?"#F97316":"#e8e8e8"}`,background:(focus.pomodoroMins||25)===m?"#FFF7ED":"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:600,color:(focus.pomodoroMins||25)===m?"#F97316":"#aaa",cursor:"pointer"}}>
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Focus rituals */}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f"}}>🛡️ Focus Rituals</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#F97316",fontWeight:600}}>{rituals.length}/{FOCUS_RITUALS.length}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {FOCUS_RITUALS.map(r=>{
            const done=rituals.includes(r.id);
            return (
              <button key={r.id} onClick={()=>setRituals(prev=>done?prev.filter(x=>x!==r.id):[...prev,r.id])}
                style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:12,border:`1.5px solid ${done?"#FED7AA":"#f0f0f0"}`,background:done?"#FFF7ED":"white",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                <div style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${done?"#F97316":"#ddd"}`,background:done?"#F97316":"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"white",fontSize:11}}>
                  {done&&"✓"}
                </div>
                <span style={{fontSize:16}}>{r.emoji}</span>
                <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:done?"#F97316":"#444",fontWeight:done?600:400,textDecoration:done?"line-through":"none"}}>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list */}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f"}}>✅ Today's Tasks</div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#F97316",fontWeight:600}}>{doneTasks}/{tasks.length}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
          {tasks.map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>{const u=[...tasks];u[i]={...u[i],done:!u[i].done};update({focus:{...focus,tasks:u}});}}
                style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${t.done?"#F97316":"#ddd"}`,background:t.done?"#F97316":"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",color:"white",fontSize:11}}>
                {t.done&&"✓"}
              </button>
              <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:t.done?"#aaa":"#333",textDecoration:t.done?"line-through":"none",flex:1}}>{t.text}</span>
              <button onClick={()=>update({focus:{...focus,tasks:tasks.filter((_,idx)=>idx!==i)}})}
                style={{background:"none",border:"none",color:"#ddd",cursor:"pointer",fontSize:14}}>✕</button>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={taskInput} onChange={e=>setTaskInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&taskInput.trim()){update({focus:{...focus,tasks:[...tasks,{text:taskInput.trim(),done:false}]}});setTaskInput("");}}}
            placeholder="Add a task..." style={{...S.input,padding:"10px 14px",fontSize:13,flex:1}}/>
          <button onClick={()=>{if(taskInput.trim()){update({focus:{...focus,tasks:[...tasks,{text:taskInput.trim(),done:false}]}});setTaskInput("");}}}
            style={{padding:"10px 16px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#F97316,#FB923C)",color:"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,cursor:"pointer"}}>
            +
          </button>
        </div>
      </div>

      {/* Distraction log */}
      <div style={S.card}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f",marginBottom:8}}>🎣 Distraction Log</div>
        <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa",lineHeight:1.5,marginBottom:10}}>Awareness is the first step. Log distractions to spot patterns.</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {DISTRACTION_TYPES.map(d=>(
            <button key={d} onClick={()=>update({focus:{...focus,distractions:[...distractions,{type:d,time:new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}]}})}
              style={{padding:"6px 12px",borderRadius:20,border:"1.5px solid #FED7AA",background:"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#F97316",cursor:"pointer"}}>
              {d}
            </button>
          ))}
        </div>
        {distractions.length>0&&(
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>{distractions.length} distraction(s) logged today</div>
        )}
      </div>

      {/* Weekly planning button */}
      <button onClick={()=>setView("planning")} style={{...S.btnGhost,border:"1.5px solid #FED7AA",color:"#F97316",fontSize:13}}>
        📅 Weekly Goals & Planning →
      </button>

      {/* AI Focus Coach */}
      <div style={{...S.card,border:"1.5px solid #FED7AA",background:"linear-gradient(135deg,#FFF7ED,white)"}}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#C2410C",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🤖 AI Focus Coach</div>
        {focusInsight?(
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.75,fontStyle:"italic",marginBottom:12}}>"{focusInsight}"</p>
        ):(
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",lineHeight:1.6,marginBottom:10}}>
            Start a pomodoro or add tasks to unlock your personalised focus insight.
          </p>
        )}
        <button onClick={getFocusInsight} disabled={insightLoading||(pomodoros===0&&tasks.length===0&&energyLevel===0)}
          style={{...S.btn("linear-gradient(135deg,#F97316,#FB923C)","0 4px 12px #F9731644"),padding:"11px",fontSize:13,opacity:(insightLoading||(pomodoros===0&&tasks.length===0&&energyLevel===0))?0.5:1}}>
          {insightLoading?"Thinking...":pomodoros===0&&tasks.length===0&&energyLevel===0?"Add tasks first to unlock":focusInsight?"Get New Insight →":"Analyse My Focus Day →"}
        </button>
      </div>

      {goToHabits&&(
        <button onClick={goToHabits} style={{...S.btn(),marginTop:4}}>← Back to Habits</button>
      )}
    </div>
  );
}



// ── WEEKLY REPORT COMPONENT ───────────────────────────────
function WeeklyReport({ st, goBack, fetchWeeklyReport, S }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const PILLAR_CONFIG = {
    fuel:    { emoji:"⚡", name:"Fuel",    color:"#F59E0B", bg:"#FFFBEB" },
    move:    { emoji:"💪", name:"Move",    color:"#10B981", bg:"#ECFDF5" },
    rest:    { emoji:"😴", name:"Rest",    color:"#8B5CF6", bg:"#F5F3FF" },
    calm:    { emoji:"🧘", name:"Calm",    color:"#0EA5E9", bg:"#F0F9FF" },
    connect: { emoji:"🤝", name:"Connect", color:"#EC4899", bg:"#FDF2F8" },
    focus:   { emoji:"🎯", name:"Focus",   color:"#F97316", bg:"#FFF7ED" },
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWeeklyReport();
      if (result?.report) {
        setReport(result);
      } else {
        setError("Could not generate report. Try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  useEffect(()=>{ generate(); },[]);

  const scoreColor = (s) => s>=70?"#10B981":s>=50?"#F59E0B":"#EF4444";
  const scoreLabel = (s) => s>=80?"Excellent":s>=65?"Good":s>=50?"Fair":"Needs work";

  // Parse report sections
  const parseSections = (text) => {
    if (!text) return [];
    const sections = [];
    const lines = text.split('\n');
    let current = null;
    lines.forEach(line => {
      const header = line.match(/^\*\*(.+)\*\*/);
      if (header) {
        if (current) sections.push(current);
        current = { title: header[1], content: [] };
      } else if (current && line.trim()) {
        current.content.push(line.trim());
      }
    });
    if (current) sections.push(current);
    return sections;
  };

  return (
    <div style={{minHeight:"100vh",background:"#FAFAF8"}}>
      <div style={{maxWidth:430,margin:"0 auto",padding:"40px 22px 80px"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <button onClick={goBack} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#666"}}>←</button>
          <div>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:28,color:"#0f0f0f",letterSpacing:-0.5}}>Weekly Report</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>
              {new Date().toLocaleDateString("en",{weekday:"long",month:"long",day:"numeric"})}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading&&(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:48,marginBottom:16,animation:"float 1.5s ease-in-out infinite"}}>🧠</div>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f",marginBottom:8}}>Analysing your week...</div>
            <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa",lineHeight:1.7}}>
              Reading all 6 pillars · Detecting cross-pillar patterns · Generating your personalised report
            </p>
          </div>
        )}

        {/* Error */}
        {error&&!loading&&(
          <div style={{...S.card,border:"1.5px solid #fee2e2",textAlign:"center",padding:"28px"}}>
            <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
            <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#ef4444",marginBottom:16}}>{error}</p>
            <button onClick={generate} style={S.btn()}>Try Again</button>
          </div>
        )}

        {/* Report */}
        {report&&!loading&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Overall score */}
            <div style={{background:"linear-gradient(135deg,#0f0f0f,#2d2d2d)",borderRadius:20,padding:"24px",textAlign:"center"}}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"rgba(255,255,255,0.5)",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Overall Score</div>
              <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:72,color:"white",lineHeight:1,marginBottom:4}}>{report.overall}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"rgba(255,255,255,0.6)"}}>out of 100 · {scoreLabel(report.overall)}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:8}}>🔥 {st.streak} day streak</div>
            </div>

            {/* Pillar scores */}
            <div style={S.card}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>This Week's Pillars</div>
              {Object.entries(report.scores||{}).map(([pillar,score])=>{
                const p = PILLAR_CONFIG[pillar];
                if (!p) return null;
                return (
                  <div key={pillar} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <div style={{width:36,height:36,borderRadius:10,background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,fontWeight:600,color:"#333"}}>{p.name}</span>
                        <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:scoreColor(score),fontWeight:700}}>{score}</span>
                      </div>
                      <div style={{background:"#f0f0f0",borderRadius:4,height:6,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:4,background:p.color,width:`${score}%`,transition:"width 0.8s ease"}}/>
                      </div>
                    </div>
                    <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#bbb",width:50,textAlign:"right"}}>{scoreLabel(score)}</div>
                  </div>
                );
              })}
            </div>

            {/* Cross-pillar patterns */}
            {report.analysis?.patterns?.length>0&&(
              <div style={S.card}>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>🔗 Cross-Pillar Patterns</div>
                {report.analysis.patterns.map((p,i)=>{
                  const isPositive = p.severity==="positive";
                  return (
                    <div key={i} style={{padding:"12px 14px",borderRadius:14,background:isPositive?"#ECFDF5":"#FFF7ED",border:`1px solid ${isPositive?"#A7F3D0":"#FED7AA"}`,marginBottom:8}}>
                      <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                        <span style={{fontSize:16}}>{isPositive?"✅":"⚠️"}</span>
                        <div>
                          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:isPositive?"#065F46":"#92400E",lineHeight:1.6,marginBottom:6}}>{p.message}</div>
                          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:isPositive?"#10B981":"#F97316",fontWeight:600}}>→ {p.suggestion}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI Report sections */}
            {parseSections(report.report).map((section,i)=>(
              <div key={i} style={{...S.card,border:"1.5px solid #f0f0f0"}}>
                <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:17,color:"#0f0f0f",marginBottom:10,letterSpacing:-0.3}}>{section.title}</div>
                {section.content.map((line,j)=>(
                  <p key={j} style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:14,color:"#374151",lineHeight:1.75,marginBottom:6}}>{line}</p>
                ))}
              </div>
            ))}

            {/* Keystone pillar */}
            {report.analysis&&(
              <div style={{background:"linear-gradient(135deg,#F5F3FF,#EFF6FF)",borderRadius:20,padding:"20px",border:"1px solid #DDD6FE"}}>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#6D28D9",letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>Your Keystone Pillar</div>
                <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:20,color:"#0f0f0f",marginBottom:4}}>
                  {PILLAR_CONFIG[report.analysis.keystone]?.emoji} {PILLAR_CONFIG[report.analysis.keystone]?.name}
                </div>
                <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#555",lineHeight:1.6}}>
                  This is your strongest pillar this week. Build on it — it supports everything else.
                </p>
              </div>
            )}

            {/* Regenerate button */}
            <button onClick={generate} style={{...S.btnGhost,fontSize:13}}>
              🔄 Regenerate Report
            </button>
            <button onClick={goBack} style={S.btn()}>← Back to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}


// ── PILLAR RIPPLE EFFECT COMPONENT ───────────────────────
function PillarRipple({ ripple, S }) {
  const PILLARS_CONFIG = {
    fuel:    { emoji:"⚡", name:"Fuel",    color:"#F59E0B", x:200, y:80  },
    move:    { emoji:"💪", name:"Move",    color:"#10B981", x:340, y:160 },
    rest:    { emoji:"😴", name:"Rest",    color:"#8B5CF6", x:300, y:300 },
    calm:    { emoji:"🧘", name:"Calm",    color:"#0EA5E9", x:140, y:320 },
    connect: { emoji:"🤝", name:"Connect", color:"#EC4899", x:60,  y:200 },
    focus:   { emoji:"🎯", name:"Focus",   color:"#F97316", x:160, y:160 },
  };

  const RIPPLE_CONNECTIONS = {
    rest:    ["focus","calm","move"],
    fuel:    ["move","focus"],
    move:    ["calm","rest"],
    calm:    ["connect","focus"],
    connect: ["calm"],
    focus:   ["fuel","move"],
  };

  if (!ripple) return null;

  const keystone = ripple.keystone;
  const keystoneConfig = PILLARS_CONFIG[keystone];
  const affected = RIPPLE_CONNECTIONS[keystone] || [];

  return (
    <div style={{...S.card,border:"1.5px solid #DDD6FE",overflow:"hidden"}}>
      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#6D28D9",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>🌊 Pillar Ripple Effect</div>
      <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#888",marginBottom:14,lineHeight:1.5}}>
        Your <strong style={{color:keystoneConfig?.color}}>{keystoneConfig?.emoji} {keystoneConfig?.name}</strong> pillar is influencing the others most this week.
      </p>

      {/* Visual ripple map */}
      <div style={{position:"relative",height:380,marginBottom:12}}>
        <svg width="100%" height="380" viewBox="0 0 400 380" style={{position:"absolute",inset:0}}>
          {/* Connection lines */}
          {affected.map(pid=>{
            const from = keystoneConfig;
            const to = PILLARS_CONFIG[pid];
            if (!from||!to) return null;
            return (
              <line key={pid}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={from.color} strokeWidth="2" strokeDasharray="6,4" opacity="0.4"/>
            );
          })}
          {/* Ripple circles around keystone */}
          {[40,70,100].map((r,i)=>(
            <circle key={i} cx={keystoneConfig?.x||200} cy={keystoneConfig?.y||190}
              r={r} fill="none" stroke={keystoneConfig?.color||"#6D28D9"}
              strokeWidth="1" opacity={0.15-(i*0.04)}/>
          ))}
        </svg>

        {/* Pillar nodes */}
        {Object.entries(PILLARS_CONFIG).map(([pid, cfg])=>{
          const isKeystone = pid===keystone;
          const isAffected = affected.includes(pid);
          const score = ripple.scores?.[pid];
          return (
            <div key={pid} style={{
              position:"absolute",
              left:cfg.x-30, top:cfg.y-30,
              width:60, height:60,
              borderRadius:"50%",
              background:isKeystone?cfg.color:isAffected?`${cfg.color}22`:"#f5f5f5",
              border:`3px solid ${isKeystone?cfg.color:isAffected?cfg.color:"#e8e8e8"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              flexDirection:"column",
              boxShadow:isKeystone?`0 0 20px ${cfg.color}66`:isAffected?`0 4px 12px ${cfg.color}33`:"none",
              transition:"all 0.3s",
              zIndex:2,
            }}>
              <span style={{fontSize:isKeystone?22:18}}>{cfg.emoji}</span>
              {score!==undefined&&(
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:8,fontWeight:700,color:isKeystone?"white":cfg.color,marginTop:1}}>
                  {Math.round(score*25)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Affected pillars list */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {affected.map(pid=>{
          const cfg = PILLARS_CONFIG[pid];
          return (
            <div key={pid} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,background:`${cfg.color}11`,border:`1px solid ${cfg.color}33`}}>
              <span style={{fontSize:18}}>{cfg.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:cfg.color}}>{cfg.name}</div>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#888"}}>Influenced by {keystoneConfig?.name}</div>
              </div>
              <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:16,color:cfg.color}}>
                {ripple.scores?.[pid]!==undefined?`${Math.round(ripple.scores[pid]*25)}`:"-"}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#8B5CF6",marginTop:12,lineHeight:1.6,fontStyle:"italic",padding:"10px 12px",background:"#F5F3FF",borderRadius:10}}>
        💡 Strengthen {keystoneConfig?.name} and watch these pillars improve automatically.
      </div>
    </div>
  );
}


// ── MONTHLY PROGRESS LETTER ───────────────────────────────
function MonthlyLetter({ st, goBack, S }) {
  const totalDays = (st.history||[]).length;
  const daysLeft = Math.max(0, 30 - totalDays);
  const canGenerate = totalDays >= 30;

  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState(null);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const id = localStorage.getItem("coresix_device_id");
      if (!id) throw new Error("No device ID");

      const monthData = {
        fuel: st.fuel,
        move: st.move,
        rest: st.rest,
        calm: st.calm,
        connect: st.connect,
        focus: st.focus,
        streak: st.streak,
        history: (st.history||[]).slice(-30),
        weeklyImpact: st.weeklyImpact || {},
        impactHistory: (st.impactHistory||[]).slice(-4),
        selectedPillars: st.selectedPillars,
        scores: st.scores,
      };

      const res = await fetch("https://coresix-backend-production.up.railway.app/api/monthly-letter", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ deviceId: id, monthData }),
      });
      const data = await res.json();
      if (data.letter) setLetter(data);
      else throw new Error("No letter generated");
    } catch (err) {
      setError("Could not generate your letter. Try again.");
    }
    setLoading(false);
  };

  useEffect(()=>{ generate(); },[]);

  const PILLAR_EMOJIS = {fuel:"⚡",move:"💪",rest:"😴",calm:"🧘",connect:"🤝",focus:"🎯"};

  return (
    <div style={{minHeight:"100vh",background:"#FAFAF8"}}>
      <div style={{maxWidth:430,margin:"0 auto",padding:"40px 22px 80px"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
          <button onClick={goBack} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#666"}}>←</button>
          <div>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:28,color:"#0f0f0f",letterSpacing:-0.5}}>Monthly Letter</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>
              {new Date().toLocaleDateString("en",{month:"long",year:"numeric"})}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading&&(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:48,marginBottom:16,animation:"float 1.5s ease-in-out infinite"}}>✉️</div>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f",marginBottom:8}}>Writing your letter...</div>
            <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa",lineHeight:1.7}}>
              Reading 30 days of data · Finding your patterns · Writing something honest
            </p>
          </div>
        )}

        {/* Error */}
        {error&&!loading&&(
          <div style={{...S.card,border:"1.5px solid #fee2e2",textAlign:"center",padding:"28px"}}>
            <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
            <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#ef4444",marginBottom:16}}>{error}</p>
            <button onClick={generate} style={S.btn()}>Try Again</button>
          </div>
        )}

        {/* Letter */}
        {letter&&!loading&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Month stats */}
            <div style={{background:"linear-gradient(135deg,#0f0f0f,#2d2d2d)",borderRadius:20,padding:"22px"}}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Your Month in Numbers</div>
              <div style={{display:"flex",gap:12}}>
                {[
                  {label:"Days active",value:letter.stats?.totalDays||0,unit:"/30"},
                  {label:"Streak",value:letter.stats?.streak||0,unit:"days"},
                  {label:"Pillars active",value:Object.keys(letter.stats?.pillarStats||{}).length,unit:"/6"},
                ].map(s=>(
                  <div key={s.label} style={{flex:1,textAlign:"center",background:"rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 8px"}}>
                    <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:32,color:"white",lineHeight:1}}>{s.value}</div>
                    <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4,textTransform:"uppercase",letterSpacing:1}}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Pillar breakdown */}
              {letter.stats?.pillarStats&&Object.keys(letter.stats.pillarStats).length>0&&(
                <div style={{marginTop:14}}>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Pillar Activity</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {Object.entries(letter.stats.pillarStats).map(([pillar,data])=>(
                      <div key={pillar} style={{background:"rgba(255,255,255,0.08)",borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:12}}>{PILLAR_EMOJIS[pillar]}</span>
                        <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"rgba(255,255,255,0.6)"}}>{data.days}d</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* The letter */}
            <div style={{background:"white",borderRadius:20,padding:"28px 24px",border:"1.5px solid #f0f0f0",boxShadow:"0 8px 40px #0006"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,paddingBottom:16,borderBottom:"1px solid #f5f5f5"}}>
                <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#10B981,#0EA5E9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>✦</div>
                <div>
                  <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:16,color:"#0f0f0f"}}>From CoreSix</div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>{letter.month}</div>
                </div>
              </div>

              {letter.letter.split('\n').filter(l=>l.trim()).map((line,i)=>(
                <p key={i} style={{
                  fontFamily: line.startsWith("Dear")||line.startsWith("With") ? "Fraunces,serif" : "Plus Jakarta Sans,sans-serif",
                  fontSize: line.startsWith("Dear")||line.startsWith("With") ? 16 : 14,
                  fontWeight: line.startsWith("Dear")||line.startsWith("With") ? 700 : 400,
                  color: "#374151",
                  lineHeight: 1.85,
                  marginBottom: 12,
                }}>{line}</p>
              ))}
            </div>

            {/* Actions */}
            <button onClick={generate} style={{...S.btnGhost,fontSize:13}}>
              🔄 Regenerate Letter
            </button>
            <button onClick={goBack} style={S.btn()}>← Back to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}


const ALL_QUOTES = [
  { quote:"A goal without a plan is just a wish.", author:"Antoine de Saint-Exupéry" },
  { quote:"You don't rise to the level of your goals. You fall to the level of your systems.", author:"James Clear" },
  { quote:"By failing to prepare, you are preparing to fail.", author:"Benjamin Franklin" },
  { quote:"What gets scheduled gets done.", author:"Michael Hyatt" },
  { quote:"An hour of planning can save you 10 hours of doing.", author:"Dale Carnegie" },
  { quote:"You don't have to be great to start, but you have to start to be great.", author:"Zig Ziglar" },
  { quote:"Small daily improvements over time lead to stunning results.", author:"Robin Sharma" },
  { quote:"The secret of your future is hidden in your daily routine.", author:"Mike Murdock" },
  { quote:"We are what we repeatedly do. Excellence is not an act but a habit.", author:"Aristotle" },
  { quote:"Success is the sum of small efforts repeated day in and day out.", author:"Robert Collier" },
  { quote:"Motivation gets you going. Habit keeps you growing.", author:"John Maxwell" },
  { quote:"You will never change your life until you change something you do daily.", author:"John Maxwell" },
  { quote:"Every action you take is a vote for the type of person you wish to become.", author:"James Clear" },
  { quote:"Knowing is not enough; we must apply. Willing is not enough; we must do.", author:"Goethe" },
  { quote:"80% of success is showing up.", author:"Woody Allen" },
  { quote:"The secret of getting ahead is getting started.", author:"Mark Twain" },
  { quote:"Done is better than perfect.", author:"Sheryl Sandberg" },
  { quote:"It does not matter how slowly you go as long as you do not stop.", author:"Confucius" },
  { quote:"Consistency is more important than intensity.", author:"James Clear" },
  { quote:"Take care of your body. It's the only place you have to live.", author:"Jim Rohn" },
  { quote:"Sleep is the best meditation.", author:"Dalai Lama" },
  { quote:"An early morning walk is a blessing for the whole day.", author:"Henry David Thoreau" },
  { quote:"Almost everything will work again if you unplug it for a few minutes — including you.", author:"Anne Lamott" },
  { quote:"Someone is sitting in the shade today because someone planted a tree a long time ago.", author:"Warren Buffett" },
  { quote:"Give me six hours to chop down a tree and I will spend the first four sharpening the axe.", author:"Abraham Lincoln" },
  // Motivation & resilience
  { quote:"The harder you work for something, the greater you'll feel when you achieve it.", author:"Unknown" },
  { quote:"Don't watch the clock. Do what it does — keep going.", author:"Sam Levenson" },
  { quote:"Believe you can and you're halfway there.", author:"Theodore Roosevelt" },
  { quote:"The only person you are destined to become is the person you decide to be.", author:"Ralph Waldo Emerson" },
  { quote:"You are never too old to set another goal or to dream a new dream.", author:"C.S. Lewis" },
  { quote:"It always seems impossible until it's done.", author:"Nelson Mandela" },
  { quote:"The future belongs to those who believe in the beauty of their dreams.", author:"Eleanor Roosevelt" },
  { quote:"What lies behind us and what lies before us are tiny matters compared to what lies within us.", author:"Ralph Waldo Emerson" },
  { quote:"The only way to achieve the impossible is to believe it is possible.", author:"Charles Kingsleigh" },
  { quote:"If you want to lift yourself up, lift up someone else.", author:"Booker T. Washington" },
  { quote:"Start where you are. Use what you have. Do what you can.", author:"Arthur Ashe" },
  { quote:"Hardships often prepare ordinary people for an extraordinary destiny.", author:"C.S. Lewis" },
  { quote:"In the middle of every difficulty lies opportunity.", author:"Albert Einstein" },
  { quote:"You miss 100% of the shots you don't take.", author:"Wayne Gretzky" },
  { quote:"The best time to plant a tree was 20 years ago. The second best time is now.", author:"Chinese Proverb" },
  { quote:"Whether you think you can or you think you can't — you're right.", author:"Henry Ford" },
  { quote:"The only limit to our realisation of tomorrow is our doubts of today.", author:"Franklin D. Roosevelt" },
  { quote:"Strength does not come from physical capacity. It comes from an indomitable will.", author:"Mahatma Gandhi" },
  { quote:"You have power over your mind, not outside events. Realise this and you will find strength.", author:"Marcus Aurelius" },
  { quote:"Fall seven times, stand up eight.", author:"Japanese Proverb" },
  { quote:"The struggle you're in today is developing the strength you need for tomorrow.", author:"Robert Tew" },
  { quote:"Push yourself because no one else is going to do it for you.", author:"Unknown" },
  { quote:"Great things never come from comfort zones.", author:"Unknown" },
  { quote:"Dream it. Believe it. Build it.", author:"Unknown" },
  { quote:"Your only limit is your mind.", author:"Unknown" },
  { quote:"Do something today that your future self will thank you for.", author:"Sean Patrick Flanery" },
  { quote:"Little by little, day by day, what is meant for you will find its way.", author:"Unknown" },
  { quote:"The secret to getting ahead is getting started.", author:"Mark Twain" },
  { quote:"You don't have to be perfect to be amazing.", author:"Unknown" },
  { quote:"Discipline is choosing between what you want now and what you want most.", author:"Abraham Lincoln" },
  { quote:"Success is not final, failure is not fatal — it is the courage to continue that counts.", author:"Winston Churchill" },
  { quote:"The pain you feel today is the strength you feel tomorrow.", author:"Unknown" },
  { quote:"Champions keep playing until they get it right.", author:"Billie Jean King" },
  { quote:"Energy and persistence conquer all things.", author:"Benjamin Franklin" },
  { quote:"Action is the foundational key to all success.", author:"Pablo Picasso" },
  { quote:"You are stronger than you think.", author:"Unknown" },
  { quote:"Progress is progress, no matter how small.", author:"Unknown" },
  { quote:"Every day is a new beginning. Take a deep breath and start again.", author:"Unknown" },
  { quote:"The difference between who you are and who you want to be is what you do.", author:"Unknown" },
  { quote:"Don't stop when you're tired. Stop when you're done.", author:"Unknown" },
  { quote:"Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.", author:"Christian D. Larson" },
];

// Rotate by day + streak so it changes daily
const getDailyQuote = (streak=0) => ALL_QUOTES[(new Date().getDate() + streak) % ALL_QUOTES.length];
const getPlanQuote  = (streak=0) => ALL_QUOTES[(new Date().getDay() + streak + 5) % ALL_QUOTES.length];

// ── SMART NEXT WEEK PLAN ──────────────────────────────────
const PLAN_QUOTES = [
  { quote:"A goal without a plan is just a wish.", author:"Antoine de Saint-Exupéry" },
  { quote:"Someone is sitting in the shade today because someone planted a tree a long time ago.", author:"Warren Buffett" },
  { quote:"The secret of getting ahead is getting started.", author:"Mark Twain" },
  { quote:"You don't rise to the level of your goals. You fall to the level of your systems.", author:"James Clear" },
  { quote:"Plan your work and work your plan.", author:"Napoleon Hill" },
  { quote:"By failing to prepare, you are preparing to fail.", author:"Benjamin Franklin" },
  { quote:"What gets scheduled gets done.", author:"Michael Hyatt" },
  { quote:"Give me six hours to chop down a tree and I will spend the first four sharpening the axe.", author:"Abraham Lincoln" },
  { quote:"The time to repair the roof is when the sun is shining.", author:"John F. Kennedy" },
  { quote:"An hour of planning can save you 10 hours of doing.", author:"Dale Carnegie" },
];

function NextWeekPlan({ st, goBack, S }) {
  const planQuote = getPlanQuote(st?.streak||0);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [checkedActions, setCheckedActions] = useState([]);

  const PILLAR_COLORS = {fuel:"#F59E0B",move:"#10B981",rest:"#8B5CF6",calm:"#0EA5E9",connect:"#EC4899",focus:"#F97316"};
  const PILLAR_BG = {fuel:"#FFFBEB",move:"#ECFDF5",rest:"#F5F3FF",calm:"#F0F9FF",connect:"#FDF2F8",focus:"#FFF7ED"};
  const PILLAR_BORDER = {fuel:"#FDE68A",move:"#A7F3D0",rest:"#DDD6FE",calm:"#BAE6FD",connect:"#FBCFE8",focus:"#FED7AA"};

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const id = localStorage.getItem("coresix_device_id");
      const weekData = {
        fuel: st.fuel, move: st.move, rest: st.rest,
        streak: st.streak, weeklyImpact: st.weeklyImpact,
      };
      const res = await fetch("https://coresix-backend-production.up.railway.app/api/next-week-plan", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ deviceId: id, weekData }),
      });
      const data = await res.json();
      if (data.plan) setPlan(data.plan);
      else throw new Error("No plan generated");
    } catch (err) {
      setError("Could not generate your plan. Try again.");
    }
    setLoading(false);
  };

  useEffect(()=>{ generate(); },[]);

  const toggleAction = (i) => {
    setCheckedActions(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i]);
  };

  return (
    <div style={{minHeight:"100vh",background:"#FAFAF8"}}>
      <div style={{maxWidth:430,margin:"0 auto",padding:"40px 22px 80px"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
          <button onClick={goBack} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#666"}}>←</button>
          <div>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:28,color:"#0f0f0f",letterSpacing:-0.5}}>Next Week Plan</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>Based on your patterns</div>
          </div>
        </div>

        {/* Opening quote */}
        <div style={{background:"linear-gradient(135deg,#0f0f0f,#1a1a1a)",borderRadius:20,padding:"22px 24px",marginBottom:4}}>
          <div style={{fontFamily:"Fraunces,serif",fontWeight:700,fontSize:18,color:"white",lineHeight:1.5,fontStyle:"italic",marginBottom:10}}>
            "{planQuote.quote}"
          </div>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"rgba(255,255,255,0.4)",letterSpacing:1}}>
            — {planQuote.author}
          </div>
        </div>

        {/* Loading */}
        {loading&&(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:48,marginBottom:16,animation:"float 1.5s ease-in-out infinite"}}>🧠</div>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f",marginBottom:8}}>Building your plan...</div>
            <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa",lineHeight:1.7}}>
              Analysing your patterns · Finding your weak days · Generating specific actions
            </p>
          </div>
        )}

        {/* Error */}
        {error&&!loading&&(
          <div style={{...S.card,border:"1.5px solid #fee2e2",textAlign:"center",padding:"28px"}}>
            <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
            <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#ef4444",marginBottom:16}}>{error}</p>
            <button onClick={generate} style={S.btn()}>Try Again</button>
          </div>
        )}

        {/* Plan */}
        {plan&&!loading&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>

            {/* Week header */}
            <div style={{background:"linear-gradient(135deg,#10B981,#0EA5E9)",borderRadius:20,padding:"22px",textAlign:"center"}}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"rgba(255,255,255,0.6)",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Week of {plan.week_of}</div>
              <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:20,color:"white",lineHeight:1.3}}>{plan.headline}</div>
              {checkedActions.length>0&&(
                <div style={{marginTop:10,fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"rgba(255,255,255,0.8)"}}>
                  {checkedActions.length}/{plan.actions?.length||3} actions committed ✓
                </div>
              )}
            </div>

            {/* 3 Actions */}
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#aaa",letterSpacing:1,textTransform:"uppercase"}}>Your 3 Actions</div>

            {(plan.actions||[]).map((action,i)=>{
              const checked = checkedActions.includes(i);
              const color = PILLAR_COLORS[action.pillar]||"#10B981";
              const bg = PILLAR_BG[action.pillar]||"#ECFDF5";
              const border = PILLAR_BORDER[action.pillar]||"#A7F3D0";
              return (
                <div key={i} style={{borderRadius:20,overflow:"hidden",border:`1.5px solid ${checked?"#10B981":border}`,background:checked?"#ECFDF5":bg,transition:"all 0.3s"}}>
                  {/* Action header */}
                  <div style={{padding:"16px 18px",display:"flex",alignItems:"flex-start",gap:12}}>
                    <div style={{width:36,height:36,borderRadius:10,background:checked?"#10B981":color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,color:"white"}}>
                      {checked?"✓":action.emoji}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:14,color:checked?"#10B981":"#0f0f0f",marginBottom:4}}>{action.title}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                        {(action.days||[]).map(day=>(
                          <span key={day} style={{background:checked?"white":"white",border:`1px solid ${checked?"#10B981":color}`,borderRadius:6,padding:"2px 8px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:checked?"#10B981":color,fontWeight:600}}>{day}</span>
                        ))}
                      </div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#444",lineHeight:1.6,marginBottom:6}}>{action.description}</div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#888",lineHeight:1.5,fontStyle:"italic"}}>💡 {action.why}</div>
                    </div>
                  </div>
                  {/* Commit button */}
                  <div style={{padding:"0 18px 16px"}}>
                    <button onClick={()=>toggleAction(i)}
                      style={{width:"100%",padding:"11px",borderRadius:12,border:`1.5px solid ${checked?"#10B981":color}`,background:checked?"#10B981":"white",color:checked?"white":color,fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,cursor:"pointer",transition:"all 0.3s"}}>
                      {checked?"✓ Committed to this":"Commit to this →"}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* What to protect */}
            {plan.protect&&(
              <div style={{background:"linear-gradient(135deg,#ECFDF5,white)",borderRadius:16,padding:"16px",border:"1.5px solid #A7F3D0",display:"flex",gap:10}}>
                <span style={{fontSize:20,flexShrink:0}}>🛡️</span>
                <div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:"#10B981",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Protect This</div>
                  <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.6}}>{plan.protect}</p>
                </div>
              </div>
            )}

            {/* Streak note */}
            {plan.streak_note&&(
              <div style={{background:"linear-gradient(135deg,#F5F3FF,white)",borderRadius:16,padding:"16px",border:"1px solid #DDD6FE",display:"flex",gap:10}}>
                <span style={{fontSize:20,flexShrink:0}}>🔥</span>
                <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#6D28D9",lineHeight:1.6,fontStyle:"italic"}}>{plan.streak_note}</p>
              </div>
            )}

            {/* Commitment summary */}
            {checkedActions.length===(plan.actions||[]).length&&(
              <div style={{background:"linear-gradient(135deg,#10B981,#0EA5E9)",borderRadius:20,padding:"20px",textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:8}}>🎯</div>
                <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:20,color:"white",marginBottom:6}}>Plan committed!</div>
                <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"rgba(255,255,255,0.8)",lineHeight:1.6}}>You have committed to all 3 actions. Research shows written commitments increase follow-through by 42%.</p>
              </div>
            )}

            <button onClick={generate} style={{...S.btnGhost,fontSize:13}}>🔄 Regenerate Plan</button>
            <button onClick={goBack} style={S.btn()}>← Back to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}



// ── BRAIN PANEL COMPONENT ─────────────────────────────────
function BrainPanel({ deviceId, fetchAnalytics, fetchAIInsight, fetchCrossPatterns, fetchPredictiveNudge, S }) {
  const [analytics, setAnalytics] = useState(null);
  const [crossPatterns, setCrossPatterns] = useState(null);
  const [nudge, setNudge] = useState(null);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [analyticsData, crossData, nudgeData] = await Promise.all([
      fetchAnalytics(),
      fetchCrossPatterns ? fetchCrossPatterns() : null,
      fetchPredictiveNudge ? fetchPredictiveNudge() : null,
    ]);
    setAnalytics(analyticsData);
    setCrossPatterns(crossData);
    setNudge(nudgeData?.nudge);
    setLoading(false);
  };

  const loadAnalytics = loadAll;

  const getInsight = async () => {
    setInsightLoading(true);
    const content = await fetchAIInsight("weekly_insight");
    setInsight(content || "Keep going. Every habit compounds.");
    setInsightLoading(false);
  };

  if (loading) return (
    <div style={{textAlign:"center",padding:"48px 20px"}}>
      <div style={{fontSize:32,marginBottom:12,animation:"float 1.5s ease-in-out infinite"}}>🧠</div>
      <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",color:"#aaa",fontSize:14}}>Analysing your patterns...</p>
    </div>
  );

  if (!analytics) return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{...S.card,textAlign:"center",padding:"28px"}}>
        <div style={{fontSize:36,marginBottom:12}}>🧠</div>
        <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",color:"#555",fontSize:14,lineHeight:1.7,marginBottom:12}}>
          Complete some habits first to unlock pattern analysis and AI insights.
        </p>
        <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",color:"#aaa",fontSize:12,lineHeight:1.6}}>
          The brain analyses your patterns after you check in a few times.
        </p>
      </div>
      <button onClick={getInsight} disabled={insightLoading}
        style={{...S.btn("linear-gradient(135deg,#8B5CF6,#A78BFA)","0 6px 20px #8B5CF644"),opacity:insightLoading?0.7:1}}>
        {insightLoading ? "Thinking..." : "Get a General Insight →"}
      </button>
      {insight && (
        <div style={{background:"linear-gradient(135deg,#F5F3FF,white)",borderRadius:16,padding:"18px",border:"1px solid #DDD6FE"}}>
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:14,color:"#374151",lineHeight:1.75,fontStyle:"italic"}}>"{insight}"</p>
        </div>
      )}
    </div>
  );

  const PATTERN_LABELS = {
    relapse_risk:       { label:"Return needed",      color:"#EF4444", bg:"#FEF2F2", icon:"⚠️" },
    strong_consistency: { label:"Strong consistency", color:"#10B981", bg:"#ECFDF5", icon:"💪" },
    weekend_drop:       { label:"Weekend pattern",    color:"#F59E0B", bg:"#FFFBEB", icon:"📅" },
    pillar_neglect:     { label:"Pillar neglect",     color:"#8B5CF6", bg:"#F5F3FF", icon:"🎯" },
    all_or_nothing:     { label:"All-or-nothing",     color:"#EC4899", bg:"#FDF2F8", icon:"🔄" },
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Streak */}
      <div style={S.card}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Streak Analysis</div>
        <div style={{display:"flex",gap:12}}>
          {[
            {label:"Current",value:analytics.streak?.currentStreak||0,color:"#10B981"},
            {label:"Longest",value:analytics.streak?.longestStreak||0,color:"#8B5CF6"},
            {label:"Total Days",value:analytics.streak?.totalDays||0,color:"#F59E0B"},
          ].map(item=>(
            <div key={item.label} style={{flex:1,textAlign:"center",background:"#f8f8f8",borderRadius:14,padding:"14px 8px"}}>
              <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:28,color:item.color,lineHeight:1}}>{item.value}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#aaa",marginTop:4,textTransform:"uppercase",letterSpacing:1}}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Consistency scores */}
      {Object.keys(analytics.consistency||{}).length > 0 && (
        <div style={S.card}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>7-Day Consistency</div>
          {Object.entries(analytics.consistency).map(([pillar,data])=>{
            const PILLARS_MAP = {fuel:"⚡",move:"💪",rest:"😴",calm:"🧘",connect:"🤝",focus:"🎯"};
            const colors = {fuel:"#F59E0B",move:"#10B981",rest:"#8B5CF6",calm:"#0EA5E9",connect:"#EC4899",focus:"#F97316"};
            return (
              <div key={pillar} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:16,width:20}}>{PILLARS_MAP[pillar]}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,fontWeight:600,color:"#333",textTransform:"capitalize"}}>{pillar}</span>
                    <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:colors[pillar],fontWeight:600}}>{data.label}</span>
                  </div>
                  <div style={{background:"#f0f0f0",borderRadius:4,height:6,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:4,background:colors[pillar]||"#10B981",width:`${data.score}%`,transition:"width 0.6s ease"}}/>
                  </div>
                </div>
                <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",width:32,textAlign:"right"}}>{data.days}/7</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Patterns detected */}
      {analytics.patterns?.length > 0 && (
        <div style={S.card}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Patterns Detected</div>
          {analytics.patterns.map((p,i)=>{
            const label = PATTERN_LABELS[p.type] || {label:p.type,color:"#666",bg:"#f8f8f8",icon:"📊"};
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,background:label.bg,marginBottom:8,border:`1px solid ${label.color}22`}}>
                <span style={{fontSize:18}}>{label.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:label.color}}>{label.label}</div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#666",marginTop:2}}>{p.message}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Predictive Nudge */}
      {nudge && (
        <div style={{background:"linear-gradient(135deg,#FFF7ED,white)",borderRadius:16,padding:"16px",border:"1.5px solid #FED7AA",display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:20,flexShrink:0}}>💡</span>
          <div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:11,color:"#F97316",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Today's Insight</div>
            <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.7}}>{nudge.text}</p>
            <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
              {nudge.pattern?.pillars?.map(p=>{
                const em={fuel:"⚡",move:"💪",rest:"😴",calm:"🧘",connect:"🤝",focus:"🎯"};
                return <span key={p} style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:20,padding:"2px 8px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#F97316",fontWeight:600}}>{em[p]} {p}</span>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cross-pillar patterns */}
      {crossPatterns?.patterns?.length > 0 && (
        <div style={S.card}>
          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>🔗 Cross-Pillar Patterns</div>
          {crossPatterns.patterns.map((p,i)=>{
            const isPositive = p.severity==="positive";
            return (
              <div key={i} style={{padding:"12px 14px",borderRadius:14,background:isPositive?"#ECFDF5":"#FFFBEB",border:`1px solid ${isPositive?"#A7F3D0":"#FDE68A"}`,marginBottom:8}}>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:isPositive?"#065F46":"#92400E",marginBottom:4}}>
                  {p.icon} {p.title}
                </div>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#555",lineHeight:1.6,marginBottom:6}}>{p.message}</div>
                {p.actionable&&<div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:isPositive?"#10B981":"#F59E0B",fontWeight:600}}>→ {p.suggestion}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Pillar ripple effect */}
      {crossPatterns?.ripple && (
        <PillarRipple ripple={crossPatterns.ripple} S={S}/>
      )}

      {/* AI Insight */}
      <div style={{...S.card,border:"1.5px solid #DDD6FE",background:"linear-gradient(135deg,#F5F3FF,white)"}}>
        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#6D28D9",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>🤖 AI Coach Insight</div>
        {insight ? (
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:14,color:"#374151",lineHeight:1.75,fontStyle:"italic"}}>"{insight}"</p>
        ) : (
          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa",lineHeight:1.6,marginBottom:12}}>Get a personalised insight based on your patterns — not generic advice.</p>
        )}
        <button onClick={getInsight} disabled={insightLoading}
          style={{...S.btn("linear-gradient(135deg,#8B5CF6,#A78BFA)","0 6px 20px #8B5CF644"),marginTop:12,opacity:insightLoading?0.7:1}}>
          {insightLoading ? "Thinking..." : insight ? "Get New Insight" : "Generate My Insight →"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [st, setSt]       = useState(()=>loadState()||initState());
  const [visible, setVisible] = useState(true);
  const [confetti, setConfetti] = useState([]);
  const [writeOwn, setWriteOwn] = useState({show:false,pid:null,val:""});
  const [weeklyStep, setWeeklyStep] = useState(0);
  const [showChangePillars, setShowChangePillars] = useState(false);
  const [miniAssessment, setMiniAssessment] = useState(null); // {pid, step, answers}
  const [pillarSuggestion, setPillarSuggestion] = useState(null); // {pillars, reasons, scores}
  const [exploreArticle, setExploreArticle] = useState(null);
  const [weeklyAnswers, setWeeklyAnswers] = useState({});
  const [showCoach, setShowCoach] = useState(null); // {title, message, onContinue}
  const [toast, setToast] = useState(null); // {message, color}
  const [lastQPid, setLastQPid] = useState(null);

  const stage = getStage(st.streak);

  const getWeekKey = () => {
    const d = new Date();
    const startOfYear = new Date(d.getFullYear(),0,1);
    const week = Math.ceil(((d-startOfYear)/86400000+startOfYear.getDay()+1)/7);
    return `${d.getFullYear()}-W${week}`;
  };

  useEffect(()=>{
    // Always compare using simple YYYY-MM-DD format
    const todayStr = new Date().toISOString().slice(0,10);
    const dayOfWeek = new Date().getDay();

    // Normalize lastDate to YYYY-MM-DD no matter what format it was saved in
    let lastStr = null;
    if (st.lastDate) {
      try {
        lastStr = new Date(st.lastDate).toISOString().slice(0,10);
      } catch {
        lastStr = null;
      }
    }

    const isNewDay = !lastStr || lastStr !== todayStr;

    if (isNewDay) {
      update({
        checkedToday: Object.fromEntries(PIDS.map(p=>[p,false])),
        fuel: {
          ...(st.fuel||{}),
          meals: [],
          waterGlasses: 0,
          waterDate: "",
        },
        move: {
          ...(st.move||{}),
          stepsToday: 0,
          stepsDate: "",
          workouts: (st.move?.workouts||[]).filter(w=>w.date===new Date().toISOString().slice(0,10)),
        },
        rest: {
          ...(st.rest||{}),
          windDown: [],
          quality: 0,
        },
        calm: {
          ...(st.calm||{}),
          stressLevel: 0,
          mood: "",
          gratitude: [],
          breathingDone: false,
          meditationMins: 0,
          calmActivities: [],
          calmDate: "",
        },
        connect: {
          ...(st.connect||{}),
          connections: [],
          socialBattery: 0,
          kindness: [],
          connectDate: "",
        },
        focus: {
          ...(st.focus||{}),
          mit: "",
          pomodoros: 0,
          distractions: [],
          deepWorkMins: 0,
          energyLevel: 0,
          tasks: (st.focus?.tasks||[]).map(t=>({...t,done:false})),
          focusDate: "",
        }
      });
    }

    // Show weekly check-in on Saturday
    const thisWeek = getWeekKey();
    const alreadyDone = st.impactHistory?.some(h=>h.week===thisWeek);
    if (dayOfWeek===6 && !alreadyDone && st.streak>0) {
      update({showWeeklyCheckin:true});
    }

    // Auto-suggest new pillars every 7 days (new week starting)
    const history = JSON.parse(localStorage.getItem(SAVE_KEY)||"{}").history || [];
    const totalDays = history.length;
    const suggestionDoneWeek = localStorage.getItem("coresix_suggestion_week");
    if (totalDays > 0 && totalDays % 7 === 0 && suggestionDoneWeek !== thisWeek) {
      localStorage.setItem("coresix_suggestion_week", thisWeek);
      const suggestion = suggestNextWeekPillars({}, history);
      setTimeout(()=>setPillarSuggestion(suggestion), 800);
    }
  },[]);


  useEffect(()=>{ saveState(st); },[st]);

  useEffect(()=>{
    if (st.screen==="splash") setTimeout(()=>goTo("welcome"),2200);
  },[]);

  const update = patch => setSt(prev=>({...prev,...patch}));

  // ── BACKEND SYNC ──────────────────────────────────────
  const syncUser = async (name, profile, scores) => {
    await api("POST", "/api/user", {
      deviceId: DEVICE_ID, name, profile, scores,
    });
  };

  const syncCheckin = async (pillar, habit, date) => {
    await api("POST", "/api/checkin", {
      deviceId: DEVICE_ID, pillar, habit, date,
    });
  };

  const syncStreak = async (streak, date) => {
    await api("POST", "/api/streak", {
      deviceId: DEVICE_ID, streak, date,
    });
  };

  const syncLadder = async (pillar, rung, days, selected) => {
    await api("POST", "/api/ladder", {
      deviceId: DEVICE_ID, pillar, rung, days, selected,
    });
  };

  const syncImpact = async (weekKey, answers) => {
    await api("POST", "/api/impact", {
      deviceId: DEVICE_ID, weekKey, answers,
    });
  };

  const fetchAIInsight = async (purpose, pillar) => {
    const id = localStorage.getItem("coresix_device_id");
    if (!id) return null;
    const res = await api("POST", "/api/insight", {
      deviceId: id, purpose, pillar,
    });
    return res?.content || null;
  };

  const [warnings, setWarnings] = useState([]);

  // Load predictive warnings on app start
  // Check if suggestion was flagged before reload
  useEffect(()=>{
    if (localStorage.getItem("coresix_show_suggestion") === "1") {
      localStorage.removeItem("coresix_show_suggestion");
      setTimeout(()=>{
        const suggestion = suggestNextWeekPillars(st.weeklyImpact||{}, st.history||[]);
        setPillarSuggestion(suggestion);
      }, 1200);
    }
  },[]);

  useEffect(()=>{
    const loadWarnings = async () => {
      const id = localStorage.getItem("coresix_device_id");
      if (!id) return;
      // Only load warnings after 7+ days of use
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY)||"{}");
      const history = saved.history || [];
      if (history.length < 7) return; // Not enough data yet
      const res = await api("GET", `/api/warnings/${id}`);
      if (res?.warnings?.length) setWarnings(res.warnings);
    };
    setTimeout(loadWarnings, 2000); // Load after app is ready
  },[]);

  const fetchCrossPatterns = async () => {
    const id = localStorage.getItem("coresix_device_id");
    if (!id) return null;
    return await api("GET", `/api/cross-patterns/${id}`);
  };

  const fetchPredictiveNudge = async () => {
    const id = localStorage.getItem("coresix_device_id");
    if (!id) return null;
    return await api("POST", "/api/predictive-nudge", {
      deviceId: id,
      currentPillarData: {
        fuel: st.fuel, move: st.move, rest: st.rest,
        calm: st.calm, connect: st.connect, focus: st.focus,
      }
    });
  };

  // Build rung context for AI coaches
  const buildRungContext = (pid) => {
    const ladder = st.ladder?.[pid] || {};
    const habits = ladder.habits || [];
    const rungNum = ladder.rung || 0;
    const rungNames = [
      "Rung 1 — Foundation",
      "Rung 2 — Awareness & Mindfulness",
      "Rung 3 — Quality",
      "Rung 4 — Planning & Systems",
      "Rung 5 — Mastery",
    ];
    const mastered = habits.filter(h=>h.mastered);
    const building = habits.filter(h=>!h.mastered);
    return {
      rung_num: rungNum,
      rung_name: rungNames[rungNum] || "Rung 1 — Foundation",
      mastered_count: mastered.length,
      active_habits: habits.map(h=>`"${h.habit}" (${h.checkins||0}/5 check-ins${h.mastered?" ✅":""})`).join(", "),
      mastered_habits: mastered.map(h=>`"${h.habit}"`).join(", ") || "none yet",
      building_habits: building.map(h=>`"${h.habit}" — ${h.checkins||0}/5`).join(", ") || "none",
      rung_complete: mastered.length >= 3,
    };
  };

  const fetchWeeklyReport = async () => {
    const id = localStorage.getItem("coresix_device_id");
    if (!id) return null;
    const weekData = {
      fuel: st.fuel || {},
      move: st.move || {},
      rest: st.rest || {},
      calm: st.calm || {},
      connect: st.connect || {},
      focus: st.focus || {},
      streak: st.streak,
      activePillars: activePids,
      weeklyImpact: st.weeklyImpact || {},
    };
    return await api("POST", "/api/weekly-report", { deviceId: id, weekData });
  };

  const fetchAnalytics = async () => {
    const id = localStorage.getItem("coresix_device_id");
    if (!id) return null;
    return await api("GET", `/api/analytics/${id}`);
  };

  const showToast = (message, color="#10B981", duration=3000) => {
    setToast({message, color});
    setTimeout(()=>setToast(null), duration);
  };

  const resetApp = () => {
    if (window.confirm("Reset CoreSix? This will clear all your progress, streak and history.")) {
      localStorage.removeItem(SAVE_KEY);
      setSt(initState());
      setShowCoach(null);
      setShowChangePillars(false);
      setWriteOwn({show:false,pid:null,val:""});
      setWeeklyStep(0);
      setWeeklyAnswers({});
      setTimeout(()=>goTo("welcome"), 100);
    }
  };

  const goTo = screen => {
    setVisible(false);
    setTimeout(()=>{ update({screen}); setVisible(true); },260);
  };

  const boom = () => {
    const c = Array.from({length:28},(_,i)=>({id:Date.now()+i,x:15+Math.random()*70,y:10+Math.random()*50,color:Object.values(PILLARS)[Math.floor(Math.random()*6)].color,size:4+Math.random()*9,vx:(Math.random()-.5)*220,vy:-(70+Math.random()*140)}));
    setConfetti(c);
    setTimeout(()=>setConfetti([]),1500);
  };

  const showCoaching = (title, message, onContinue, opts={}) => {
    setShowCoach({title, message, onContinue, ...opts});
  };

  // ── WEEKLY PILLAR SUGGESTION ENGINE ─────────────────────
  const suggestNextWeekPillars = (weeklyAnswers, history) => {
    const PILLAR_NAMES = {fuel:"Fuel",move:"Move",rest:"Rest",calm:"Calm",connect:"Connect",focus:"Focus"};
    const PILLAR_REASONS = {
      fuel:    "Your energy and nutrition need attention",
      move:    "Movement will boost your energy and mood",
      rest:    "Sleep affects everything — it needs focus",
      calm:    "Your stress levels need attention",
      connect: "Connection has been low recently",
      focus:   "Your focus and clarity need work",
    };

    const recentHistory = (history||[]).slice(-7);

    // Score each pillar — lower score = higher priority
    const scores = {};
    PIDS.forEach(pid => {
      let score = st.scores?.[pid] || 2;

      // Adjust by weekly impact rating
      if (weeklyAnswers[pid] !== undefined) {
        score = (score + weeklyAnswers[pid]) / 2;
      }

      // Boost priority if not worked on recently
      const recentDays = recentHistory.filter(h=>h.pillars?.includes(pid)).length;
      if (recentDays === 0) score -= 0.8;
      else if (recentDays <= 2) score -= 0.3;

      // Cross-pillar ripple effect
      const RIPPLE = {rest:["focus","calm"],move:["calm"],calm:["connect","focus"]};
      if (RIPPLE[pid]) {
        RIPPLE[pid].forEach(affected => {
          if (weeklyAnswers[affected] !== undefined && weeklyAnswers[affected] <= 1) {
            score -= 0.3;
          }
        });
      }

      scores[pid] = score;
    });

    // Sort lowest score = highest priority
    const sorted = [...PIDS].sort((a,b)=>scores[a]-scores[b]);
    const top3 = sorted.slice(0,3);

    // Build reasons
    const reasons = {};
    top3.forEach(pid => {
      const recentDays = recentHistory.filter(h=>h.pillars?.includes(pid)).length;
      const weekScore = weeklyAnswers?.[pid];
      if (weekScore !== undefined && weekScore <= 1) {
        reasons[pid] = "Rated low this week — needs attention";
      } else if (recentDays === 0) {
        reasons[pid] = "Not worked on recently — time to focus here";
      } else if (recentDays <= 2) {
        reasons[pid] = "Low activity last week — worth prioritising";
      } else {
        reasons[pid] = PILLAR_REASONS[pid];
      }
    });

    return { pillars: top3, reasons, scores };
  };

  const getWeakest3 = () => {
    const scores=st.scores;
    if(!Object.keys(scores).length) return PIDS.slice(0,3);
    return [...PIDS].sort((a,b)=>(scores[a]||3)-(scores[b]||3)).slice(0,3);
  };
  const activePids = st.selectedPillars || getWeakest3();
  const done3 = activePids.filter(pid=>st.checkedToday[pid]).length;
  const allDoneToday = done3 >= activePids.length && activePids.length > 0;
  const pct = activePids.length ? Math.round((done3/activePids.length)*100) : 0;

  // ── Q ANSWER ──
  const handleQAnswer = (qId, aIdx, score) => {
    const newAnswers = {...st.qAnswers,[qId]:aIdx};
    const newScores = score ? {...st.scores,[qId]:score} : st.scores;
    const newProfile = {...st.profile};
    const q = QUESTIONNAIRE.find(x=>x.id===qId);
    if (q) newProfile[qId] = q.answers[aIdx].t;
    const nextIdx = st.qIndex+1;

    // Show pillar coaching after pillar questions
    const pillarIds = ["fuel","move","rest","calm","connect","focus"];
    if (pillarIds.includes(qId) && score) {
      const isLow = score <= 2;
      const coaching = COACHING.q_coaching[qId]?.[isLow?"low":"high"];
      if (coaching) {
        update({qAnswers:newAnswers,scores:newScores,profile:newProfile});
        const p = PILLARS[qId];
        showCoaching(
          `${p.emoji} ${p.name}`,
          coaching,
          ()=>{ setShowCoach(null); update({qIndex:nextIdx}); },
          {icon:null,color:p.color,bg:`linear-gradient(135deg,${p.light},white)`,border:p.border}
        );
        return;
      }
    }

    if (nextIdx>=QUESTIONNAIRE.length) {
      update({qAnswers:newAnswers,scores:newScores,profile:newProfile});
      // Sync to backend
      syncUser(st.name, newProfile, newScores);
      setTimeout(()=>goTo("profile_reveal"),200);
    } else {
      update({qAnswers:newAnswers,scores:newScores,profile:newProfile,qIndex:nextIdx});
    }
  };

  // ── CHECK IN ──
  const handleCheckIn = pid => {
    const newChecked = {...st.checkedToday,[pid]:true};
    const today = new Date().toISOString().split('T')[0];
    
    // Update ladder - increment days AND per-habit checkins
    const ladder = st.ladder[pid];
    const selected = ladder.selected;
    const habits = ladder.habits || [];
    const updatedHabits = habits.map(h => {
      if (h.habit === selected) {
        const newCheckins = (h.checkins||0) + 1;
        return {...h, checkins: newCheckins, mastered: newCheckins >= 5};
      }
      return h;
    });
    const newLadder = {...st.ladder,[pid]:{...ladder, days:(ladder.days||0)+1, habits:updatedHabits}};
    const allDone = activePids.every(p=>p===pid||newChecked[p]);
    const newStreak = allDone ? st.streak+1 : st.streak;
    const coachMsg = getRand(COACHING.checkin_coaching);
    // Sync to backend
    syncCheckin(pid, st.ladder[pid].selected || "", today);
    if (allDone) syncStreak(newStreak, today);

    if (allDone) {
      boom();
      const hist = [...st.history,{date:today,day:new Date().toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"}),pillars:activePids,streak:newStreak}];
      update({checkedToday:newChecked,ladder:newLadder,streak:newStreak,lastDate:today,history:hist.slice(-30)});
      const celCoach = getRand(COACHING.celebrate);
      showCoaching(
        celCoach.title,
        celCoach.message,
        ()=>{ setShowCoach(null); goTo("celebrate"); },
        {icon:"🏆",color:"#10B981",bg:"linear-gradient(135deg,#ECFDF5,#EFF6FF)",border:"#A7F3D0"}
      );
    } else {
      update({checkedToday:newChecked,ladder:newLadder,lastDate:today});
      showCoaching(
        coachMsg.title,
        coachMsg.message,
        ()=>setShowCoach(null),
        {icon:"✅",color:"#10B981",bg:"linear-gradient(135deg,#ECFDF5,white)",border:"#A7F3D0",continueLabel:"Keep going →"}
      );
    }
  };

  // ── UNLOCK ──
  const handleUnlock = pid => {
    const rung = st.ladder[pid].rung;
    if (rung>=4) return;
    const ladder = st.ladder[pid];
    const habits = ladder.habits || [];
    const masteredCount = habits.filter(h=>h.mastered).length;
    const minMastered = 3;
    if (masteredCount < minMastered) {
      const needed = minMastered - masteredCount;
      showToast(`⏳ Master ${needed} more habit${needed>1?"s":""} first (${masteredCount}/${minMastered} done)`, "#8B5CF6", 3000);
      return;
    }
    setMiniAssessment({pid, step:0, answers:[], rung});
  };

  // ── COMPLETE MINI ASSESSMENT ──
  const completeMiniAssessment = (pid, answers) => {
    const rung = st.ladder[pid].rung;
    // Calculate new score from answers (0-3 scale)
    const avgAnswer = answers.reduce((a,b)=>a+b,0) / answers.length;
    const newScore = Math.min(4, Math.round((avgAnswer + 1)));
    const oldScore = st.scores[pid] || 1;
    const improved = newScore > oldScore;

    setMiniAssessment(null);

    const unlockMsg = getRand(COACHING.unlock_coaching);
    const p = PILLARS[pid];

    showCoaching(
      improved
        ? `${p.emoji} Your ${p.name} score improved! ${oldScore}/4 → ${newScore}/4`
        : `${p.emoji} Rung ${rung+1} Complete!`,
      (improved
        ? `Real growth is happening. Your ${p.name} score moved from ${oldScore}/4 to ${newScore}/4 — that is not a number. That is who you are becoming.

`
        : "") + unlockMsg,
      ()=>{
        setShowCoach(null);
        const newLadder = {...st.ladder,[pid]:{...st.ladder[pid],rung:rung+1,days:0,selected:null}};
        const newScores = {...st.scores,[pid]:newScore};
        update({ladder:newLadder, scores:newScores});
        goTo(`pick_${pid}`);
      },
      {
        icon: improved ? "📈" : "🔓",
        color:"#8B5CF6",
        bg:"linear-gradient(135deg,#F5F3FF,white)",
        border:"#DDD6FE",
        continueLabel:"Pick my Rung " + (rung+2) + " habit →"
      }
    );
  };

  // ── SELECT HABIT ──
  const handleSelectHabit = (pid, habit) => {
    const rung = st.ladder[pid].rung;
    const rungCoach = COACHING.rung_coaching[pid]?.[rung];
    const p = PILLARS[pid];
    const ladder = st.ladder[pid];
    const habits = ladder.habits || [];
    // Add new habit to rung habits if not already there
    const alreadyAdded = habits.some(h=>h.habit===habit);
    const newHabits = alreadyAdded ? habits : [...habits, {habit, checkins:0, mastered:false}];
    update({ladder:{...st.ladder,[pid]:{...ladder, selected:habit, habits:newHabits}}});
    syncLadder(pid, rung, ladder.days||0, habit);
    if (rungCoach) {
      showCoaching(
        `${p.emoji} ${p.name} · ${LADDER[pid][rung].title}`,
        rungCoach + "\n\nYour habit:\n\"" + habit + "\"",
        ()=>{ setShowCoach(null); goTo("habits"); },
        {color:p.color,bg:`linear-gradient(135deg,${p.light},white)`,border:p.border,continueLabel:"I understand — let's begin →"}
      );
    } else {
      goTo("habits");
    }
  };

  // ── STYLES ──
  const S = {
    page: {minHeight:"100vh",padding:"40px 22px 24px",display:"flex",flexDirection:"column",gap:16},
    card: {background:"white",borderRadius:20,padding:"18px",border:"1.5px solid #f0f0f0",boxShadow:"0 4px 20px #0001"},
    badge:(color,bg)=>({display:"inline-flex",background:bg||"#ECFDF5",borderRadius:20,padding:"5px 14px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:color||"#10B981",letterSpacing:2,textTransform:"uppercase",width:"fit-content",marginBottom:10}),
    h1: {fontFamily:"Fraunces,serif",fontWeight:900,fontSize:36,color:"#0f0f0f",letterSpacing:-1,lineHeight:1.1},
    h2: {fontFamily:"Fraunces,serif",fontWeight:800,fontSize:26,color:"#0f0f0f",letterSpacing:-0.5,lineHeight:1.2},
    sub: {fontFamily:"Plus Jakarta Sans,sans-serif",color:"#888",fontSize:13,lineHeight:1.7,marginTop:6},
    btn:(grad,shadow)=>({width:"100%",padding:"15px",borderRadius:16,border:"none",background:grad||"linear-gradient(135deg,#0f0f0f,#2d2d2d)",color:"white",fontSize:15,fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,cursor:"pointer",boxShadow:shadow||"0 8px 24px #0002",letterSpacing:0.3,transition:"all 0.2s"}),
    btnGhost:{width:"100%",padding:"14px",borderRadius:14,border:"1.5px solid #e8e8e8",background:"white",color:"#666",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:14,fontWeight:500,cursor:"pointer"},
    input:{width:"100%",background:"white",border:"1.5px solid #e8e8e8",borderRadius:14,padding:"14px 18px",color:"#0f0f0f",fontSize:15,fontFamily:"Plus Jakarta Sans,sans-serif",boxShadow:"0 2px 8px #0001"},
  };

  const curQ = QUESTIONNAIRE[st.qIndex];
  const morningWisdom = COACHING.morning[st.streak % COACHING.morning.length];

  return (
    <div style={{minHeight:"100vh",background:"#FAFAF8",fontFamily:"Plus Jakarta Sans,sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        body{background:#FAFAF8;overscroll-behavior:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes floatSlow{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(2deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes confetti{0%{opacity:1;transform:translate(0,0) rotate(0deg)}100%{opacity:0;transform:translate(var(--vx),var(--vy)) rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        .fu{animation:fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both}
        .tap:active{transform:scale(0.96)!important}
        input:focus{outline:none;border-color:#10B981!important;box-shadow:0 0 0 3px #10B98118!important}
        textarea:focus{outline:none;border-color:#10B981!important}
        ::-webkit-scrollbar{width:0}
      `}</style>

      {/* Background orbs */}
      <div style={{position:"fixed",top:"-15%",right:"-10%",width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle,#10B98106,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:"-15%",left:"-10%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,#8B5CF606,transparent 70%)",pointerEvents:"none"}}/>

      {/* Confetti */}
      {confetti.map(c=>(
        <div key={c.id} style={{position:"fixed",left:`${c.x}%`,top:`${c.y}%`,width:c.size,height:c.size,borderRadius:"50%",background:c.color,"--vx":`${c.vx}px`,"--vy":`${c.vy}px`,animation:"confetti 1.4s ease-out forwards",pointerEvents:"none",zIndex:999}}/>
      ))}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:500,background:toast.color||"#10B981",color:"white",borderRadius:16,padding:"14px 24px",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:14,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",animation:"slideUp 0.3s ease",maxWidth:380,textAlign:"center"}}>
          {toast.message}
        </div>
      )}

      {/* ── WEEKLY CHECK-IN OVERLAY ── */}
      {st.showWeeklyCheckin && st.screen!=="splash" && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
          <div style={{width:"100%",maxWidth:430,background:"white",borderRadius:"24px 24px 0 0",padding:"28px 22px 40px",maxHeight:"85vh",overflowY:"auto",animation:"slideUp 0.35s cubic-bezier(0.16,1,0.3,1)"}}>
            {weeklyStep < activePids.length ? (()=>{
              const pid = activePids[weeklyStep];
              const p = PILLARS[pid];
              const iq = IMPACT_QUESTIONS[pid];
              return (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                    <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,textTransform:"uppercase"}}>Week in review · {weeklyStep+1} of {activePids.length}</div>
                    <div style={{display:"flex",gap:6}}>
                      {activePids.map((_,i)=>(
                        <div key={i} style={{width:6,height:6,borderRadius:"50%",background:i<=weeklyStep?"#10B981":"#e5e5e5",transition:"all 0.3s"}}/>
                      ))}
                    </div>
                  </div>
                  <div style={{textAlign:"center",marginBottom:24}}>
                    <div style={{width:60,height:60,borderRadius:18,background:p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 14px",boxShadow:`0 6px 20px ${p.color}44`}}>{p.emoji}</div>
                    <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f",marginBottom:6}}>{p.name}</div>
                    <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:15,color:"#555",lineHeight:1.5}}>{iq.question}</p>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                    {iq.options.map((opt,i)=>(
                      <button key={i} className="tap" onClick={()=>{
                        const newAnswers = {...weeklyAnswers,[pid]:i};
                        setWeeklyAnswers(newAnswers);
                        if (weeklyStep+1 >= activePids.length) {
                          // Save impact data
                          const week = getWeekKey();
                          const newImpact = {...st.weeklyImpact,...newAnswers};
                          const newHistory = [...(st.impactHistory||[]),{week,answers:newAnswers,date:new Date().toLocaleDateString("en",{month:"short",day:"numeric"}),streak:st.streak}];
                          update({weeklyImpact:newImpact,impactHistory:newHistory.slice(-12),showWeeklyCheckin:false});
                          syncImpact(week, newAnswers);
                          // Generate pillar suggestion for next week
                          const suggestion = suggestNextWeekPillars(newAnswers, newHistory);
                          setPillarSuggestion(suggestion);
                          setWeeklyStep(0);
                          setWeeklyAnswers({});
                          goTo("weekly_summary");
                        } else {
                          setWeeklyStep(s=>s+1);
                        }
                      }} style={{padding:"16px 12px",borderRadius:16,border:`1.5px solid ${weeklyAnswers[pid]===i?p.color:"#f0f0f0"}`,background:weeklyAnswers[pid]===i?p.light:"white",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all 0.2s",boxShadow:weeklyAnswers[pid]===i?`0 4px 16px ${p.color}22`:"none"}}>
                        <span style={{fontSize:26}}>{opt.emoji}</span>
                        <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,fontWeight:600,color:weeklyAnswers[pid]===i?p.color:"#555",textAlign:"center",lineHeight:1.3}}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  <button className="tap" onClick={()=>{update({showWeeklyCheckin:false});setWeeklyStep(0);setWeeklyAnswers({});}} style={{width:"100%",padding:"13px",borderRadius:14,border:"1.5px solid #e8e8e8",background:"transparent",color:"#aaa",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,cursor:"pointer"}}>
                    Skip this week
                  </button>
                </div>
              );
            })() : null}
          </div>
        </div>
      )}

      {/* ── WEEKLY PILLAR SUGGESTION OVERLAY ── */}
      {pillarSuggestion && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:350,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
          <div style={{width:"100%",maxWidth:430,background:"white",borderRadius:"24px 24px 0 0",padding:"28px 22px 40px",maxHeight:"90vh",overflowY:"auto",animation:"slideUp 0.35s cubic-bezier(0.16,1,0.3,1)"}}>

            {/* Header */}
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"#10B981",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Next Week</div>
              <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:24,color:"#0f0f0f",letterSpacing:-0.5,marginBottom:6}}>CoreSix suggests these 3 pillars</div>
              <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",lineHeight:1.6}}>Based on this week's ratings and your patterns. You can confirm or choose your own.</p>
            </div>

            {/* Suggested pillars */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              {pillarSuggestion.pillars.map((pid,i)=>{
                const p = PILLARS[pid];
                const reason = pillarSuggestion.reasons[pid];
                return (
                  <div key={pid} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:16,background:p.light,border:`1.5px solid ${p.border}`}}>
                    <div style={{width:46,height:46,borderRadius:13,background:p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:`0 4px 12px ${p.color}33`}}>{p.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:14,color:"#0f0f0f"}}>{p.name}</span>
                        <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,fontWeight:600,color:"#10B981",background:"#ECFDF5",borderRadius:6,padding:"2px 6px"}}>#{i+1} priority</span>
                      </div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#666",lineHeight:1.4}}>{reason}</div>
                    </div>
                    <div style={{fontSize:20,color:p.color}}>✓</div>
                  </div>
                );
              })}
            </div>

            {/* All pillars — let user swap */}
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",fontWeight:600,marginBottom:10}}>OR CHOOSE YOUR OWN:</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {PIDS.filter(pid=>!pillarSuggestion.pillars.includes(pid)).map(pid=>{
                  const p = PILLARS[pid];
                  return (
                    <button key={pid} onClick={()=>{
                      // Swap this pillar with the lowest priority suggested one
                      const newPillars = [...pillarSuggestion.pillars];
                      newPillars[2] = pid; // Replace last suggested
                      setPillarSuggestion({...pillarSuggestion, pillars:newPillars});
                    }} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:14,border:"1.5px solid #f0f0f0",background:"white",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                      <div style={{width:36,height:36,borderRadius:10,background:p.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:"#0f0f0f"}}>{p.name}</div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>{p.desc}</div>
                      </div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#10B981",background:"#ECFDF5",borderRadius:6,padding:"3px 8px",fontWeight:600}}>Add →</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={()=>{
                update({selectedPillars: pillarSuggestion.pillars});
                setPillarSuggestion(null);
                showToast(`✅ Next week's pillars set: ${pillarSuggestion.pillars.map(p=>PILLARS[p].emoji).join(" ")}`, "#10B981");
              }} style={S.btn("linear-gradient(135deg,#10B981,#0EA5E9)","0 8px 24px #10B98144")}>
                ✅ Confirm These 3 Pillars for Next Week →
              </button>
              <button onClick={()=>{
                setPillarSuggestion(null);
                showToast("Pillars unchanged — you can change them anytime from Home", "#aaa");
              }} style={{...S.btnGhost,fontSize:13}}>
                Keep current pillars
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MINI ASSESSMENT OVERLAY ── */}
      {miniAssessment && (()=>{
        const { pid, step, answers, rung } = miniAssessment;
        const p = PILLARS[pid];
        const assessment = MINI_ASSESSMENTS[pid];
        const q = assessment?.questions[step];
        const totalSteps = assessment?.questions.length || 2;
        const isLast = step === totalSteps - 1;

        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
            <div style={{width:"100%",maxWidth:430,background:"white",borderRadius:"24px 24px 0 0",padding:"28px 22px 40px",animation:"slideUp 0.35s cubic-bezier(0.16,1,0.3,1)"}}>

              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Progress Check · {step+1} of {totalSteps}</div>
                  <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:20,color:"#0f0f0f"}}>{assessment?.title}</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {Array.from({length:totalSteps},(_,i)=>(
                    <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<=step?p.color:"#e5e5e5",transition:"all 0.3s"}}/>
                  ))}
                </div>
              </div>

              {/* Intro on first step */}
              {step===0 && (
                <div style={{background:p.light,borderRadius:14,padding:"12px 14px",border:`1px solid ${p.border}`,marginBottom:16}}>
                  <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#444",lineHeight:1.6}}>{assessment?.intro}</p>
                </div>
              )}

              {/* Question */}
              <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:15,color:"#0f0f0f",lineHeight:1.5,marginBottom:16,fontWeight:500}}>{q?.q}</p>

              {/* Options */}
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
                {q?.options.map((opt,i)=>(
                  <button key={i} onClick={()=>{
                    const newAnswers = [...answers, opt.s];
                    if (isLast) {
                      completeMiniAssessment(pid, newAnswers, rung);
                    } else {
                      setMiniAssessment({pid, step:step+1, answers:newAnswers, rung});
                    }
                  }} style={{padding:"14px 16px",borderRadius:14,border:`1.5px solid #f0f0f0`,background:"white",cursor:"pointer",textAlign:"left",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:14,color:"#333",lineHeight:1.5,transition:"all 0.2s",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:20,height:20,borderRadius:"50%",border:"2px solid #ddd",flexShrink:0}}/>
                    {opt.t}
                  </button>
                ))}
              </div>

              <button onClick={()=>setMiniAssessment(null)} style={{width:"100%",padding:"13px",borderRadius:14,border:"1.5px solid #e8e8e8",background:"transparent",color:"#aaa",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,cursor:"pointer"}}>
                Not ready yet
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── CHANGE PILLARS OVERLAY ── */}
      {showChangePillars && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:250,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={e=>{if(e.target===e.currentTarget)setShowChangePillars(false)}}>
          <div style={{width:"100%",maxWidth:430,background:"white",borderRadius:"24px 24px 0 0",padding:"28px 22px 40px",animation:"slideUp 0.35s cubic-bezier(0.16,1,0.3,1)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <h3 style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:"#0f0f0f"}}>Change Today's Pillars</h3>
              <button onClick={()=>setShowChangePillars(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#aaa"}}>✕</button>
            </div>
            <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa",marginBottom:20,lineHeight:1.5}}>Pick exactly 3 pillars to focus on today. CoreSix recommends your 3 weakest — but you know your day best.</p>

            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              {PIDS.map(pid=>{
                const p=PILLARS[pid];
                const ladder=st.ladder[pid];
                const isSelected=(st.selectedPillars||getWeakest3()).includes(pid);
                const isWeakest=getWeakest3().includes(pid);
                const current=st.selectedPillars||getWeakest3();
                return (
                  <button key={pid} className="tap" onClick={()=>{
                    let next;
                    if (isSelected) {
                      if (current.length<=1) return; // must keep at least 1
                      next = current.filter(p=>p!==pid);
                    } else {
                      if (current.length>=3) {
                        next = [...current.slice(1),pid]; // replace oldest
                      } else {
                        next = [...current,pid];
                      }
                    }
                    update({selectedPillars:next});
                  }} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:16,border:`1.5px solid ${isSelected?p.color:"#f0f0f0"}`,background:isSelected?p.light:"white",cursor:"pointer",transition:"all 0.2s",textAlign:"left"}}>
                    <div style={{width:42,height:42,borderRadius:12,background:isSelected?p.grad:p.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,transition:"all 0.2s"}}>{p.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:14,color:isSelected?p.color:"#0f0f0f"}}>{p.name}</span>
                        {isWeakest&&<span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,fontWeight:600,color:"#10B981",background:"#ECFDF5",borderRadius:6,padding:"2px 6px"}}>Recommended</span>}
                      </div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa",marginTop:2}}>Rung {ladder.rung+1}/5 · {ladder.days} days on this habit</div>
                    </div>
                    <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${isSelected?p.color:"#ddd"}`,background:isSelected?p.color:"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                      {isSelected&&<div style={{width:8,height:8,borderRadius:"50%",background:"white"}}/>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{display:"flex",gap:10}}>
              <button className="tap" onClick={()=>{update({selectedPillars:null});setShowChangePillars(false);}} style={{flex:1,padding:"13px",borderRadius:14,border:"1.5px solid #e8e8e8",background:"white",color:"#666",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,cursor:"pointer"}}>
                Reset to recommended
              </button>
              <button className="tap" onClick={()=>setShowChangePillars(false)} style={{flex:2,padding:"13px",borderRadius:14,border:"none",background:"#0f0f0f",color:"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                Confirm →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WEEKLY PILLAR SUGGESTION OVERLAY ── */}
      {pillarSuggestion && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:350,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
          <div style={{width:"100%",maxWidth:430,background:"white",borderRadius:"24px 24px 0 0",padding:"28px 22px 40px",maxHeight:"90vh",overflowY:"auto",animation:"slideUp 0.35s cubic-bezier(0.16,1,0.3,1)"}}>

            {/* Header */}
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"#10B981",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Next Week</div>
              <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:24,color:"#0f0f0f",letterSpacing:-0.5,marginBottom:6}}>CoreSix suggests these 3 pillars</div>
              <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",lineHeight:1.6}}>Based on this week's ratings and your patterns. You can confirm or choose your own.</p>
            </div>

            {/* Suggested pillars */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              {pillarSuggestion.pillars.map((pid,i)=>{
                const p = PILLARS[pid];
                const reason = pillarSuggestion.reasons[pid];
                return (
                  <div key={pid} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:16,background:p.light,border:`1.5px solid ${p.border}`}}>
                    <div style={{width:46,height:46,borderRadius:13,background:p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:`0 4px 12px ${p.color}33`}}>{p.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:14,color:"#0f0f0f"}}>{p.name}</span>
                        <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,fontWeight:600,color:"#10B981",background:"#ECFDF5",borderRadius:6,padding:"2px 6px"}}>#{i+1} priority</span>
                      </div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#666",lineHeight:1.4}}>{reason}</div>
                    </div>
                    <div style={{fontSize:20,color:p.color}}>✓</div>
                  </div>
                );
              })}
            </div>

            {/* All pillars — let user swap */}
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",fontWeight:600,marginBottom:10}}>OR CHOOSE YOUR OWN:</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {PIDS.filter(pid=>!pillarSuggestion.pillars.includes(pid)).map(pid=>{
                  const p = PILLARS[pid];
                  return (
                    <button key={pid} onClick={()=>{
                      // Swap this pillar with the lowest priority suggested one
                      const newPillars = [...pillarSuggestion.pillars];
                      newPillars[2] = pid; // Replace last suggested
                      setPillarSuggestion({...pillarSuggestion, pillars:newPillars});
                    }} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:14,border:"1.5px solid #f0f0f0",background:"white",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                      <div style={{width:36,height:36,borderRadius:10,background:p.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:"#0f0f0f"}}>{p.name}</div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>{p.desc}</div>
                      </div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#10B981",background:"#ECFDF5",borderRadius:6,padding:"3px 8px",fontWeight:600}}>Add →</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={()=>{
                update({selectedPillars: pillarSuggestion.pillars});
                setPillarSuggestion(null);
                showToast(`✅ Next week's pillars set: ${pillarSuggestion.pillars.map(p=>PILLARS[p].emoji).join(" ")}`, "#10B981");
              }} style={S.btn("linear-gradient(135deg,#10B981,#0EA5E9)","0 8px 24px #10B98144")}>
                ✅ Confirm These 3 Pillars for Next Week →
              </button>
              <button onClick={()=>{
                setPillarSuggestion(null);
                showToast("Pillars unchanged — you can change them anytime from Home", "#aaa");
              }} style={{...S.btnGhost,fontSize:13}}>
                Keep current pillars
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MINI ASSESSMENT OVERLAY ── */}
      {miniAssessment && (()=>{
        const { pid, step, answers } = miniAssessment;
        const p = PILLARS[pid];
        const questions = MINI_ASSESSMENT[pid] || [];
        const q = questions[step];
        const rung = st.ladder[pid]?.rung || 0;
        const totalSteps = questions.length;
        if (!q) return null;
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
            <div style={{width:"100%",maxWidth:430,background:"white",borderRadius:"24px 24px 0 0",padding:"28px 22px 40px",animation:"slideUp 0.35s cubic-bezier(0.16,1,0.3,1)"}}>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"#aaa",letterSpacing:2,textTransform:"uppercase"}}>
                  Progress check · {step+1} of {totalSteps}
                </div>
                <div style={{display:"flex",gap:6}}>
                  {questions.map((_,i)=>(
                    <div key={i} style={{width:6,height:6,borderRadius:"50%",background:i<=step?p.color:"#e5e5e5",transition:"all 0.3s"}}/>
                  ))}
                </div>
              </div>

              {/* Pillar badge */}
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <div style={{width:52,height:52,borderRadius:15,background:p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:`0 6px 20px ${p.color}44`}}>{p.emoji}</div>
                <div>
                  <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:18,color:"#0f0f0f"}}>7 days on {p.name}!</div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>Quick check — how has it gone?</div>
                </div>
              </div>

              {/* Question */}
              <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:15,color:"#333",lineHeight:1.6,marginBottom:18,fontWeight:500}}>{q.q}</p>

              {/* Options */}
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
                {q.options.map((opt,i)=>(
                  <button key={i} onClick={()=>{
                    const newAnswers = [...answers, i];
                    if (step + 1 >= totalSteps) {
                      completeMiniAssessment(pid, newAnswers);
                    } else {
                      setMiniAssessment({pid, step:step+1, answers:newAnswers});
                    }
                  }} style={{width:"100%",padding:"14px 18px",borderRadius:16,border:`1.5px solid ${p.border}`,background:p.light,cursor:"pointer",textAlign:"left",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:14,color:p.color,fontWeight:500,lineHeight:1.4,transition:"all 0.2s"}}>
                    {opt}
                  </button>
                ))}
              </div>

              <button onClick={()=>setMiniAssessment(null)} style={{width:"100%",padding:"13px",borderRadius:14,border:"1.5px solid #e8e8e8",background:"transparent",color:"#aaa",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,cursor:"pointer"}}>
                Not ready yet
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── COACHING OVERLAY ── */}
      {showCoach && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={e=>{if(e.target===e.currentTarget)setShowCoach(null)}}>
          <div style={{width:"100%",maxWidth:430,maxHeight:"85vh",overflowY:"auto",padding:"0 0 24px",animation:"slideUp 0.35s cubic-bezier(0.16,1,0.3,1)"}}>
            <div style={{padding:"20px 20px 0"}}>
              <CoachCard
                icon={showCoach.icon}
                title={showCoach.title}
                message={showCoach.message}
                color={showCoach.color||"#6D28D9"}
                bg={showCoach.bg||"linear-gradient(135deg,#F5F3FF,#EFF6FF)"}
                border={showCoach.border||"#DDD6FE"}
                onContinue={showCoach.onContinue}
                continueLabel={showCoach.continueLabel||"Continue →"}
              />
            </div>
          </div>
        </div>
      )}

      <div style={{width:"100%",maxWidth:430,margin:"0 auto",minHeight:"100vh",opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(14px)",transition:"all 0.26s cubic-bezier(0.16,1,0.3,1)"}}>

        {/* ── ARTICLE READER ── */}
      {exploreArticle && (
        <div style={{position:"fixed",inset:0,background:"white",zIndex:400,overflowY:"auto",animation:"slideUp 0.3s cubic-bezier(0.16,1,0.3,1)"}}>
          <div style={{maxWidth:430,margin:"0 auto",padding:"0 0 40px"}}>
            {/* Hero */}
            <div style={{background:exploreArticle.bg,padding:"48px 24px 28px",borderBottom:`1px solid ${exploreArticle.color}22`}}>
              <button onClick={()=>setExploreArticle(null)} style={{background:"none",border:"none",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:6}}>
                ← Back
              </button>
              <div style={{fontSize:44,marginBottom:14}}>{exploreArticle.emoji}</div>
              <div style={{display:"inline-flex",background:exploreArticle.color,borderRadius:20,padding:"4px 12px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"white",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{exploreArticle.tag}</div>
              <h1 style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:28,color:"#0f0f0f",letterSpacing:-0.5,lineHeight:1.2,marginBottom:8}}>{exploreArticle.title}</h1>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa"}}>{exploreArticle.duration} read</div>
            </div>
            {/* Content */}
            <div style={{padding:"28px 24px",display:"flex",flexDirection:"column",gap:24}}>
              {exploreArticle.content.map((section,i)=>(
                <div key={i}>
                  <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:18,color:"#0f0f0f",marginBottom:8,letterSpacing:-0.3}}>{section.heading}</div>
                  <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:15,color:"#444",lineHeight:1.8}}>{section.body}</p>
                </div>
              ))}
              {/* Bottom CTA */}
              <div style={{background:"linear-gradient(135deg,#F5F3FF,#EFF6FF)",borderRadius:18,padding:"20px",border:"1px solid #DDD6FE",marginTop:8}}>
                <p style={{fontFamily:"Fraunces,serif",fontSize:16,color:"#0f0f0f",lineHeight:1.5,fontStyle:"italic",marginBottom:12}}>"The smallest step forward is still forward."</p>
                <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#6D28D9",lineHeight:1.6}}>Built on research by BJ Fogg, James Clear, and behavioural science.</p>
              </div>
              <button onClick={()=>setExploreArticle(null)} style={{width:"100%",padding:"15px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#0f0f0f,#2d2d2d)",color:"white",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:15,cursor:"pointer"}}>
                Back to CoreSix →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {st.screen==="settings"&&(
        <div className="fu" style={S.page}>
          <h2 style={S.h1}>Settings</h2>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={S.card}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:15,color:"#0f0f0f",marginBottom:4}}>Your Profile</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",marginBottom:14}}>Name: {st.name} · Streak: {st.streak} days</div>
              <button className="tap" onClick={()=>{update({qIndex:0,qAnswers:{}});goTo("questionnaire");}} style={S.btn()}>📋 Re-take Assessment</button>
            </div>

            <div style={{...S.card,border:"1.5px solid #fee2e2"}}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:15,color:"#ef4444",marginBottom:4}}>Danger Zone</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",marginBottom:14}}>This will permanently delete all your progress, streak, history and habit selections.</div>
              <button className="tap" onClick={resetApp} style={{...S.btn("linear-gradient(135deg,#ef4444,#f87171)","0 8px 24px #ef444433")}}>🔄 Reset Everything & Start Over</button>
            </div>

            <div style={S.card}>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:15,color:"#0f0f0f",marginBottom:4}}>About CoreSix</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",lineHeight:1.7,marginBottom:10}}>
                <span style={{fontFamily:"Fraunces,serif",fontWeight:700,fontSize:14,color:"#0f0f0f",display:"block",marginBottom:6}}>"The app that connects the dots between your habits — and shows you what no other app can show you."</span>
                CoreSix is a wellness app, not a medical tool. Always consult your doctor for medical advice. Built on research by BJ Fogg, James Clear, and behavioural science.
              </div>

              {/* Ownership & Legal */}
              <div style={{background:"#f8f8f8",borderRadius:14,padding:"14px 16px",border:"1px solid #e8e8e8"}}>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:11,color:"#aaa",letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>© Intellectual Property</div>
                <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#888",lineHeight:1.7,marginBottom:8}}>
                  All content, systems and methodologies in CoreSix — including the six-pillar framework, the rung system, the 180 habit descriptions, the cross-pillar intelligence engine, and all coaching content — are proprietary and owned by CoreSix.
                </p>
                <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#888",lineHeight:1.7,marginBottom:8}}>
                  Users may not copy, reproduce, distribute or use any CoreSix content, habits, or systems outside of this application without express written permission.
                </p>
                <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#bbb",lineHeight:1.6}}>
                  © 2026 CoreSix. All rights reserved.
                </p>
              </div>

            </div>
          </div>

          {/* ── DEV TEST MODE ── */}
          <div style={{...S.card,border:"1.5px dashed #e8e8e8"}}>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#aaa",marginBottom:4}}>🛠 Test Mode</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#bbb",marginBottom:12,lineHeight:1.5}}>Simulate time passing to test the app without waiting for real days.</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button className="tap" onClick={()=>{
                const saved = JSON.parse(localStorage.getItem(SAVE_KEY)||"{}");
                const today = new Date().toISOString().slice(0,10);

                // 1. SAVE today's data to history first
                const activePids = saved.selectedPillars || ["fuel","move","rest"];
                const checkedToday = saved.checkedToday || {};
                const donePillars = activePids.filter(p=>checkedToday[p]);
                if (donePillars.length > 0) {
                  const newStreak = (saved.streak||0) + 1;
                  saved.streak = newStreak;
                  const newHistory = [...(saved.history||[]), {
                    date: today,
                    day: new Date().toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"}),
                    pillars: donePillars,
                    streak: newStreak,
                  }];
                  saved.history = newHistory.slice(-30);
                }

                // 2. Set lastDate to today so app thinks today already happened
                saved.lastDate = today;

                // 3. Clear all daily trackers for the new day
                saved.checkedToday = Object.fromEntries(["fuel","move","rest","calm","connect","focus"].map(p=>[p,false]));
                if (saved.fuel) { saved.fuel.meals=[]; saved.fuel.waterGlasses=0; saved.fuel.waterDate=""; }
                if (saved.move) { saved.move.stepsToday=0; saved.move.stepsDate=""; saved.move.workouts=[]; }
                if (saved.rest) { saved.rest.windDown=[]; saved.rest.quality=0; }
                if (saved.calm) { saved.calm.stressLevel=0; saved.calm.mood=""; saved.calm.gratitude=[]; saved.calm.calmActivities=[]; }
                if (saved.connect) { saved.connect.connections=[]; saved.connect.socialBattery=0; saved.connect.kindness=[]; }
                if (saved.focus) { saved.focus.mit=""; saved.focus.pomodoros=0; saved.focus.distractions=[]; saved.focus.tasks=(saved.focus.tasks||[]).map(t=>({...t,done:false})); }

                // 4. Check if new week — flag suggestion to show on reload
                const newTotalDays = (saved.history||[]).length;
                const weekNum = Math.floor(newTotalDays / 7);
                const lastSuggestionWeek = localStorage.getItem("coresix_last_suggestion_week");
                if (newTotalDays >= 7 && String(weekNum) !== lastSuggestionWeek) {
                  localStorage.setItem("coresix_show_suggestion", "1");
                  localStorage.setItem("coresix_last_suggestion_week", String(weekNum));
                }

                // 5. Save and reload
                localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
                window.location.reload();
              }} style={{...S.btnGhost,fontSize:12,padding:"10px"}}>📅 Simulate Next Day → Save & Reload</button>

              <button className="tap" onClick={()=>{
                setSt(prev=>({...prev,showWeeklyCheckin:true}));
                goTo("habits");
                showToast("📊 Weekly check-in triggered!", "#8B5CF6");
              }} style={{...S.btnGhost,fontSize:12,padding:"10px"}}>📊 Trigger Weekly Check-in</button>

              <button className="tap" onClick={()=>{
                setSt(prev=>({...prev,streak:prev.streak+7}));
                showToast("🔥 +7 days added to streak!", "#F59E0B");
              }} style={{...S.btnGhost,fontSize:12,padding:"10px"}}>🔥 Add 7 Days to Streak</button>

              <button className="tap" onClick={()=>{
                const today = new Date();
                const fakeDays = Array.from({length:7},(_,i)=>{
                  const d = new Date(today);
                  d.setDate(d.getDate()-6+i);
                  return {date:d.toISOString().slice(0,10),day:d.toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"}),pillars:PIDS.slice(0,3),streak:st.streak+i+1};
                });
                setSt(prev=>({...prev,streak:prev.streak+7,history:[...(prev.history||[]),...fakeDays].slice(-30),weeklyImpact:{fuel:2,move:3,rest:1,calm:2,connect:1,focus:3},impactHistory:[...(prev.impactHistory||[]),{week:"2026-W22",answers:{fuel:2,move:3,rest:1,calm:2,connect:1,focus:3},date:today.toLocaleDateString("en",{month:"short",day:"numeric"}),streak:prev.streak+7}].slice(-12)}));
                showToast("🧠 Full week simulated — check Brain tab!", "#6D28D9");
              }} style={{...S.btnGhost,fontSize:12,padding:"10px"}}>🧠 Simulate Full Week of Data</button>


              <button className="tap" onClick={()=>{
                // Simulate 30 days of history for monthly letter testing
                const today = new Date();
                const fakeDays = Array.from({length:30},(_,i)=>{
                  const d = new Date(today);
                  d.setDate(d.getDate()-29+i);
                  return {
                    date: d.toISOString().slice(0,10),
                    day: d.toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"}),
                    pillars: ["fuel","move","rest"].slice(0, 1 + (i%3)),
                    streak: i+1,
                  };
                });
                setSt(prev=>({
                  ...prev,
                  streak: 30,
                  history: fakeDays,
                  weeklyImpact:{fuel:2,move:3,rest:2,calm:1,connect:2,focus:3},
                  impactHistory:[
                    {week:"2026-W20",answers:{fuel:2,move:2,rest:1,calm:1,focus:2},date:"May 10",streak:7},
                    {week:"2026-W21",answers:{move:3,rest:2,calm:2,connect:2},date:"May 17",streak:14},
                    {week:"2026-W22",answers:{fuel:2,move:3,rest:2,focus:3},date:"May 24",streak:21},
                    {week:"2026-W23",answers:{fuel:2,move:3,rest:2,calm:1,connect:2,focus:3},date:"May 31",streak:30},
                  ],
                }));
                showToast("📅 30 days simulated — Monthly Letter is now unlocked!", "#0f0f0f");
              }} style={{...S.btnGhost,fontSize:12,padding:"10px",border:"1.5px solid #0f0f0f",color:"#0f0f0f"}}>📅 Simulate 30 Days → Unlock Monthly Letter</button>

              <button className="tap" onClick={()=>{
                setSt(prev=>({...prev,streak:0,lastDate:null,history:[]}));
                showToast("Streak reset to 0", "#aaa");
              }} style={{...S.btnGhost,fontSize:12,padding:"10px",color:"#ef4444",border:"1.5px solid #fee2e2"}}>↩ Reset Streak Only</button>
            </div>
          </div>

          <button className="tap" onClick={()=>goTo("habits")} style={S.btnGhost}>← Back</button>
        </div>
      )}

      {/* ── SPLASH ── */}
        {st.screen==="splash"&&(
          <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
            <div style={{fontSize:60,animation:"floatSlow 3s ease-in-out infinite"}}>✦</div>
            <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:52,color:"#0f0f0f",letterSpacing:-2}}>CORE<span style={{color:"#10B981"}}>SIX</span></div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,letterSpacing:5,color:"#ccc",textTransform:"uppercase"}}>Your Wellness Story</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",marginTop:8,textAlign:"center",lineHeight:1.6,maxWidth:260}}>The app that connects the dots between your habits</div>
            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"rgba(255,255,255,0.25)",marginTop:16,textAlign:"center"}}>© 2026 CoreSix. All rights reserved.</div>
            <div style={{width:36,height:2,background:"linear-gradient(90deg,#10B981,#8B5CF6)",borderRadius:2,marginTop:6,animation:"pulse 2s infinite"}}/>
          </div>
        )}

        {/* ── WELCOME ── */}
        {st.screen==="welcome"&&(
          <div className="fu" style={S.page}>
            {/* Orbit */}
            <div style={{display:"flex",justifyContent:"center",padding:"8px 0"}}>
              <div style={{position:"relative",width:190,height:190}}>
                <div style={{position:"absolute",inset:12,borderRadius:"50%",border:"1.5px dashed #e8e8e8"}}/>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{width:70,height:70,borderRadius:"50%",background:"white",boxShadow:"0 8px 28px #0002",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
                    <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:26,color:"#0f0f0f",lineHeight:1}}>6</div>
                    <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:8,color:"#bbb",letterSpacing:2,textTransform:"uppercase"}}>pillars</div>
                  </div>
                </div>
                {PIDS.map((pid,i)=>{
                  const p=PILLARS[pid];
                  return <div key={pid} style={{position:"absolute",width:46,height:46,borderRadius:"50%",background:p.grad,boxShadow:`0 4px 14px ${p.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,left:`${50+43*Math.cos((i/6)*Math.PI*2-Math.PI/2)}%`,top:`${50+43*Math.sin((i/6)*Math.PI*2-Math.PI/2)}%`,transform:"translate(-50%,-50%)",animation:`float ${2.2+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}>{p.emoji}</div>;
                })}
              </div>
            </div>

            <div>
              <div style={{...S.h1,fontSize:40,lineHeight:1.05}}>Six pillars.<br/>One habit.<br/><span style={{background:"linear-gradient(135deg,#10B981,#0EA5E9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Every day.</span></div>
              <div style={{background:"linear-gradient(135deg,#0f0f0f,#1a1a1a)",borderRadius:16,padding:"16px 18px",marginTop:4}}>
                <p style={{fontFamily:"Fraunces,serif",fontSize:15,color:"white",lineHeight:1.6,fontStyle:"italic",marginBottom:6}}>"The app that connects the dots between your habits — and shows you what no other app can show you."</p>
                <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:1}}>Built on research by BJ Fogg, James Clear, and behavioural science.</p>
              </div>
            </div>

            {/* Before we begin coaching card */}
            <CoachCard
              icon="🧠"
              title={COACHING.welcome.title}
              message={COACHING.welcome.message}
              color="#6D28D9"
            />

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input value={st.name||""} onChange={e=>update({name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&st.name?.trim()&&(update({qIndex:0,qAnswers:{}}),goTo("questionnaire"))} placeholder="What should I call you?" style={S.input}/>
              <button className="tap" onClick={()=>{if(st.name?.trim()){update({qIndex:0,qAnswers:{}});goTo("questionnaire");}}} style={S.btn()}>I'm ready — let's begin →</button>
            </div>
          </div>
        )}

        {/* ── QUESTIONNAIRE ── */}
        {st.screen==="questionnaire"&&curQ&&(
          <div className="fu" style={S.page}>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div style={S.badge()}>Question {st.qIndex+1} of {QUESTIONNAIRE.length}</div>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",alignSelf:"center"}}>{Math.round((st.qIndex/QUESTIONNAIRE.length)*100)}%</div>
              </div>
              <div style={{background:"#f0f0f0",borderRadius:4,height:4,overflow:"hidden"}}>
                <div style={{height:"100%",background:"linear-gradient(90deg,#10B981,#0EA5E9)",width:`${(st.qIndex/QUESTIONNAIRE.length)*100}%`,transition:"width 0.4s ease",borderRadius:4}}/>
              </div>
            </div>

            <div style={{...S.card,textAlign:"center",padding:"28px 20px"}}>
              <div style={{fontSize:48,marginBottom:12,animation:"float 2s ease-in-out infinite"}}>{curQ.emoji}</div>
              <h2 style={{...S.h2,fontSize:20}}>{curQ.question}</h2>
              <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#ccc",marginTop:6}}>CoreSix is a wellness app, not a medical tool.</p>
            </div>

            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:16}}>
              {curQ.answers.map((a,i)=>(
                <button key={i} className="tap" onClick={()=>handleQAnswer(curQ.id,i,a.s)}
                  style={{width:"100%",padding:"16px 18px",borderRadius:16,border:"1.5px solid #f0f0f0",background:"white",cursor:"pointer",textAlign:"left",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:14,color:"#333",lineHeight:1.5,transition:"all 0.2s",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:22,height:22,borderRadius:"50%",border:"2px solid #ddd",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:"transparent"}}/>
                  </div>
                  {a.t}
                </button>
              ))}
            </div>

            {st.qIndex>0&&<button className="tap" onClick={()=>update({qIndex:st.qIndex-1})} style={S.btnGhost}>← Back</button>}
          </div>
        )}

        {/* ── PROFILE REVEAL ── */}
        {st.screen==="profile_reveal"&&(
          <div className="fu" style={S.page}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:52,marginBottom:12,animation:"float 2s ease-in-out infinite"}}>🎯</div>
              <h2 style={S.h1}>Your profile is ready.</h2>
              <p style={S.sub}>{COACHING.profile_reveal.prefix}</p>
            <div style={{background:"linear-gradient(135deg,#ECFDF5,#EFF6FF)",borderRadius:14,padding:"12px 16px",border:"1px solid #A7F3D0",marginTop:4}}>
              <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#065F46",lineHeight:1.6,fontStyle:"italic"}}>CoreSix connects the dots between your habits — and shows you what no other app can show you.</p>
            </div>
            </div>

            {/* Top 3 pillars */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[...PIDS].sort((a,b)=>(st.scores[a]||3)-(st.scores[b]||3)).slice(0,3).map((pid,i)=>{
                const p=PILLARS[pid]; const score=st.scores[pid]||1;
                return (
                  <div key={pid} style={{...S.card,display:"flex",alignItems:"center",gap:14,border:`1.5px solid ${p.border}`}}>
                    <div style={{width:46,height:46,borderRadius:13,background:p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:`0 4px 12px ${p.color}33`,flexShrink:0}}>{p.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:15,color:"#0f0f0f"}}>{p.name}</div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>{p.desc}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:p.color}}>{score}/4</div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#bbb",textTransform:"uppercase",letterSpacing:1}}>#{i+1} focus</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Why 3 coaching */}
            <CoachCard
              icon="🔬"
              title="Why these 3 pillars?"
              message={COACHING.profile_reveal.why_three}
              color="#0EA5E9"
              bg="linear-gradient(135deg,#F0F9FF,white)"
              border="#BAE6FD"
            />

            {/* B=MAP coaching */}
            <CoachCard
              icon="⚡"
              title="How CoreSix works"
              message={COACHING.profile_reveal.science_note}
              color="#F59E0B"
              bg="linear-gradient(135deg,#FFFBEB,white)"
              border="#FDE68A"
            />

            <button className="tap" onClick={()=>goTo("habits")} style={S.btn()}>Choose My First Habits →</button>
          </div>
        )}

        {/* ── HABITS ── */}
        {st.screen==="habits"&&(
          <div className="fu" style={S.page}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={S.badge()}>Day {st.streak+1}</div>
                <h2 style={S.h2}>Today's habits</h2>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                <button className="tap" onClick={()=>setShowChangePillars(true)} style={{background:"white",border:"1.5px solid #e8e8e8",borderRadius:12,padding:"7px 12px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:600,color:"#666",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  <span>⚙️</span> Change
                </button>
              <div style={{position:"relative",width:60,height:60}}>
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="24" fill="none" stroke="#f0f0f0" strokeWidth="4.5"/>
                  <circle cx="30" cy="30" r="24" fill="none" stroke="#10B981" strokeWidth="4.5" strokeDasharray={`${150.8*pct/100} 150.8`} strokeLinecap="round" transform="rotate(-90 30 30)" style={{transition:"stroke-dasharray 0.5s ease"}}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f"}}>{pct}%</div>
              </div>
              </div>
            </div>

            {/* Morning wisdom */}
            <div style={{background:"linear-gradient(135deg,#FFFBEB,#FFF7ED)",borderRadius:16,padding:"14px 18px",border:"1px solid #FDE68A",display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:16,flexShrink:0}}>☀️</span>
              <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#92400E",lineHeight:1.65,fontStyle:"italic"}}>{morningWisdom}</p>
            </div>

            {/* Daily quote — shows periodically */}
            {st.streak % 3 === 0 && st.streak > 0 && (()=>{
              const q = getDailyQuote(st.streak);
              return (
                <div style={{background:"linear-gradient(135deg,#1a1a1a,#0f0f0f)",borderRadius:16,padding:"16px 18px",display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:16,flexShrink:0,color:"rgba(255,255,255,0.3)"}}>✦</span>
                  <div>
                    <p style={{fontFamily:"Fraunces,serif",fontSize:14,color:"rgba(255,255,255,0.85)",lineHeight:1.6,fontStyle:"italic",marginBottom:4}}>"{q.quote}"</p>
                    <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:0.5}}>— {q.author}</p>
                  </div>
                </div>
              );
            })()}

            {/* Predictive Warnings */}
            {warnings.filter(w=>w.severity!=="positive").slice(0,1).map((w,i)=>(
              <div key={i} style={{background:w.severity==="high"?"linear-gradient(135deg,#FEF2F2,white)":"linear-gradient(135deg,#FFFBEB,white)",borderRadius:16,padding:"14px 16px",border:`1.5px solid ${w.severity==="high"?"#FECACA":"#FDE68A"}`,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18,flexShrink:0}}>{w.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:w.severity==="high"?"#EF4444":"#F59E0B",marginBottom:4}}>{w.title}</div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#555",lineHeight:1.6,marginBottom:6}}>{w.message}</div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:w.severity==="high"?"#EF4444":"#F59E0B",fontWeight:600}}>→ {w.suggestion}</div>
                </div>
                <button onClick={()=>setWarnings(prev=>prev.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:"#ddd",cursor:"pointer",fontSize:16,flexShrink:0}}>✕</button>
              </div>
            ))}

            {/* Positive warnings — personal best etc */}
            {warnings.filter(w=>w.severity==="positive").slice(0,1).map((w,i)=>(
              <div key={i} style={{background:"linear-gradient(135deg,#ECFDF5,white)",borderRadius:16,padding:"14px 16px",border:"1.5px solid #A7F3D0",display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18,flexShrink:0}}>{w.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#10B981",marginBottom:4}}>{w.title}</div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#555",lineHeight:1.6}}>{w.message}</div>
                </div>
                <button onClick={()=>setWarnings(prev=>prev.filter(w=>w.severity!=="positive"))} style={{background:"none",border:"none",color:"#ddd",cursor:"pointer",fontSize:16,flexShrink:0}}>✕</button>
              </div>
            ))}

            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:14,paddingBottom:16}}>
              {activePids.map((pid,i)=>{
                const p=PILLARS[pid];
                const ladder=st.ladder[pid];
                const isDone=st.checkedToday[pid];
                const rungData=LADDER[pid]?.[ladder.rung];
                const selected=ladder.selected;
                return (
                  <div key={pid} className="fu" style={{borderRadius:20,overflow:"hidden",boxShadow:isDone?`0 8px 28px ${p.color}22`:"0 4px 16px #0001",transition:"all 0.4s",animationDelay:`${i*0.08}s`}}>
                    <div style={{background:isDone?p.grad:"white",padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${isDone?p.color+"22":"#f5f5f5"}`,transition:"all 0.4s"}}>
                      <div style={{width:44,height:44,borderRadius:13,background:isDone?"rgba(255,255,255,0.25)":p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:isDone?"none":`0 4px 14px ${p.color}44`,flexShrink:0,transition:"all 0.4s"}}>{isDone?"✓":p.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:isDone?"rgba(255,255,255,0.8)":p.color,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{p.name}</div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:isDone?"rgba(255,255,255,0.6)":"#aaa"}}>
                        {(()=>{
                          const minDays = [7,14,21,30][ladder.rung]||7;
                          const pct = Math.min(100, Math.round((ladder.days/minDays)*100));
                          const canUnlock = ladder.days >= minDays;
                          return `Rung ${ladder.rung+1}/5 · ${ladder.days}/${minDays} days${canUnlock?" · 🔓 Ready!":""}`;
                        })()}
                      </div>
                      </div>
                      {pid==="fuel"&&<button onClick={(e)=>{e.stopPropagation();goTo("fuel_layer");}} style={{background:"#FFFBEB",border:"1.5px solid #FDE68A",borderRadius:8,padding:"4px 8px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,fontWeight:600,color:"#F59E0B",cursor:"pointer"}}>⚡ Track</button>}
                      {pid==="move"&&<button onClick={(e)=>{e.stopPropagation();goTo("move_layer");}} style={{background:"#ECFDF5",border:"1.5px solid #A7F3D0",borderRadius:8,padding:"4px 8px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,fontWeight:600,color:"#10B981",cursor:"pointer"}}>💪 Track</button>}
                      {pid==="rest"&&<button onClick={(e)=>{e.stopPropagation();goTo("rest_layer");}} style={{background:"#F5F3FF",border:"1.5px solid #DDD6FE",borderRadius:8,padding:"4px 8px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,fontWeight:600,color:"#8B5CF6",cursor:"pointer"}}>😴 Track</button>}
                      {pid==="calm"&&<button onClick={(e)=>{e.stopPropagation();goTo("calm_layer");}} style={{background:"#F0F9FF",border:"1.5px solid #BAE6FD",borderRadius:8,padding:"4px 8px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,fontWeight:600,color:"#0EA5E9",cursor:"pointer"}}>🧘 Track</button>}
                      {pid==="connect"&&<button onClick={(e)=>{e.stopPropagation();goTo("connect_layer");}} style={{background:"#FDF2F8",border:"1.5px solid #FBCFE8",borderRadius:8,padding:"4px 8px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,fontWeight:600,color:"#EC4899",cursor:"pointer"}}>🤝 Track</button>}
                      {pid==="focus"&&<button onClick={(e)=>{e.stopPropagation();goTo("focus_layer");}} style={{background:"#FFF7ED",border:"1.5px solid #FED7AA",borderRadius:8,padding:"4px 8px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,fontWeight:600,color:"#F97316",cursor:"pointer"}}>🎯 Track</button>}
                    </div>
                    <div style={{background:isDone?p.light:"white",padding:"14px 18px",transition:"all 0.4s"}}>
                      {!selected ? (
                        <div>
                          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa",marginBottom:12,lineHeight:1.5,fontStyle:"italic"}}>{rungData?.title}</p>
                          <button className="tap" onClick={()=>goTo(`pick_${pid}`)} style={S.btn(p.grad,`0 6px 18px ${p.color}44`)}>👆 Pick my habit for this rung</button>
                        </div>
                      ) : (
                        <div style={{display:"flex",flexDirection:"column",gap:10}}>
                          {(()=>{
                            const habits = ladder.habits||[];
                            const masteredCount = habits.filter(h=>h.mastered).length;
                            const activeHabit = habits.find(h=>h.habit===selected)||{habit:selected,checkins:ladder.days||0,mastered:(ladder.days||0)>=5};
                            const checkins = activeHabit.checkins||0;
                            const isMastered = checkins>=5;
                            const canPickNext = isMastered && masteredCount<3;
                            const canUnlock = masteredCount>=3 && ladder.rung<4;
                            return (
                              <>
                                {/* Previously mastered habits */}
                                {habits.filter(h=>h.mastered&&h.habit!==selected).map((h,i)=>(
                                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:p.light,border:`1px solid ${p.border}`}}>
                                    <span>✅</span>
                                    <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:p.color,fontWeight:600,flex:1,lineHeight:1.4}}>{h.habit}</span>
                                    <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:p.color,opacity:0.6}}>mastered</span>
                                  </div>
                                ))}

                                {/* Current active habit */}
                                <div style={{padding:"12px 14px",borderRadius:14,background:isMastered?p.light:"#f8f8f8",border:`1.5px solid ${isMastered?p.color:"#eee"}`}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                                    <span style={{fontSize:16}}>{isMastered?"✅":"🎯"}</span>
                                    <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:isMastered?p.color:"#333",fontWeight:600,flex:1,lineHeight:1.4,textDecoration:isDone?"line-through":"none"}}>{selected}</span>
                                  </div>
                                  <div style={{display:"flex",alignItems:"center",gap:5,marginLeft:24}}>
                                    {Array.from({length:5},(_,j)=>(
                                      <div key={j} style={{width:12,height:12,borderRadius:"50%",background:j<Math.min(checkins,5)?p.color:"#e0e0e0",transition:"all 0.3s",transform:j===(Math.min(checkins,5)-1)?"scale(1.2)":"scale(1)"}}/>
                                    ))}
                                    <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:isMastered?p.color:"#aaa",marginLeft:6,fontWeight:isMastered?600:400}}>
                                      {isMastered ? `✨ Mastered! (${checkins} check-ins)` : `${checkins}/5 to master`}
                                    </span>
                                  </div>
                                </div>

                                {/* Progress */}
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                  <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>{masteredCount}/3 habits mastered · Rung {ladder.rung+1}/5</span>
                                  {canUnlock&&<span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:p.color,fontWeight:700}}>🔓 Ready!</span>}
                                </div>

                                {/* Check in */}
                                {!isDone&&(
                                  <button className="tap" onClick={()=>handleCheckIn(pid)} style={S.btn(p.grad,`0 6px 18px ${p.color}44`)}>
                                    ✓ Done — I did this today!
                                  </button>
                                )}

                                {/* After mastery choice */}
                                {isMastered&&canPickNext&&(
                                  <div style={{background:"#FFFBEB",borderRadius:14,padding:"14px",border:"1.5px solid #FDE68A"}}>
                                    <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#92400E",marginBottom:10,lineHeight:1.5,fontWeight:600}}>🎉 Habit mastered! What next?</p>
                                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                                      <button className="tap" onClick={()=>goTo(`pick_${pid}`)} style={{padding:"11px",borderRadius:12,border:`1.5px solid ${p.color}`,background:p.light,color:p.color,fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                                        + Pick next Rung {ladder.rung+1} habit ({masteredCount+1}/3)
                                      </button>
                                      <button className="tap" onClick={()=>showToast("Keep going — every extra check-in makes it stronger! 💪","#10B981")} style={{padding:"11px",borderRadius:12,border:"1.5px solid #e8e8e8",background:"white",color:"#555",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,cursor:"pointer"}}>
                                        Keep going with this habit
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Level up */}
                                {ladder.rung<4&&!canPickNext&&(
                                  <button className="tap" onClick={()=>handleUnlock(pid)} style={{padding:"11px",borderRadius:12,border:`1.5px solid ${canUnlock?p.color:"#e8e8e8"}`,background:canUnlock?p.light:"white",color:canUnlock?p.color:"#bbb",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                                    {canUnlock?`🔓 Level up to Rung ${ladder.rung+2}!`:`🔒 ${3-masteredCount} more habit${3-masteredCount!==1?"s":""} to level up`}
                                  </button>
                                )}
                              </>
                            );
                          })()}
                          {pid==="fuel"&&(
                            <button className="tap" onClick={()=>goTo("fuel_layer")}
                              style={{width:"100%",marginTop:8,padding:"10px",borderRadius:12,border:"1.5px solid #FDE68A",background:"#FFFBEB",color:"#F59E0B",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                              ⚡ Track Nutrition →
                            </button>
                          )}
                          {pid==="move"&&(
                            <button className="tap" onClick={()=>goTo("move_layer")}
                              style={{width:"100%",marginTop:8,padding:"10px",borderRadius:12,border:"1.5px solid #A7F3D0",background:"#ECFDF5",color:"#10B981",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                              💪 Track Movement →
                            </button>
                          )}
                          {pid==="rest"&&(
                            <button className="tap" onClick={()=>goTo("rest_layer")}
                              style={{width:"100%",marginTop:8,padding:"10px",borderRadius:12,border:"1.5px solid #DDD6FE",background:"#F5F3FF",color:"#8B5CF6",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                              😴 Track Sleep →
                            </button>
                          )}
                          {pid==="calm"&&(
                            <button className="tap" onClick={()=>goTo("calm_layer")}
                              style={{width:"100%",marginTop:8,padding:"10px",borderRadius:12,border:"1.5px solid #BAE6FD",background:"#F0F9FF",color:"#0EA5E9",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                              🧘 Track Calm →
                            </button>
                          )}
                          {pid==="connect"&&(
                            <button className="tap" onClick={()=>goTo("connect_layer")}
                              style={{width:"100%",marginTop:8,padding:"10px",borderRadius:12,border:"1.5px solid #FBCFE8",background:"#FDF2F8",color:"#EC4899",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                              🤝 Track Connection →
                            </button>
                          )}
                          {pid==="focus"&&(
                            <button className="tap" onClick={()=>goTo("focus_layer")}
                              style={{width:"100%",marginTop:8,padding:"10px",borderRadius:12,border:"1.5px solid #FED7AA",background:"#FFF7ED",color:"#F97316",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                              🎯 Track Focus →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{display:"flex",gap:10}}>
              <button className="tap" onClick={()=>goTo("dashboard")} style={{...S.btnGhost,flex:3}}>View Dashboard</button>
              <button className="tap" onClick={()=>goTo("settings")} style={{...S.btnGhost,flex:1,fontSize:18,padding:"14px 10px"}}>⚙️</button>
            </div>
          </div>
        )}

        {/* ── PICK HABIT ── */}
        {PIDS.map(pid=>{
          if (st.screen!==`pick_${pid}`) return null;
          const p=PILLARS[pid];
          const ladder=st.ladder[pid];
          const rungData=LADDER[pid]?.[ladder.rung];
          return (
            <div key={pid} className="fu" style={S.page}>
              <div>
                <div style={S.badge(p.color,p.light)}>{p.emoji} {p.name} · Rung {ladder.rung+1} of 5</div>
                <h2 style={S.h2}>{rungData?.title}</h2>
              </div>

              <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:16}}>
                {rungData?.options.map((opt,i)=>(
                  <button key={i} className="tap" onClick={()=>handleSelectHabit(pid,opt)}
                    style={{width:"100%",padding:"16px 18px",borderRadius:16,border:`1.5px solid ${st.ladder[pid].selected===opt?p.color:"#f0f0f0"}`,background:st.ladder[pid].selected===opt?p.light:"white",cursor:"pointer",textAlign:"left",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:14,color:st.ladder[pid].selected===opt?p.color:"#333",fontWeight:st.ladder[pid].selected===opt?600:400,lineHeight:1.5,transition:"all 0.2s"}}>
                    {opt}
                  </button>
                ))}
                {writeOwn.show&&writeOwn.pid===pid ? (
                  <div style={{...S.card,display:"flex",flexDirection:"column",gap:10}}>
                    <textarea value={writeOwn.val} onChange={e=>setWriteOwn(w=>({...w,val:e.target.value}))} placeholder="Describe your habit specifically and simply..." style={{...S.input,minHeight:90,resize:"none",borderRadius:12}} rows={3}/>
                    <div style={{display:"flex",gap:8}}>
                      <button className="tap" onClick={()=>{if(writeOwn.val.trim()){handleSelectHabit(pid,writeOwn.val.trim());setWriteOwn({show:false,pid:null,val:""})}}} style={{...S.btn(p.grad),flex:1,fontSize:13,padding:"11px"}}>Save My Habit</button>
                      <button className="tap" onClick={()=>setWriteOwn({show:false,pid:null,val:""})} style={{...S.btnGhost,flex:1,fontSize:13,padding:"11px"}}>Cancel</button>
                    </div>
                  </div>
                ):(
                  <button className="tap" onClick={()=>setWriteOwn({show:true,pid,val:""})} style={{width:"100%",padding:"15px 18px",borderRadius:16,border:"1.5px dashed #ddd",background:"white",cursor:"pointer",textAlign:"left",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:14,color:"#aaa"}}>
                    ✏️ Write my own habit
                  </button>
                )}
              </div>

              <button className="tap" onClick={()=>goTo("habits")} style={S.btnGhost}>← Back to habits</button>
            </div>
          );
        })}

        {/* ── NEXT WEEK PLAN ── */}
        {st.screen==="next_week_plan"&&(
          <NextWeekPlan st={st} goBack={()=>goTo("dashboard")} S={S}/>
        )}

        {/* ── MONTHLY LETTER ── */}
        {st.screen==="monthly_letter"&&(
          <MonthlyLetter st={st} goBack={()=>goTo("dashboard")} S={S}/>
        )}

        {/* ── WEEKLY REPORT ── */}
        {st.screen==="weekly_report_full"&&(
          <WeeklyReport st={st} goBack={()=>goTo("dashboard")} fetchWeeklyReport={fetchWeeklyReport} S={S}/>
        )}

        {/* ── FOCUS LAYER ── */}
        {st.screen==="focus_layer"&&(
          <div className="fu" style={{...S.page,paddingBottom:90}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <button onClick={()=>goTo("habits")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#666",padding:"4px"}}>←</button>
              <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa"}}>Back to habits</span>
            </div>
            <FocusLayer st={st} update={update} S={S} focusHabit={st.ladder?.focus?.selected} fetchAIInsight={fetchAIInsight} goToHabits={()=>goTo("habits")} buildRungContext={buildRungContext}/>
          </div>
        )}

        {/* ── CONNECT LAYER ── */}
        {st.screen==="connect_layer"&&(
          <div className="fu" style={{...S.page,paddingBottom:90}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <button onClick={()=>goTo("habits")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#666",padding:"4px"}}>←</button>
              <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa"}}>Back to habits</span>
            </div>
            <ConnectLayer st={st} update={update} S={S} connectHabit={st.ladder?.connect?.selected} fetchAIInsight={fetchAIInsight} goToHabits={()=>goTo("habits")} buildRungContext={buildRungContext}/>
          </div>
        )}

        {/* ── CALM LAYER ── */}
        {st.screen==="calm_layer"&&(
          <div className="fu" style={{...S.page,paddingBottom:90}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <button onClick={()=>goTo("habits")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#666",padding:"4px"}}>←</button>
              <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa"}}>Back to habits</span>
            </div>
            <CalmLayer st={st} update={update} S={S} calmHabit={st.ladder?.calm?.selected} fetchAIInsight={fetchAIInsight} goToHabits={()=>goTo("habits")} buildRungContext={buildRungContext}/>
          </div>
        )}

        {/* ── REST LAYER ── */}
        {st.screen==="rest_layer"&&(
          <div className="fu" style={{...S.page,paddingBottom:90}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <button onClick={()=>goTo("habits")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#666",padding:"4px"}}>←</button>
              <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa"}}>Back to habits</span>
            </div>
            <RestLayer st={st} update={update} S={S} restHabit={st.ladder?.rest?.selected} fetchAIInsight={fetchAIInsight} goToHabits={()=>goTo("habits")} buildRungContext={buildRungContext}/>
          </div>
        )}

        {/* ── MOVE LAYER ── */}
        {st.screen==="move_layer"&&(
          <div className="fu" style={{...S.page,paddingBottom:90}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <button onClick={()=>goTo("habits")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#666",padding:"4px"}}>←</button>
              <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa"}}>Back to habits</span>
            </div>
            <MoveLayer st={st} update={update} S={S} moveHabit={st.ladder?.move?.selected} fetchAIInsight={fetchAIInsight} goToHabits={()=>goTo("habits")} buildRungContext={buildRungContext}/>
          </div>
        )}

        {/* ── FUEL LAYER ── */}
        {st.screen==="fuel_layer"&&(
          <div className="fu" style={{...S.page,paddingBottom:90}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <button onClick={()=>goTo("habits")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#666",padding:"4px"}}>←</button>
              <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa"}}>Back to habits</span>
            </div>
            <FuelLayer st={st} update={update} S={S} onMealAdded={(msg)=>showToast(msg)} goToHabits={()=>goTo("habits")} fuelHabit={st.ladder?.fuel?.selected} fetchAIInsight={fetchAIInsight} buildRungContext={buildRungContext}/>
          </div>
        )}

        {/* ── EXPLORE ── */}
        {st.screen==="explore"&&(
          <div className="fu" style={{...S.page,paddingBottom:90}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                <button onClick={()=>goTo("habits")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#666",padding:"4px"}}>←</button>
                <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa"}}>Back to habits</span>
              </div>
              <h2 style={S.h1}>Explore</h2>
              <p style={S.sub}>Science, coaching and insights to deepen your practice.</p>
            </div>

            {/* Weekly theme */}
            {(()=>{
              const week = new Date().getDay();
              const theme = EXPLORE.weekly_themes[Math.floor(st.streak/7) % EXPLORE.weekly_themes.length];
              return (
                <div style={{background:`linear-gradient(135deg,${theme.color}22,${theme.color}08)`,borderRadius:20,padding:"20px",border:`1.5px solid ${theme.color}33`}}>
                  <div style={{display:"inline-flex",background:theme.color,borderRadius:20,padding:"4px 12px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:"white",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>This Week</div>
                  <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:20,color:"#0f0f0f",marginBottom:8}}>{theme.theme}</div>
                  <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:14,color:"#444",lineHeight:1.7}}>{theme.message}</p>
                </div>
              );
            })()}

            {/* Today's unlock */}
            <div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Today's Science</div>
              {(()=>{
                const todayArticle = EXPLORE.articles[st.streak % EXPLORE.articles.length];
                const unlocked = allDoneToday;
                return (
                  <div onClick={()=>unlocked&&setExploreArticle(todayArticle)} style={{...S.card,border:`1.5px solid ${unlocked?todayArticle.color+"44":"#f0f0f0"}`,cursor:unlocked?"pointer":"default",opacity:unlocked?1:0.7,transition:"all 0.3s",position:"relative",overflow:"hidden"}}>
                    {!unlocked&&<div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.7)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:20,zIndex:2}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:28,marginBottom:6}}>🔒</div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",fontWeight:600}}>Complete today's habits to unlock</div>
                      </div>
                    </div>}
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div style={{width:52,height:52,borderRadius:15,background:todayArticle.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,border:`1px solid ${todayArticle.color}22`}}>{todayArticle.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:todayArticle.color,letterSpacing:1,textTransform:"uppercase"}}>{todayArticle.tag}</div>
                          <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#bbb"}}>{todayArticle.duration}</div>
                        </div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:15,color:"#0f0f0f",lineHeight:1.3}}>{todayArticle.title}</div>
                      </div>
                      {unlocked&&<div style={{fontSize:18,color:"#bbb"}}>→</div>}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* All articles */}
            <div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#aaa",letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>All Science</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {EXPLORE.articles.map((article,i)=>(
                  <div key={article.id} className="fu" onClick={()=>setExploreArticle(article)} style={{...S.card,cursor:"pointer",display:"flex",alignItems:"center",gap:12,animationDelay:`${i*0.04}s`,border:`1.5px solid ${article.color}22`}}>
                    <div style={{width:44,height:44,borderRadius:13,background:article.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{article.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,fontWeight:700,color:article.color,letterSpacing:1,textTransform:"uppercase"}}>{article.tag}</div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#bbb"}}>{article.duration}</div>
                      </div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:14,color:"#0f0f0f",lineHeight:1.3}}>{article.title}</div>
                    </div>
                    <div style={{fontSize:16,color:"#bbb"}}>→</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CELEBRATE ── */}
        {st.screen==="celebrate"&&(
          <div className="fu" style={{...S.page,alignItems:"center",justifyContent:"center",textAlign:"center"}}>
            <div style={{fontSize:72,animation:"floatSlow 2.5s ease-in-out infinite"}}>🏆</div>
            <div>
              <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:72,color:"#0f0f0f",lineHeight:1,letterSpacing:-3}}>{st.streak}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,letterSpacing:4,color:"#bbb",textTransform:"uppercase",marginTop:4}}>Day Streak</div>
            </div>
            <div style={{...S.card,maxWidth:320,width:"100%",textAlign:"center"}}>
              <div style={{display:"inline-flex",background:stage.bg,borderRadius:20,padding:"4px 14px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:700,color:stage.color,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{stage.name}</div>
              <p style={{fontFamily:"Fraunces,serif",fontSize:17,color:"#0f0f0f",lineHeight:1.5,fontStyle:"italic"}}>"{stage.desc}"</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:320}}>
              {activePids.map(pid=>{
                const p=PILLARS[pid];
                return <div key={pid} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:14,background:p.light,border:`1px solid ${p.border}`,textAlign:"left"}}>
                  <div style={{width:32,height:32,borderRadius:9,background:p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>✓</div>
                  <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#555",flex:1,lineHeight:1.4}}>{st.ladder[pid].selected}</span>
                </div>;
              })}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:320}}>
              <button className="tap" onClick={()=>{update({checkedToday:Object.fromEntries(PIDS.map(p=>[p,false]))});goTo("habits");}} style={S.btn()}>Tomorrow's Habits →</button>
              <div style={{display:"flex",gap:10}}>
              <button className="tap" onClick={()=>goTo("dashboard")} style={{...S.btnGhost,flex:3}}>View Dashboard</button>
              <button className="tap" onClick={()=>goTo("settings")} style={{...S.btnGhost,flex:1,fontSize:18,padding:"14px 10px"}}>⚙️</button>
            </div>
            </div>
          </div>
        )}

        {/* ── WEEKLY SUMMARY ── */}
        {st.screen==="weekly_summary"&&(
          <div className="fu" style={S.page}>
            <div style={{textAlign:"center",paddingTop:8}}>
              <div style={{fontSize:48,marginBottom:12}}>📊</div>
              <h2 style={S.h1}>Your week in CoreSix</h2>
              <p style={S.sub}>Here is the real impact your habits had this week.</p>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {activePids.map(pid=>{
                const p=PILLARS[pid];
                const answer=st.weeklyImpact?.[pid]??null;
                const iq=IMPACT_QUESTIONS[pid];
                const opt=answer!==null?iq.options[answer]:null;
                const days=st.history.filter(h=>h.pillars?.includes(pid)).slice(-7).length;
                const trend=answer!==null ? IMPACT_TRENDS[Math.min(answer,3)] : "not rated";
                return (
                  <div key={pid} style={{...S.card,border:`1.5px solid ${answer>=2?p.border:"#f0f0f0"}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                      <div style={{width:42,height:42,borderRadius:12,background:p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,boxShadow:`0 4px 12px ${p.color}33`}}>{p.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:14,color:"#0f0f0f"}}>{p.name}</div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>{days}/7 days · {trend}</div>
                      </div>
                      {opt&&<div style={{textAlign:"center"}}>
                        <div style={{fontSize:22}}>{opt.emoji}</div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:p.color,fontWeight:600,marginTop:2}}>{opt.label}</div>
                      </div>}
                    </div>
                    <div style={{background:"#f5f5f5",borderRadius:6,height:5,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:6,background:p.grad,width:`${(days/7)*100}%`,transition:"width 0.8s ease"}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coach insight */}
            {(()=>{
              // Sort by impact score — make separate copies to avoid mutation bug
              const scoreList = activePids.map(pid=>({
                pid,
                score: st.weeklyImpact?.[pid] ?? -1,
                days: st.history.filter(h=>h.pillars?.includes(pid)).slice(-7).length
              }));
              const sortedByBest  = [...scoreList].sort((a,b)=>b.score-a.score);
              const sortedByWorst = [...scoreList].sort((a,b)=>a.score-b.score);
              const best  = sortedByBest[0];
              const worst = sortedByWorst[0];
              const bestP  = best  ? PILLARS[best.pid]  : null;
              const worstP = worst ? PILLARS[worst.pid] : null;
              const different = best?.pid !== worst?.pid;
              return (
                <div style={{background:"linear-gradient(135deg,#F5F3FF,#EFF6FF)",borderRadius:18,padding:"20px",border:"1px solid #DDD6FE"}}>
                  <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:17,color:"#0f0f0f",marginBottom:10}}>Your habits are working.</div>
                  {bestP && best.score >= 0 && (
                    <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.7,marginBottom:8}}>
                      {bestP.emoji} <strong>{bestP.name}</strong> is your biggest win this week. Keep building on this momentum.
                    </p>
                  )}
                  {worstP && different && worst.score >= 0 && worst.score < 2 && (
                    <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.7}}>
                      {worstP.emoji} <strong>{worstP.name}</strong> needs the most attention next week. One tiny habit at a time.
                    </p>
                  )}
                  {(!best || best.score < 0) && (
                    <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.7}}>
                      Every check-in this week built something real. Keep showing up.
                    </p>
                  )}
                  <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#8B5CF6",marginTop:10,lineHeight:1.6,fontStyle:"italic"}}>
                    "Trust the work when the results hide. Growth is often invisible before it is visible."
                  </p>
                </div>
              );
            })()}

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {/* Show pillar suggestion if available */}
              {pillarSuggestion && (
                <button className="tap" onClick={()=>{}} style={{...S.btn("linear-gradient(135deg,#10B981,#0EA5E9)","0 8px 24px #10B98144"),position:"relative",overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <span>🎯 Choose Next Week's Pillars</span>
                    <span style={{background:"rgba(255,255,255,0.25)",borderRadius:6,padding:"2px 6px",fontSize:11}}>AI suggestion ready</span>
                  </div>
                </button>
              )}
              <button className="tap" onClick={()=>goTo("habits")} style={S.btn()}>Start Next Week →</button>
              <button className="tap" onClick={()=>goTo("dashboard")} style={S.btnGhost}>View Full Dashboard</button>
            </div>
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {st.screen==="dashboard"&&(
          <div className="fu" style={{...S.page,paddingBottom:90}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa",marginBottom:2}}>Good day,</p>
                <h2 style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:30,color:"#0f0f0f",letterSpacing:-0.5}}>{st.name}</h2>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
                <div style={{...S.card,textAlign:"center",padding:"12px 16px"}}>
                  <div style={{fontFamily:"Fraunces,serif",fontWeight:900,fontSize:30,color:"#0f0f0f",lineHeight:1}}>{st.streak}</div>
                  <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:9,color:"#aaa",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>streak 🔥</div>
                </div>
                <button className="tap" onClick={resetApp} style={{background:"white",border:"1.5px solid #fee2e2",borderRadius:10,padding:"6px 12px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,fontWeight:600,color:"#ef4444",cursor:"pointer"}}>
                  🔄 Restart
                </button>
              </div>
            </div>

            <div style={{display:"flex",gap:4,background:"white",borderRadius:14,padding:4,border:"1.5px solid #f0f0f0",boxShadow:"0 2px 8px #0001"}}>
              {["today","pillars","impact","brain"].map(t=>(
                <button key={t} onClick={()=>update({tab:t})} style={{flex:1,padding:"10px",borderRadius:10,border:"none",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer",textTransform:"capitalize",transition:"all 0.2s",background:st.tab===t?"#0f0f0f":"transparent",color:st.tab===t?"white":"#aaa",boxShadow:st.tab===t?"0 4px 12px #0003":"none"}}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            {st.tab==="today"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div><div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:15,color:"#0f0f0f"}}>Today</div><div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#aaa",marginTop:2}}>{stage.name} stage</div></div>
                    <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:30,color:"#10B981"}}>{done3}<span style={{fontSize:16,color:"#ddd"}}>/{activePids.length}</span></div>
                  </div>
                  <div style={{background:"#f5f5f5",borderRadius:8,height:7,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:8,background:"linear-gradient(90deg,#10B981,#34D399)",width:`${pct}%`,transition:"width 0.6s ease"}}/>
                  </div>
                </div>
                {activePids.map(pid=>{
                  const p=PILLARS[pid]; const isDone=st.checkedToday[pid]; const selected=st.ladder[pid].selected;
                  return <div key={pid} style={{...S.card,border:`1.5px solid ${isDone?p.border:"#f0f0f0"}`,display:"flex",alignItems:"center",gap:12,transition:"all 0.3s"}}>
                    <div style={{width:42,height:42,borderRadius:12,background:isDone?p.grad:p.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{isDone?"✓":p.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:12,color:p.color,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{p.name} · Rung {st.ladder[pid].rung+1}/5</div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:isDone?"#bbb":"#333",lineHeight:1.4,textDecoration:isDone?"line-through":"none"}}>{selected||"No habit selected yet"}</div>
                    </div>
                  </div>;
                })}
                {done3<activePids.length&&<button className="tap" onClick={()=>goTo("habits")} style={S.btn()}>Continue Check-In →</button>}
              </div>
            )}

            {st.tab==="pillars"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {PIDS.map((pid,i)=>{
                  const p=PILLARS[pid]; const score=st.scores[pid]||0; const ladder=st.ladder[pid];
                  const stars="⭐".repeat(ladder.rung+1)+"☆".repeat(4-ladder.rung);
                  return <div key={pid} className="fu" style={{...S.card,border:`1.5px solid ${score?p.border:"#f0f0f0"}`,animationDelay:`${i*0.05}s`}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                      <div style={{width:42,height:42,borderRadius:12,background:p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:`0 4px 12px ${p.color}33`,flexShrink:0}}>{p.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:14,color:"#0f0f0f"}}>{p.name}</div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>
                        {stars} · {ladder.days} days on this habit
                        {ladder.rung<4&&(canLevelUp(st.ladder,pid)
                          ? <span style={{color:"#8B5CF6",fontWeight:600}}> · Ready to level up! 🔓</span>
                          : <span> · {daysToLevelUp(st.ladder,pid)}d to next rung</span>
                        )}
                      </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:22,color:p.color}}>{score||"–"}{score?"/4":""}</div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#bbb"}}>Rung {ladder.rung+1}/5</div>
                      </div>
                    </div>
                    <div style={{background:"#f5f5f5",borderRadius:6,height:5,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:6,background:p.grad,width:`${((ladder.rung+1)/5)*100}%`,transition:"width 0.6s ease"}}/>
                    </div>
                    {ladder.selected&&<p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#888",marginTop:10,lineHeight:1.5,fontStyle:"italic"}}>"{ladder.selected}"</p>}
                  </div>;
                })}
                <div style={{display:"flex",gap:10,marginTop:4}}>
                  <button className="tap" onClick={()=>{update({qIndex:0,qAnswers:{}});goTo("questionnaire");}} style={{...S.btnGhost,flex:2}}>📋 Re-take Assessment</button>
                  <button className="tap" onClick={resetApp} style={{flex:1,padding:"14px",borderRadius:14,border:"1.5px solid #fee2e2",background:"white",color:"#ef4444",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer"}}>🔄 Reset</button>
                </div>
              </div>
            )}

            {st.tab==="brain"&&(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <button onClick={()=>goTo("weekly_report_full")}
                  style={{...S.btn("linear-gradient(135deg,#6D28D9,#8B5CF6)","0 8px 24px #6D28D944"),padding:"16px",fontSize:14}}>
                  📊 Generate Weekly Intelligence Report →
                </button>
                {(()=>{
                  const totalDays = (st.history||[]).length;
                  const daysLeft = Math.max(0, 30 - totalDays);
                  const canGenerate = totalDays >= 30;
                  return canGenerate ? (
                    <button onClick={()=>goTo("monthly_letter")}
                      style={{...S.btn("linear-gradient(135deg,#0f0f0f,#2d2d2d)","0 8px 24px #0003"),padding:"14px",fontSize:13}}>
                      ✉️ Read My Monthly Progress Letter →
                    </button>
                  ) : (
                    <div style={{padding:"14px 16px",borderRadius:16,background:"#f8f8f8",border:"1.5px solid #e8e8e8",textAlign:"center"}}>
                      <div style={{fontSize:22,marginBottom:4}}>✉️</div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#555",fontWeight:600,marginBottom:2}}>Monthly Progress Letter</div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>Unlocks after 30 days · {totalDays}/30 active · {daysLeft} to go</div>
                    </div>
                  );
                })()}
                <button onClick={()=>goTo("next_week_plan")}
                  style={{...S.btn("linear-gradient(135deg,#10B981,#0EA5E9)","0 8px 24px #10B98144"),padding:"14px",fontSize:13}}>
                  🎯 Smart Next Week Plan →
                </button>
                <BrainPanel deviceId={DEVICE_ID} fetchAnalytics={fetchAnalytics} fetchAIInsight={fetchAIInsight} fetchCrossPatterns={fetchCrossPatterns} fetchPredictiveNudge={fetchPredictiveNudge} S={S} />
              </div>
            )}

            {st.tab==="impact"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <button className="tap" onClick={()=>update({showWeeklyCheckin:true,tab:"today"})} style={S.btn("linear-gradient(135deg,#8B5CF6,#A78BFA)","0 8px 24px #8B5CF644")}>
                  📊 Take This Week's Check-in
                </button>
                {!st.impactHistory?.length ? (
                  <div style={{textAlign:"center",padding:"48px 20px"}}>
                    <div style={{fontSize:44,marginBottom:12}}>📈</div>
                    <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",color:"#bbb",fontSize:14,lineHeight:1.7}}>No impact data yet.<br/>Your first weekly check-in appears every Saturday.</p>
                  </div>
                ):[...st.impactHistory].reverse().map((entry,i)=>(
                  <div key={i} style={S.card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:13,color:"#0f0f0f"}}>Week of {entry.date}</div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#10B981",fontWeight:600}}>🔥 {entry.streak} streak</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {Object.entries(entry.answers).map(([pid,ans])=>{
                        const p=PILLARS[pid];
                        const iq=IMPACT_QUESTIONS[pid];
                        const opt=iq?.options[ans];
                        if (!p||!opt) return null;
                        return (
                          <div key={pid} style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{fontSize:16}}>{p.emoji}</span>
                            <div style={{flex:1}}>
                              <div style={{background:"#f5f5f5",borderRadius:4,height:4,overflow:"hidden"}}>
                                <div style={{height:"100%",borderRadius:4,background:p.grad,width:`${((ans+1)/4)*100}%`}}/>
                              </div>
                            </div>
                            <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:p.color,fontWeight:600,width:70,textAlign:"right"}}>{opt.emoji} {opt.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {st.tab==="history"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {st.history.length===0?(
                  <div style={{textAlign:"center",padding:"48px 20px"}}>
                    <div style={{fontSize:44,marginBottom:12}}>📅</div>
                    <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",color:"#bbb",fontSize:14,lineHeight:1.7}}>No history yet.<br/>Complete your first check-in to start tracking.</p>
                  </div>
                ):[...st.history].reverse().map((entry,i)=>(
                  <div key={i} style={S.card}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:"#0f0f0f"}}>{entry.day}</div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#10B981",fontWeight:600}}>🔥 {entry.streak}</div>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {entry.pillars.map(pid=>{
                        const p=PILLARS[pid];
                        return p?<div key={pid} style={{background:p.light,border:`1px solid ${p.border}`,borderRadius:8,padding:"4px 10px",fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:p.color,fontWeight:500}}>{p.emoji} {p.name}</div>:null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(250,250,248,0.94)",backdropFilter:"blur(16px)",borderTop:"1px solid #eeece8",padding:"10px 24px",display:"flex",justifyContent:"space-around",zIndex:100}}>
              {[{icon:"🏠",label:"Home",action:()=>goTo("habits")},{icon:"📚",label:"Explore",action:()=>goTo("explore")},{icon:"🎯",label:"Pillars",action:()=>{update({tab:"pillars"});goTo("dashboard");}},{icon:"📊",label:"Dashboard",action:()=>{update({tab:"today"});goTo("dashboard");}}].map(item=>(
                <button key={item.label} className="tap" onClick={item.action} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 10px"}}>
                  <span style={{fontSize:22}}>{item.icon}</span>
                  <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:9,color:"#aaa",letterSpacing:0.5,textTransform:"uppercase"}}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

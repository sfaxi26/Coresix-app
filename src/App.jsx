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

const IMPACT_TRENDS = ["needs focus ↓","consistent →","improving ↑","strong ↑"];
const IMPACT_LABELS = ["Struggling","Same / Okay","Getting better","Thriving"];

const getStage = s => STAGES.find(st=>s>=st.days[0]&&s<=st.days[1])||STAGES[0];
const getPillar = id => PILLARS[id];
const getRand = arr => arr[Math.floor(Math.random()*arr.length)];

const SAVE_KEY = "coresix_v2";
const DEVICE_ID = getDeviceId();
const loadState = () => { try { const d=localStorage.getItem(SAVE_KEY); return d?JSON.parse(d):null; } catch { return null; } };
const saveState = s => { try { localStorage.setItem(SAVE_KEY,JSON.stringify(s)); } catch {} };

const initState = () => ({
  name:"", screen:"splash",
  qIndex:0, qAnswers:{}, scores:{}, profile:{},
  ladder: Object.fromEntries(PIDS.map(pid=>[pid,{rung:0,days:0,selected:null}])),
  checkedToday: Object.fromEntries(PIDS.map(pid=>[pid,false])),
  streak:0, lastDate:null, history:[], tab:"today",
  weeklyImpact:{}, impactHistory:[],
  showWeeklyCheckin:false,
  selectedPillars:null,  // null = use auto 3 weakest
  coachingRead: {},
  morningIdx:0,
});

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

// ── BRAIN PANEL COMPONENT ────────────────────────────────
function BrainPanel({ deviceId, fetchAnalytics, fetchAIInsight, S }) {
  const [analytics, setAnalytics] = useState(null);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    const data = await fetchAnalytics();
    setAnalytics(data);
    setLoading(false);
  };

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
  const [exploreArticle, setExploreArticle] = useState(null);
  const [weeklyAnswers, setWeeklyAnswers] = useState({});
  const [showCoach, setShowCoach] = useState(null); // {title, message, onContinue}
  const [lastQPid, setLastQPid] = useState(null);

  const stage = getStage(st.streak);

  useEffect(()=>{
    const today = new Date().toDateString();
    const dayOfWeek = new Date().getDay(); // 6 = Saturday
    if (st.lastDate && st.lastDate!==today) {
      update({checkedToday:Object.fromEntries(PIDS.map(p=>[p,false]))});
    }
    // Show weekly check-in on Saturday if not done this week
    const thisWeek = getWeekKey();
    const alreadyDone = st.impactHistory?.some(h=>h.week===thisWeek);
    if (dayOfWeek===6 && !alreadyDone && st.streak>0) {
      update({showWeeklyCheckin:true});
    }
  },[]);

  const getWeekKey = () => {
    const d = new Date();
    const startOfYear = new Date(d.getFullYear(),0,1);
    const week = Math.ceil(((d-startOfYear)/86400000+startOfYear.getDay()+1)/7);
    return `${d.getFullYear()}-W${week}`;
  };

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

  const fetchAnalytics = async () => {
    const id = localStorage.getItem("coresix_device_id");
    if (!id) return null;
    return await api("GET", `/api/analytics/${id}`);
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
    const today = new Date().toDateString();
    const newLadder = {...st.ladder,[pid]:{...st.ladder[pid],days:st.ladder[pid].days+1}};
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
    const unlockMsg = getRand(COACHING.unlock_coaching);
    showCoaching(
      "Rung " + (rung+1) + " Mastered ⭐",
      unlockMsg,
      ()=>{
        setShowCoach(null);
        const newLadder = {...st.ladder,[pid]:{rung:rung+1,days:0,selected:null}};
        update({ladder:newLadder});
        goTo(`pick_${pid}`);
      },
      {icon:"🔓",color:"#8B5CF6",bg:"linear-gradient(135deg,#F5F3FF,white)",border:"#DDD6FE",continueLabel:"Pick my next habit →"}
    );
  };

  // ── SELECT HABIT ──
  const handleSelectHabit = (pid, habit) => {
    const rung = st.ladder[pid].rung;
    const rungCoach = COACHING.rung_coaching[pid]?.[rung];
    const p = PILLARS[pid];
    update({ladder:{...st.ladder,[pid]:{...st.ladder[pid],selected:habit,days:0}}});
    // Sync to backend
    syncLadder(pid, rung, 0, habit);
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
                          // Save and show summary
                          const week = getWeekKey();
                          const newImpact = {...st.weeklyImpact,...newAnswers};
                          const newHistory = [...(st.impactHistory||[]),{week,answers:newAnswers,date:new Date().toLocaleDateString("en",{month:"short",day:"numeric"}),streak:st.streak}];
                          update({weeklyImpact:newImpact,impactHistory:newHistory.slice(-12),showWeeklyCheckin:false});
                          // Sync to backend
                          syncImpact(week, newAnswers);
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
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#888",lineHeight:1.7}}>CoreSix is a wellness app, not a medical tool. Always consult your doctor for medical advice.

Built on research by BJ Fogg, James Clear, and behavioural science.</div>
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
              <p style={S.sub}>Built on research by BJ Fogg, James Clear, and behavioural science.</p>
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
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:isDone?"rgba(255,255,255,0.6)":"#aaa"}}>Rung {ladder.rung+1}/5 · {ladder.days} days</div>
                      </div>
                    </div>
                    <div style={{background:isDone?p.light:"white",padding:"14px 18px",transition:"all 0.4s"}}>
                      {!selected ? (
                        <div>
                          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#aaa",marginBottom:12,lineHeight:1.5,fontStyle:"italic"}}>{rungData?.title}</p>
                          <button className="tap" onClick={()=>goTo(`pick_${pid}`)} style={S.btn(p.grad,`0 6px 18px ${p.color}44`)}>👆 Pick my habit for this rung</button>
                        </div>
                      ) : (
                        <div>
                          <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:15,color:isDone?"#aaa":"#0f0f0f",lineHeight:1.6,textDecoration:isDone?"line-through":"none",marginBottom:isDone?0:14}}>{selected}</p>
                          {!isDone&&(
                            <div style={{display:"flex",flexDirection:"column",gap:8}}>
                              <button className="tap" onClick={()=>handleCheckIn(pid)} style={S.btn(p.grad,`0 6px 18px ${p.color}44`)}>✓ Done — I did this!</button>
                              <div style={{display:"flex",gap:8}}>
                                <button className="tap" onClick={()=>goTo(`pick_${pid}`)} style={{...S.btnGhost,flex:1,fontSize:12,padding:"10px"}}>Change</button>
                                {ladder.rung<4&&<button className="tap" onClick={()=>handleUnlock(pid)} style={{...S.btnGhost,flex:1,fontSize:12,padding:"10px"}}>🔓 Level up</button>}
                              </div>
                            </div>
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

        {/* ── EXPLORE ── */}
        {st.screen==="explore"&&(
          <div className="fu" style={{...S.page,paddingBottom:90}}>
            <div>
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
                const trend=IMPACT_TRENDS[answer??0];
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
              const scores = activePids.map(pid=>({pid,score:st.weeklyImpact?.[pid]??0,days:st.history.filter(h=>h.pillars?.includes(pid)).slice(-7).length}));
              const best = scores.sort((a,b)=>b.score-a.score)[0];
              const worst = scores.sort((a,b)=>a.score-b.score)[0];
              const bestP = PILLARS[best?.pid];
              const worstP = PILLARS[worst?.pid];
              return (
                <div style={{background:"linear-gradient(135deg,#F5F3FF,#EFF6FF)",borderRadius:18,padding:"20px",border:"1px solid #DDD6FE"}}>
                  <div style={{fontFamily:"Fraunces,serif",fontWeight:800,fontSize:17,color:"#0f0f0f",marginBottom:10}}>Your habits are working.</div>
                  {bestP&&<p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.7,marginBottom:8}}>
                    {bestP.emoji} <strong>{bestP.name}</strong> is your biggest win this week. Keep building on this momentum.
                  </p>}
                  {worstP&&worstP.pid!==best?.pid&&<p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#374151",lineHeight:1.7}}>
                    {worstP.emoji} <strong>{worstP.name}</strong> needs the most attention next week. One tiny habit at a time.
                  </p>}
                  <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#8B5CF6",marginTop:10,lineHeight:1.6,fontStyle:"italic"}}>
                    "Trust the work when the results hide. Growth is often invisible before it's visible."
                  </p>
                </div>
              );
            })()}

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
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
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#aaa"}}>{stars} · {ladder.days} days on this habit</div>
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
              <BrainPanel deviceId={DEVICE_ID} fetchAnalytics={fetchAnalytics} fetchAIInsight={fetchAIInsight} S={S} />
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

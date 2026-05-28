import { useState, useEffect, useRef } from "react";

// ── PILLARS ──────────────────────────────────────────────
const PILLARS = [
  { id:"fuel",    name:"Fuel",    emoji:"⚡", color:"#E8A838", light:"#FEF3DC", desc:"Nutrition & Energy" },
  { id:"move",    name:"Move",    emoji:"💪", color:"#3BAA6E", light:"#E8F7EF", desc:"Movement & Fitness" },
  { id:"rest",    name:"Rest",    emoji:"😴", color:"#7B6CF6", light:"#F0EEFF", desc:"Sleep & Recovery" },
  { id:"calm",    name:"Calm",    emoji:"🧘", color:"#3BA8C8", light:"#E8F5FA", desc:"Stress & Mindfulness" },
  { id:"connect", name:"Connect", emoji:"🤝", color:"#E8527A", light:"#FDEDF2", desc:"Relationships" },
  { id:"focus",   name:"Focus",   emoji:"🎯", color:"#E86438", light:"#FEF0EB", desc:"Purpose & Clarity" },
];

const HABITS = {
  fuel:    ["Drink a glass of water before your first coffee","Eat breakfast sitting down with no screens","Add protein to every meal today","Plan tomorrow's meals before bed","One whole food swap — replace something processed"],
  move:    ["5 push-ups before your shower","10-minute walk after lunch","Stand up and stretch for 2 minutes now","Take the stairs every time today","Park further away and walk the extra distance"],
  rest:    ["Make your bed within 5 minutes of waking","Phone in another room 15 minutes before sleep","Same bedtime as last night","10 minutes of natural light within 30 min of waking","No caffeine after 2pm today"],
  calm:    ["3 deep breaths before opening any app","Write one thing you are grateful for","5 minutes of silence with your morning drink","One mindful minute — just notice what is around you","Put the phone face-down for 20 minutes"],
  connect: ["Send one genuine message to someone you care about","One conversation with phone face-down","Give a specific genuine compliment today","Call instead of text one person","Tell someone one thing you appreciate about them"],
  focus:   ["Write your top priority before opening email","25-minute focused work block — nothing else","Close all tabs except the one you need","Phone in another room while you work","Write tomorrow's plan before closing your laptop"],
};

const STAGES = [
  { name:"Awakening", days:[0,6],   color:"#3BAA6E", desc:"You are just beginning." },
  { name:"Building",  days:[7,20],  color:"#E8A838", desc:"The habit is taking root." },
  { name:"Momentum",  days:[21,44], color:"#7B6CF6", desc:"It is becoming part of you." },
  { name:"Mastery",   days:[45,999],color:"#E8527A", desc:"This is who you are now." },
];

const getStage = (s) => STAGES.find(st => s >= st.days[0] && s <= st.days[1]) || STAGES[0];
const pickHabit = (pid, used=[]) => { const o = HABITS[pid]?.filter(h=>!used.includes(h))||[]; return o[Math.floor(Math.random()*o.length)]||HABITS[pid][0]; };

// ── COACHING ─────────────────────────────────────────────
const INSIGHTS = [
  "40% of what you do every day is habit — not conscious choice.",
  "Identity drives behaviour. You are not trying to do this. You are becoming someone who does.",
  "Cravings pass on their own in 15–20 minutes. Ride the wave.",
  "Add, don't restrict. 'I will eat one vegetable' beats 'I will stop eating junk'.",
  "Emotions create habits. Celebrate every small win — your brain is listening.",
  "Willpower is like a battery. Protect it with sleep, food, and fewer decisions.",
  "The smallest step forward is still forward.",
  "Trust the work when the results hide.",
  "Better, not perfect. Progress is rarely linear.",
  "Habits that once felt hard are becoming part of who you are.",
];

export default function App() {
  const [screen, setScreen]       = useState("splash");
  const [name, setName]           = useState("");
  const [nameInput, setNameInput] = useState("");
  const [scores, setScores]       = useState({});
  const [top3, setTop3]           = useState([]);
  const [habits, setHabits]       = useState({});
  const [checked, setChecked]     = useState({});
  const [streak, setStreak]       = useState(0);
  const [history, setHistory]     = useState([]);
  const [tab, setTab]             = useState("today");
  const [animIn, setAnimIn]       = useState(true);
  const [insight, setInsight]     = useState(INSIGHTS[0]);
  const stage = getStage(streak);

  useEffect(() => {
    setTimeout(() => goTo("welcome"), 2000);
    setInsight(INSIGHTS[Math.floor(Math.random()*INSIGHTS.length)]);
  }, []);

  const goTo = (s) => {
    setAnimIn(false);
    setTimeout(() => { setScreen(s); setAnimIn(true); }, 250);
  };

  const startHabits = () => {
    const sorted = [...PILLARS].sort((a,b)=>(scores[a.id]||3)-(scores[b.id]||3));
    const w3 = sorted.slice(0,3);
    setTop3(w3);
    const used = [];
    const h = {};
    w3.forEach(p => { const hb = pickHabit(p.id, used); h[p.id]=hb; used.push(hb); });
    setHabits(h);
    setChecked({});
    goTo("habits");
  };

  const handleCheck = (pid) => {
    const next = {...checked, [pid]:true};
    setChecked(next);
    if (Object.keys(next).length >= top3.length) {
      setTimeout(() => {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setHistory(h => [...h.slice(-29), {
          day: new Date().toLocaleDateString("en",{weekday:"short", month:"short", day:"numeric"}),
          pillars: top3.map(p=>p.id),
          streak: newStreak,
        }]);
        goTo("celebrate");
      }, 600);
    }
  };

  const newDay = () => {
    const used = [];
    const h = {};
    top3.forEach(p => { const hb = pickHabit(p.id, used); h[p.id]=hb; used.push(hb); });
    setHabits(h);
    setChecked({});
    setInsight(INSIGHTS[Math.floor(Math.random()*INSIGHTS.length)]);
    goTo("habits");
  };

  const allScored = PILLARS.every(p => scores[p.id]);
  const done = Object.keys(checked).length;
  const pct = top3.length ? Math.round((done/top3.length)*100) : 0;

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        body{background:#F8F6F2;overscroll-behavior:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes scaleIn{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .fu{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both}
        .fi{animation:fadeIn 0.3s ease both}
        .tap:active{transform:scale(0.97);transition:transform 0.1s}
        input:focus{outline:none}
        ::-webkit-scrollbar{width:0}
        ::selection{background:#E8A83822}
      `}</style>

      <div style={{
        ...s.wrap,
        opacity: animIn ? 1 : 0,
        transform: animIn ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.25s ease"
      }}>

        {/* ── SPLASH ── */}
        {screen==="splash" && (
          <div style={s.splash}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:56, animation:"float 2s ease-in-out infinite", marginBottom:20}}>✦</div>
              <div style={s.splashLogo}>CORE<span style={{color:"#3BAA6E"}}>SIX</span></div>
              <div style={s.splashSub}>YOUR WELLNESS STORY</div>
            </div>
          </div>
        )}

        {/* ── WELCOME ── */}
        {screen==="welcome" && (
          <div className="fu" style={s.page}>
            {/* Header illustration */}
            <div style={s.welcomeHero}>
              <div style={s.heroCircle}>
                {PILLARS.map((p,i) => (
                  <div key={p.id} style={{
                    position:"absolute",
                    width:44, height:44,
                    borderRadius:"50%",
                    background:p.light,
                    border:`2px solid ${p.color}22`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:20,
                    left: `${50 + 38*Math.cos((i/6)*Math.PI*2 - Math.PI/2)}%`,
                    top:  `${50 + 38*Math.sin((i/6)*Math.PI*2 - Math.PI/2)}%`,
                    transform:"translate(-50%,-50%)",
                    animation:`float ${2+i*0.3}s ease-in-out infinite`,
                    animationDelay:`${i*0.2}s`,
                  }}>
                    {p.emoji}
                  </div>
                ))}
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontFamily:"Playfair Display,serif",fontWeight:800,fontSize:28,color:"#1a1a1a",letterSpacing:-1}}>6</div>
                </div>
              </div>
            </div>

            <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:24}}>
              <div>
                <div style={s.tagline}>Six pillars.</div>
                <div style={s.tagline}>One habit each.</div>
                <div style={{...s.tagline,color:"#3BAA6E"}}>Every day.</div>
                <p style={s.bodyText}>
                  Built on research by BJ Fogg, James Clear, and behavioural science.
                  Not a diet. Not a rigid plan. A system that grows with you.
                </p>
              </div>

              <div style={s.inputWrap}>
                <input
                  value={nameInput}
                  onChange={e=>setNameInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&nameInput.trim()&&(setName(nameInput.trim()),goTo("assess"))}
                  placeholder="What should I call you?"
                  style={s.input}
                />
                <button
                  className="tap"
                  onClick={()=>{if(nameInput.trim()){setName(nameInput.trim());goTo("assess")}}}
                  style={{...s.btnPrimary, background:"#1a1a1a"}}
                >
                  Begin →
                </button>
              </div>

              <div style={s.insightCard}>
                <div style={s.insightDot}/>
                <p style={s.insightText}>{insight}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── ASSESS ── */}
        {screen==="assess" && (
          <div className="fu" style={s.page}>
            <div style={s.pageHeader}>
              <div style={s.stepBadge}>Step 1 of 2</div>
              <h2 style={s.pageTitle}>Where does your story begin, {name}?</h2>
              <p style={s.pageSubtitle}>Rate each pillar honestly · 1 struggling → 5 thriving</p>
            </div>

            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:16,paddingBottom:16}}>
              {PILLARS.map((p,i) => (
                <div key={p.id} className="fu" style={{animationDelay:`${i*0.06}s`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{...s.pillarDot, background:p.light, border:`1.5px solid ${p.color}44`}}>
                      <span style={{fontSize:16}}>{p.emoji}</span>
                    </div>
                    <div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:15,color:"#1a1a1a"}}>{p.name}</div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#999"}}>{p.desc}</div>
                    </div>
                    {scores[p.id] && (
                      <div style={{marginLeft:"auto",fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:22,color:p.color}}>
                        {scores[p.id]}
                      </div>
                    )}
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        className="tap"
                        onClick={()=>setScores(prev=>({...prev,[p.id]:n}))}
                        style={{
                          flex:1, height:40, borderRadius:10,
                          border:`1.5px solid ${scores[p.id]>=n?p.color:p.color+"33"}`,
                          background: scores[p.id]>=n ? p.light : "white",
                          color: scores[p.id]>=n ? p.color : "#ccc",
                          fontFamily:"Plus Jakarta Sans,sans-serif",
                          fontWeight:700, fontSize:14,
                          cursor:"pointer",
                          transition:"all 0.15s",
                          transform: scores[p.id]===n ? "scale(1.05)" : "scale(1)",
                        }}
                      >{n}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="tap"
              onClick={startHabits}
              disabled={!allScored}
              style={{
                ...s.btnPrimary,
                background: allScored ? "#1a1a1a" : "#e5e5e5",
                color: allScored ? "white" : "#aaa",
                cursor: allScored ? "pointer" : "not-allowed",
              }}
            >
              {allScored ? "Generate My Habits →" : `Rate all 6 pillars (${Object.keys(scores).length}/6)`}
            </button>
          </div>
        )}

        {/* ── HABITS ── */}
        {screen==="habits" && (
          <div className="fu" style={s.page}>
            {/* Progress ring */}
            <div style={s.progressHeader}>
              <div>
                <div style={s.stepBadge}>Day {streak+1}</div>
                <h2 style={s.pageTitle}>Today's habits</h2>
              </div>
              <div style={s.ringWrap}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#f0f0f0" strokeWidth="4"/>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#3BAA6E" strokeWidth="4"
                    strokeDasharray={`${138.2 * pct/100} 138.2`}
                    strokeLinecap="round"
                    transform="rotate(-90 28 28)"
                    style={{transition:"stroke-dasharray 0.5s ease"}}
                  />
                </svg>
                <div style={s.ringLabel}>{pct}%</div>
              </div>
            </div>

            {/* Insight strip */}
            <div style={s.insightStrip}>
              <span style={{fontSize:12}}>💡</span>
              <p style={s.insightStripText}>{insight}</p>
            </div>

            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,paddingBottom:16}}>
              {top3.map((p,i) => {
                const isDone = checked[p.id];
                return (
                  <div
                    key={p.id}
                    className="fu"
                    style={{
                      ...s.habitCard,
                      background: isDone ? p.light : "white",
                      borderColor: isDone ? p.color+"44" : "#f0f0f0",
                      animationDelay:`${i*0.08}s`,
                    }}
                  >
                    <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                      <div style={{
                        width:44,height:44,borderRadius:12,
                        background: isDone ? p.color : p.light,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:22,flexShrink:0,
                        transition:"all 0.3s",
                      }}>
                        {isDone ? "✓" : p.emoji}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{
                          fontFamily:"Plus Jakarta Sans,sans-serif",
                          fontWeight:600,fontSize:13,
                          color: isDone ? p.color : "#999",
                          letterSpacing:0.5,textTransform:"uppercase",
                          marginBottom:3,
                        }}>{p.name}</div>
                        <div style={{
                          fontFamily:"Plus Jakarta Sans,sans-serif",
                          fontSize:15,
                          color: isDone ? "#666" : "#1a1a1a",
                          lineHeight:1.5,
                          textDecoration: isDone ? "line-through" : "none",
                        }}>{habits[p.id]}</div>
                      </div>
                    </div>
                    {!isDone && (
                      <button
                        className="tap"
                        onClick={()=>handleCheck(p.id)}
                        style={{
                          ...s.doneBtn,
                          background:p.color,
                          marginTop:12,
                        }}
                      >
                        Done ✓
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button className="tap" onClick={()=>goTo("dashboard")} style={s.btnGhost}>
              View Dashboard
            </button>
          </div>
        )}

        {/* ── CELEBRATE ── */}
        {screen==="celebrate" && (
          <div className="fu" style={{...s.page, justifyContent:"center", alignItems:"center", textAlign:"center"}}>
            <div style={{maxWidth:320}}>
              <div style={{fontSize:72,marginBottom:16,animation:"float 2s ease-in-out infinite"}}>🌟</div>
              <div style={{fontFamily:"Playfair Display,serif",fontWeight:800,fontSize:64,color:"#1a1a1a",lineHeight:1}}>{streak}</div>
              <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,letterSpacing:3,color:"#999",marginTop:4,textTransform:"uppercase"}}>Day Streak</div>

              <div style={{
                background:"white",borderRadius:20,padding:"20px 24px",
                margin:"24px 0",border:"1px solid #f0f0f0",
                textAlign:"left",
              }}>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:12,color:stage.color,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>{stage.name}</div>
                <div style={{fontFamily:"Playfair Display,serif",fontSize:16,color:"#1a1a1a",lineHeight:1.5}}>{stage.desc}</div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
                {top3.map(p => (
                  <div key={p.id} style={{
                    display:"flex",alignItems:"center",gap:10,
                    padding:"10px 14px",borderRadius:12,
                    background:p.light,
                    textAlign:"left",
                  }}>
                    <span style={{fontSize:16}}>{p.emoji}</span>
                    <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#555",flex:1,lineHeight:1.4}}>{habits[p.id]}</span>
                    <span style={{fontSize:14,color:p.color}}>✓</span>
                  </div>
                ))}
              </div>

              <div style={s.insightCard}>
                <p style={{...s.insightText,fontStyle:"italic"}}>"{insight}"</p>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:20}}>
                <button className="tap" onClick={newDay} style={{...s.btnPrimary,background:"#1a1a1a"}}>
                  Tomorrow's Habits →
                </button>
                <button className="tap" onClick={()=>goTo("dashboard")} style={s.btnGhost}>
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {screen==="dashboard" && (
          <div className="fu" style={s.page}>
            {/* Header */}
            <div style={s.dashHeader}>
              <div>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:"#999",marginBottom:2}}>Good day,</div>
                <h2 style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:26,color:"#1a1a1a"}}>{name}</h2>
              </div>
              <div style={s.streakBadge}>
                <div style={{fontFamily:"Playfair Display,serif",fontWeight:800,fontSize:28,color:"#1a1a1a",lineHeight:1}}>{streak}</div>
                <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:10,color:"#999",letterSpacing:1}}>STREAK</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={s.tabs}>
              {["today","pillars","history"].map(t => (
                <button key={t} onClick={()=>setTab(t)} style={{
                  ...s.tab,
                  background: tab===t ? "#1a1a1a" : "transparent",
                  color: tab===t ? "white" : "#999",
                }}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>

              {/* TODAY TAB */}
              {tab==="today" && (
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {/* Progress card */}
                  <div style={s.progressCard}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:14,color:"#1a1a1a"}}>Today's Progress</div>
                      <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:20,color:"#3BAA6E"}}>{done}/{top3.length}</div>
                    </div>
                    <div style={s.progressBar}>
                      <div style={{...s.progressFill, width:`${pct}%`}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#999"}}>Stage: {stage.name}</div>
                      <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#999"}}>{pct}% complete</div>
                    </div>
                  </div>

                  {/* Habit list */}
                  {top3.map(p => (
                    <div key={p.id} style={{
                      background:"white",borderRadius:16,padding:"14px 16px",
                      border:`1.5px solid ${checked[p.id]?p.color+"33":"#f0f0f0"}`,
                      display:"flex",alignItems:"center",gap:12,
                    }}>
                      <div style={{
                        width:36,height:36,borderRadius:10,
                        background: checked[p.id] ? p.color : p.light,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:18,flexShrink:0,
                      }}>
                        {checked[p.id] ? "✓" : p.emoji}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:12,color:p.color,letterSpacing:0.5,textTransform:"uppercase"}}>{p.name}</div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:checked[p.id]?"#aaa":"#444",lineHeight:1.4,textDecoration:checked[p.id]?"line-through":"none"}}>{habits[p.id]}</div>
                      </div>
                    </div>
                  ))}

                  {done < top3.length && (
                    <button className="tap" onClick={()=>goTo("habits")} style={{...s.btnPrimary,background:"#1a1a1a",marginTop:4}}>
                      Continue Check-In →
                    </button>
                  )}
                </div>
              )}

              {/* PILLARS TAB */}
              {tab==="pillars" && (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {PILLARS.map((p,i) => {
                    const score = scores[p.id] || 0;
                    return (
                      <div key={p.id} className="fu" style={{
                        background:"white",borderRadius:16,padding:"16px",
                        border:"1.5px solid #f0f0f0",
                        animationDelay:`${i*0.05}s`,
                      }}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                          <div style={{
                            width:38,height:38,borderRadius:10,
                            background:p.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
                          }}>{p.emoji}</div>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:14,color:"#1a1a1a"}}>{p.name}</div>
                            <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:"#999"}}>{p.desc}</div>
                          </div>
                          <div style={{fontFamily:"Playfair Display,serif",fontWeight:700,fontSize:20,color:p.color}}>
                            {score || "–"}<span style={{fontSize:12,color:"#ccc"}}>{score?"/5":""}</span>
                          </div>
                        </div>
                        <div style={{background:"#f8f8f8",borderRadius:6,height:6,overflow:"hidden"}}>
                          <div style={{
                            height:"100%",borderRadius:6,background:p.color,
                            width:`${(score/5)*100}%`,transition:"width 0.6s ease",
                          }}/>
                        </div>
                      </div>
                    );
                  })}
                  <button className="tap" onClick={()=>goTo("assess")} style={{...s.btnGhost,marginTop:4}}>
                    Re-assess Pillars
                  </button>
                </div>
              )}

              {/* HISTORY TAB */}
              {tab==="history" && (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {history.length===0 ? (
                    <div style={{textAlign:"center",padding:"48px 20px"}}>
                      <div style={{fontSize:40,marginBottom:12}}>📅</div>
                      <p style={{fontFamily:"Plus Jakarta Sans,sans-serif",color:"#aaa",fontSize:14,lineHeight:1.6}}>
                        No history yet.<br/>Complete your first check-in to start tracking.
                      </p>
                    </div>
                  ) : [...history].reverse().map((entry,i) => (
                    <div key={i} style={{background:"white",borderRadius:14,padding:"14px 16px",border:"1.5px solid #f0f0f0"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:600,fontSize:13,color:"#1a1a1a"}}>{entry.day}</div>
                        <div style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:12,color:"#3BAA6E"}}>🔥 {entry.streak} streak</div>
                      </div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {entry.pillars.map(pid => {
                          const p = PILLARS.find(x=>x.id===pid);
                          return p ? (
                            <div key={pid} style={{
                              background:p.light,borderRadius:8,
                              padding:"4px 10px",
                              fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:11,color:p.color,fontWeight:500,
                            }}>{p.emoji} {p.name}</div>
                          ):null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom nav */}
            <div style={s.bottomNav}>
              {[
                {icon:"🏠",label:"Home",action:()=>goTo("habits")},
                {icon:"📊",label:"Dashboard",action:()=>setTab("today")},
                {icon:"🎯",label:"Pillars",action:()=>setTab("pillars")},
                {icon:"📅",label:"History",action:()=>setTab("history")},
              ].map(item => (
                <button key={item.label} className="tap" onClick={item.action} style={s.navBtn}>
                  <span style={{fontSize:20}}>{item.icon}</span>
                  <span style={{fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:9,color:"#999",letterSpacing:0.5,textTransform:"uppercase"}}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────
const s = {
  root:         { minHeight:"100vh", background:"#F8F6F2", fontFamily:"Plus Jakarta Sans,sans-serif" },
  wrap:         { width:"100%", maxWidth:430, margin:"0 auto", minHeight:"100vh", position:"relative" },
  splash:       { height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F8F6F2" },
  splashLogo:   { fontFamily:"Playfair Display,serif", fontWeight:800, fontSize:52, color:"#1a1a1a", letterSpacing:2 },
  splashSub:    { fontFamily:"Plus Jakarta Sans,sans-serif", fontSize:11, letterSpacing:4, color:"#bbb", marginTop:8, textAlign:"center" },
  page:         { minHeight:"100vh", padding:"32px 20px 20px", display:"flex", flexDirection:"column", gap:16 },
  welcomeHero:  { display:"flex", justifyContent:"center", paddingTop:8 },
  heroCircle:   { position:"relative", width:180, height:180 },
  tagline:      { fontFamily:"Playfair Display,serif", fontWeight:700, fontSize:36, color:"#1a1a1a", lineHeight:1.15, letterSpacing:-0.5 },
  bodyText:     { fontFamily:"Plus Jakarta Sans,sans-serif", fontSize:14, color:"#888", lineHeight:1.7, marginTop:12 },
  inputWrap:    { display:"flex", flexDirection:"column", gap:10 },
  input:        { width:"100%", background:"white", border:"1.5px solid #e8e8e8", borderRadius:14, padding:"14px 18px", color:"#1a1a1a", fontSize:15, fontFamily:"Plus Jakarta Sans,sans-serif" },
  btnPrimary:   { width:"100%", padding:"15px", borderRadius:14, border:"none", color:"white", fontSize:15, fontFamily:"Plus Jakarta Sans,sans-serif", fontWeight:600, cursor:"pointer", letterSpacing:0.3, transition:"all 0.2s" },
  btnGhost:     { width:"100%", padding:"14px", borderRadius:14, border:"1.5px solid #e8e8e8", background:"white", color:"#666", fontSize:14, fontFamily:"Plus Jakarta Sans,sans-serif", fontWeight:500, cursor:"pointer" },
  insightCard:  { background:"white", borderRadius:16, padding:"16px 18px", border:"1.5px solid #f0f0f0", display:"flex", alignItems:"flex-start", gap:10 },
  insightDot:   { width:8, height:8, borderRadius:"50%", background:"#3BAA6E", flexShrink:0, marginTop:4 },
  insightText:  { fontFamily:"Plus Jakarta Sans,sans-serif", fontSize:13, color:"#666", lineHeight:1.6 },
  insightStrip: { background:"#F0EEFF", borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:8 },
  insightStripText: { fontFamily:"Plus Jakarta Sans,sans-serif", fontSize:12, color:"#7B6CF6", lineHeight:1.5, flex:1 },
  pageHeader:   { display:"flex", flexDirection:"column", gap:6, paddingBottom:4 },
  stepBadge:    { display:"inline-flex", fontFamily:"Plus Jakarta Sans,sans-serif", fontSize:11, fontWeight:600, letterSpacing:2, color:"#3BAA6E", textTransform:"uppercase", background:"#E8F7EF", borderRadius:20, padding:"4px 12px", width:"fit-content" },
  pageTitle:    { fontFamily:"Playfair Display,serif", fontWeight:700, fontSize:26, color:"#1a1a1a", letterSpacing:-0.3 },
  pageSubtitle: { fontFamily:"Plus Jakarta Sans,sans-serif", color:"#aaa", fontSize:13, lineHeight:1.5 },
  pillarDot:    { width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  progressHeader:{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  ringWrap:     { position:"relative", width:56, height:56, display:"flex", alignItems:"center", justifyContent:"center" },
  ringLabel:    { position:"absolute", fontFamily:"Plus Jakarta Sans,sans-serif", fontWeight:700, fontSize:12, color:"#1a1a1a" },
  habitCard:    { borderRadius:18, padding:"16px", border:"1.5px solid", transition:"all 0.3s" },
  doneBtn:      { width:"100%", padding:"11px", borderRadius:12, border:"none", color:"white", fontFamily:"Plus Jakarta Sans,sans-serif", fontWeight:600, fontSize:14, cursor:"pointer" },
  dashHeader:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingBottom:4 },
  streakBadge:  { background:"white", border:"1.5px solid #f0f0f0", borderRadius:16, padding:"10px 14px", textAlign:"center" },
  tabs:         { display:"flex", gap:4, background:"white", borderRadius:14, padding:4, border:"1.5px solid #f0f0f0" },
  tab:          { flex:1, padding:"9px", borderRadius:10, border:"none", fontFamily:"Plus Jakarta Sans,sans-serif", fontWeight:600, fontSize:12, cursor:"pointer", textTransform:"uppercase", letterSpacing:1, transition:"all 0.2s" },
  progressCard: { background:"white", borderRadius:16, padding:"18px", border:"1.5px solid #f0f0f0" },
  progressBar:  { background:"#f5f5f5", borderRadius:6, height:6, overflow:"hidden" },
  progressFill: { height:"100%", borderRadius:6, background:"linear-gradient(90deg,#3BAA6E,#5DD89A)", transition:"width 0.5s ease" },
  bottomNav:    { position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"rgba(248,246,242,0.95)", backdropFilter:"blur(12px)", borderTop:"1px solid #eeebe5", padding:"10px 20px", display:"flex", justifyContent:"space-around" },
  navBtn:       { background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"6px 12px" },
};

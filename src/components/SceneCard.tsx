"use client";

// Editorial illustration style — inspired by bold, character-driven design
const sk = '#1A0A00';   // hair / dark
const skin = '#C8885A'; // warm skin

function Spark({ cx, cy, s, op }: { cx: number; cy: number; s: number; op: number }) {
  const p = s * 0.22;
  return (
    <path
      d={`M${cx},${cy - s} L${cx + p},${cy - p} L${cx + s},${cy} L${cx + p},${cy + p} L${cx},${cy + s} L${cx - p},${cy + p} L${cx - s},${cy} L${cx - p},${cy - p}Z`}
      fill="white" opacity={op}
    />
  );
}

interface SceneCardProps { isNight: boolean; condition: string; }

export function SceneCard({ isNight, condition }: SceneCardProps) {
  const skyTop =
    isNight                                        ? '#040C1E' :
    condition === 'rain' || condition === 'storm'  ? '#2A3A46' :
    condition === 'snow'                           ? '#8AA5BA' :
    condition === 'cloudy'                         ? '#5A7282' :
                                                     '#3282C8';

  const skyBot =
    isNight                                        ? '#0C1C38' :
    condition === 'rain' || condition === 'storm'  ? '#4A5E6C' :
    condition === 'snow'                           ? '#D8EAF4' :
    condition === 'cloudy'                         ? '#A4BCC8' :
                                                     '#98D0E8';

  const g1 =
    isNight                                        ? '#060C18' :
    condition === 'rain' || condition === 'storm'  ? '#263035' :
    condition === 'snow'                           ? '#C8D8EA' :
                                                     '#2A5018';

  const g2 =
    isNight                                        ? '#0A1425' :
    condition === 'rain' || condition === 'storm'  ? '#324248' :
    condition === 'snow'                           ? '#E0EEF8' :
                                                     '#36681E';

  return (
    <svg
      width="100%" height="100%"
      viewBox="0 0 480 200"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, display: 'block' }}
    >
      <defs>
        <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="480" height="200" fill="url(#sc-sky)" />

      {/* ── NIGHT ─────────────────────────────────────────── */}
      {isNight ? (
        <>
          {/* 4-pointed sparkle stars */}
          <Spark cx={38}  cy={15} s={4}   op={0.9} />
          <Spark cx={90}  cy={10} s={3}   op={0.8} />
          <Spark cx={132} cy={28} s={3.5} op={0.85} />
          <Spark cx={170} cy={7}  s={2.5} op={0.95} />
          <Spark cx={215} cy={22} s={3.5} op={0.8} />
          <Spark cx={258} cy={13} s={4}   op={0.9} />
          <Spark cx={302} cy={6}  s={3}   op={0.75} />
          <Spark cx={348} cy={18} s={3.5} op={0.85} />
          <Spark cx={58}  cy={42} s={3}   op={0.9} />
          <Spark cx={150} cy={48} s={3}   op={0.8} />
          <Spark cx={232} cy={36} s={3.5} op={0.9} />
          <Spark cx={388} cy={26} s={3}   op={0.85} />
          <Spark cx={416} cy={50} s={2.5} op={0.7} />

          {/* Moon crescent */}
          <circle cx="400" cy="40" r="28" fill="#EAE0D5" opacity="0.95" />
          <circle cx="413" cy="32" r="25" fill={skyTop} />

          {/* Hills */}
          <path d="M0 155 Q80 134 165 146 Q250 158 330 140 Q395 126 480 138 L480 200 L0 200Z" fill={g1} />
          <path d="M0 164 Q70 157 145 162 Q240 169 320 157 Q400 147 480 160 L480 200 L0 200Z" fill={g2} />

          {/* Pine trees */}
          <path d="M62 152 L74 118 L86 152Z"    fill="#040A14" />
          <path d="M77 152 L86 129 L95 152Z"    fill="#050C1A" />
          <path d="M320 138 L332 104 L344 138Z" fill="#040A14" />

          {/* Person – looking up at stars, editorial style */}
          {/* Body / jacket */}
          <path d="M230 152 Q227 143 227 135 Q227 127 243 127 Q259 127 259 135 Q259 143 256 152Z" fill={g1} />
          {/* Head */}
          <ellipse cx="243" cy="118" rx="13" ry="14" fill={g1} />
          {/* Curly hair */}
          <path d="M230 116 Q229 103 235 98 Q239 94 243 95 Q247 94 251 98 Q257 103 256 116" fill={sk} />
          <path d="M232 109 Q234 101 238 100 Q240 96 243 96 Q246 96 248 100 Q252 101 254 109" fill="#100500" />
          {/* Eyes (looking up) */}
          <ellipse cx="238" cy="119" rx="2.8" ry="2.2" fill={g2} />
          <ellipse cx="248" cy="119" rx="2.8" ry="2.2" fill={g2} />
          {/* Arms raised to the sky */}
          <path d="M229 136 Q219 127 212 117" stroke={g1} strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M257 136 Q267 127 274 117" stroke={g1} strokeWidth="9" strokeLinecap="round" fill="none" />
        </>

      /* ── RAIN / STORM ──────────────────────────────────── */
      ) : condition === 'rain' || condition === 'storm' ? (
        <>
          {/* Cloud mass */}
          <ellipse cx="55"  cy="38" rx="75" ry="30" fill="#3A4E5C" opacity="0.9" />
          <ellipse cx="205" cy="22" rx="105" ry="40" fill="#2C3E4A" />
          <ellipse cx="385" cy="34" rx="85" ry="28" fill="#3A4E5C" opacity="0.85" />
          {condition === 'storm' && (
            <path d="M220 62 L209 87 L222 87 L204 114" stroke="#FFD54F" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {/* Rain */}
          {[50,75,108,138,165,198,228,260,295,328,355,392,420].map((x, i) => (
            <line key={i} x1={x} y1={68 + (i % 4) * 6} x2={x - 7} y2={92 + (i % 4) * 6}
              stroke="rgba(160,205,228,0.6)" strokeWidth="1.8" />
          ))}

          {/* Ground */}
          <path d="M0 158 Q120 148 240 155 Q360 162 480 152 L480 200 L0 200Z" fill={g1} />
          <path d="M0 167 Q100 160 200 165 Q340 172 480 163 L480 200 L0 200Z" fill={g2} />

          {/* Person – hunched under umbrella */}
          {/* Body */}
          <path d="M232 152 Q229 143 229 137 Q229 131 243 131 Q257 131 257 137 Q257 143 254 152Z" fill={g1} />
          {/* Head */}
          <ellipse cx="243" cy="123" rx="12" ry="13" fill={g1} />
          {/* Curly hair */}
          <path d="M231 121 Q230 110 236 106 Q239 103 243 104 Q247 103 250 106 Q255 110 255 121" fill={sk} />
          <path d="M233 115 Q235 108 239 107 Q241 104 243 104 Q245 104 247 107 Q251 108 253 115" fill="#200E00" />
          {/* Eyes */}
          <ellipse cx="239" cy="125" rx="2.2" ry="2.5" fill={g2} />
          <ellipse cx="247" cy="125" rx="2.2" ry="2.5" fill={g2} />
          {/* Umbrella dome */}
          <path d="M218 134 Q225 119 243 117 Q261 119 268 134 Q256 132 243 131 Q230 132 218 134Z" fill="#FF6B1A" />
          {/* Umbrella ribs */}
          <path d="M218 134 Q230 132 243 131" stroke="#CC5510" strokeWidth="1" fill="none" />
          <path d="M243 131 Q256 132 268 134" stroke="#CC5510" strokeWidth="1" fill="none" />
          {/* Handle */}
          <line x1="243" y1="131" x2="243" y2="145" stroke="#CC5510" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M243 145 Q243 150 238 150" stroke="#CC5510" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Arm holding umbrella */}
          <path d="M255 138 Q251 133 243 132" stroke={g1} strokeWidth="7" strokeLinecap="round" fill="none" />
          {/* Other arm */}
          <path d="M232 140 Q226 144 223 149" stroke={g1} strokeWidth="7" strokeLinecap="round" fill="none" />
        </>

      /* ── DAY (clear, cloudy, snow) ─────────────────────── */
      ) : (
        <>
          {/* Snow clouds */}
          {condition === 'snow' && (
            <>
              <ellipse cx="90"  cy="42" rx="80" ry="32" fill="rgba(220,230,240,0.85)" />
              <ellipse cx="280" cy="28" rx="100" ry="36" fill="rgba(210,225,238,0.9)" />
            </>
          )}

          {/* Editorial sun */}
          {condition !== 'snow' && (
            <>
              <circle cx="388" cy="44" r="60" fill="#FFDD60" opacity="0.1" />
              <circle cx="388" cy="44" r="44" fill="#FFDD60" opacity="0.22" />
              <circle cx="388" cy="44" r="32" fill="#FFDD60" opacity="0.45" />
              <circle cx="388" cy="44" r="21" fill="#FFCA28" />
              {[0,45,90,135,180,225,270,315].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <line key={i}
                    x1={388 + 27 * Math.cos(rad)} y1={44 + 27 * Math.sin(rad)}
                    x2={388 + 40 * Math.cos(rad)} y2={44 + 40 * Math.sin(rad)}
                    stroke="#FFCA28" strokeWidth="4" strokeLinecap="round"
                  />
                );
              })}
            </>
          )}

          {/* Clouds */}
          {condition === 'cloudy' && (
            <>
              <path d="M48 50 Q56 38 70 40 Q74 30 90 32 Q112 30 116 46 Q125 44 127 56 Q50 62 48 50Z"
                fill="rgba(255,255,255,0.75)" />
              <path d="M236 32 Q248 18 270 22 Q278 12 298 14 Q328 12 332 32 Q342 28 346 42 Q236 50 236 32Z"
                fill="rgba(255,255,255,0.65)" />
            </>
          )}

          {/* Rolling hills */}
          <path d="M0 152 Q80 132 165 144 Q250 156 330 138 Q395 124 480 136 L480 200 L0 200Z" fill={g1} />
          <path d="M0 162 Q70 155 145 160 Q240 167 320 155 Q400 145 480 158 L480 200 L0 200Z" fill={g2} />

          {/* Pine trees */}
          <path d="M60 149 L72 115 L84 149Z"    fill={g1} />
          <path d="M75 149 L83 127 L91 149Z"    fill="#245018" />
          <path d="M313 135 L325 100 L337 135Z" fill={g1} />

          {/* Birds */}
          {condition !== 'snow' && (
            <>
              <path d="M145 54 Q149 51 153 54" stroke={g1} strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M160 47 Q164 44 168 47" stroke={g1} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* Person – editorial illustrated, happy */}
          {/* Shoes */}
          <ellipse cx="235" cy="156" rx="9" ry="4" fill="#1A1A1A" />
          <ellipse cx="253" cy="156" rx="9" ry="4" fill="#1A1A1A" />
          {/* Trouser legs */}
          <rect x="230" y="143" width="9"  height="14" rx="4.5" fill="#2A2A2A" />
          <rect x="248" y="143" width="9"  height="14" rx="4.5" fill="#2A2A2A" />
          {/* Jacket body */}
          <path d="M225 129 Q223 136 223 143 L265 143 Q265 136 263 129 Q254 124 244 124 Q234 124 225 129Z" fill="#1A1A1A" />
          {/* Collar V */}
          <path d="M239 129 L244 137 L249 129" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" fill="none" />
          {/* Neck */}
          <rect x="241" y="122" width="6" height="6" rx="2.5" fill={skin} />
          {/* Head */}
          <ellipse cx="244" cy="113" rx="13" ry="14" fill={skin} />
          {/* Curly hair */}
          <path d="M231 111 Q230 98 236 93 Q240 89 244 90 Q248 89 252 93 Q258 98 257 111" fill={sk} />
          <path d="M233 104 Q235 96 239 95 Q241 91 244 91 Q247 91 249 95 Q253 96 255 104" fill="#150800" />
          {/* Ears */}
          <ellipse cx="231" cy="115" rx="3" ry="4" fill="#B87840" />
          <ellipse cx="257" cy="115" rx="3" ry="4" fill="#B87840" />
          {/* Eyes */}
          <ellipse cx="239" cy="112" rx="2.5" ry="3" fill="#1A0A00" />
          <ellipse cx="249" cy="112" rx="2.5" ry="3" fill="#1A0A00" />
          {/* Eye shine */}
          <ellipse cx="240" cy="111" rx="1" ry="1.2" fill="white" opacity="0.7" />
          <ellipse cx="250" cy="111" rx="1" ry="1.2" fill="white" opacity="0.7" />
          {/* Smile */}
          <path d="M239 120 Q244 125 249 120" stroke="#1A0A00" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Left arm – raised toward sun */}
          <path d="M224 133 Q214 126 209 116" stroke="#1A1A1A" strokeWidth="9" strokeLinecap="round" fill="none" />
          <ellipse cx="208" cy="115" rx="5.5" ry="6" fill={skin} />
          {/* Right arm – relaxed */}
          <path d="M264 133 Q272 137 276 143" stroke="#1A1A1A" strokeWidth="9" strokeLinecap="round" fill="none" />
          <ellipse cx="276" cy="144" rx="5.5" ry="6" fill={skin} />
        </>
      )}
    </svg>
  );
}

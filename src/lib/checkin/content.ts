import type {
  CheckinBodyClueCategory,
  CheckinFeeling,
  CheckinFeelingGroup,
  CheckinImageAsset,
  CheckinStrategyCard,
  CheckinStrategyCategory,
  CheckinZone,
  GuidedCheckinContent,
} from "./types";

const CHECKIN_IMAGE_ROOT = "/images/checkin";

function asset(
  imagePath: string,
  alt: string,
  imageStatus: CheckinImageAsset["imageStatus"] = "ready",
  assetNote?: string
): CheckinImageAsset {
  return {
    imagePath,
    alt,
    imageStatus,
    assetNote,
  };
}

function zoneImage(fileName: string): string {
  return `${CHECKIN_IMAGE_ROOT}/zones/${fileName}`;
}

function feelingFolder(groupKey: CheckinFeelingGroup["key"]): string {
  return `${CHECKIN_IMAGE_ROOT}/feelings/${groupKey}`;
}

function feelingImage(groupKey: CheckinFeelingGroup["key"], fileName: string): string {
  return `${feelingFolder(groupKey)}/${fileName}`;
}

function bodyClueFolder(folderName: string): string {
  return `${CHECKIN_IMAGE_ROOT}/body-clues/${encodeURIComponent(folderName)}`;
}

function bodyClueImage(folderName: string, fileName: string): string {
  return `${bodyClueFolder(folderName)}/${fileName}`;
}

function strategyImage(fileName: string): string {
  return `${CHECKIN_IMAGE_ROOT}/strategies/${fileName}`;
}

const MISSING_STRATEGY_ASSET_NOTE =
  "Expected Canva export was not present in public/images/checkin/strategies when this registry was created.";

export const CHECKIN_ZONES = [
  {
    key: "red",
    label: "Big Red Feelings",
    supportingLine: "When feelings feel very big, fast, or hard to control.",
    emotionalGrouping: "intense survival feelings",
    feelings: ["angry", "terrified", "hyper", "overwhelmed", "super-sad", "scared"],
    ...asset(
      zoneImage("zone-red.png.png"),
      "Composite red regulation zone artwork with strong emotional faces."
    ),
  },
  {
    key: "yellow",
    label: "Busy Yellow Feelings",
    supportingLine: "When your body and brain feel busy, wiggly, or unsure.",
    emotionalGrouping: "activated, alert feelings",
    feelings: ["excited", "nervous", "confused", "silly", "worried", "frustrated"],
    ...asset(
      zoneImage("zone-yellow.png.png"),
      "Composite yellow regulation zone artwork with busy or energized emotional faces."
    ),
  },
  {
    key: "blue",
    label: "Low Blue Feelings",
    supportingLine: "When your energy feels low, heavy, or pulled inward.",
    emotionalGrouping: "low-energy feelings",
    feelings: ["sad", "upset", "tired", "sick", "bored", "discouraged"],
    ...asset(
      zoneImage("zone-blue.png.png"),
      "Composite blue regulation zone artwork with heavy or low-energy emotional faces."
    ),
  },
  {
    key: "green",
    label: "Ready Green Feelings",
    supportingLine: "When you feel steady, ready, and able to learn or connect.",
    emotionalGrouping: "regulated, ready feelings",
    feelings: ["happy", "calm", "thoughtful", "okay", "confident", "curious"],
    ...asset(
      zoneImage("zone-green.png.png"),
      "Composite green regulation zone artwork with steady and ready emotional faces."
    ),
  },
] as const satisfies readonly CheckinZone[];

export const CHECKIN_FEELINGS = [
  { key: "angry", label: "Angry", zoneKey: "red", groupKey: "angry" },
  { key: "terrified", label: "Terrified", zoneKey: "red", groupKey: "scared" },
  { key: "hyper", label: "Hyper", zoneKey: "red" },
  { key: "overwhelmed", label: "Overwhelmed", zoneKey: "red" },
  { key: "super-sad", label: "Super Sad", zoneKey: "red", groupKey: "sad" },
  { key: "scared", label: "Scared", zoneKey: "red", groupKey: "scared" },
  { key: "excited", label: "Excited", zoneKey: "yellow", groupKey: "happy" },
  { key: "nervous", label: "Nervous", zoneKey: "yellow", groupKey: "scared" },
  { key: "confused", label: "Confused", zoneKey: "yellow" },
  { key: "silly", label: "Silly", zoneKey: "yellow" },
  { key: "worried", label: "Worried", zoneKey: "yellow", groupKey: "scared" },
  { key: "frustrated", label: "Frustrated", zoneKey: "yellow", groupKey: "angry" },
  { key: "sad", label: "Sad", zoneKey: "blue", groupKey: "sad" },
  { key: "upset", label: "Upset", zoneKey: "blue", groupKey: "angry" },
  { key: "tired", label: "Tired", zoneKey: "blue" },
  { key: "sick", label: "Sick", zoneKey: "blue" },
  { key: "bored", label: "Bored", zoneKey: "blue" },
  { key: "discouraged", label: "Discouraged", zoneKey: "blue", groupKey: "sad" },
  { key: "happy", label: "Happy", zoneKey: "green", groupKey: "happy" },
  { key: "calm", label: "Calm", zoneKey: "green" },
  { key: "thoughtful", label: "Thoughtful", zoneKey: "green" },
  { key: "okay", label: "Okay", zoneKey: "green" },
  { key: "confident", label: "Confident", zoneKey: "green" },
  { key: "curious", label: "Curious", zoneKey: "green" },
] as const satisfies readonly CheckinFeeling[];

export const CHECKIN_FEELING_GROUPS = [
  {
    key: "angry",
    label: "Angry Also Means",
    supportingLine: "These are other words someone might use for angry feelings.",
    folderPath: feelingFolder("angry"),
    feelings: [
      {
        key: "mad",
        label: "Mad",
        ...asset(feelingImage("angry", "feeling-angry-mad.png.png"), "Mad feeling illustration."),
      },
      {
        key: "upset",
        label: "Upset",
        ...asset(feelingImage("angry", "feeling-angry-upset.png"), "Upset feeling illustration."),
      },
      {
        key: "irritated",
        label: "Irritated",
        ...asset(
          feelingImage("angry", "feeling-angry-irritated.png"),
          "Irritated feeling illustration."
        ),
      },
      {
        key: "annoyed",
        label: "Annoyed",
        ...asset(
          feelingImage("angry", "feelings-angry-annoyed.jpg.png"),
          "Annoyed feeling illustration."
        ),
      },
      {
        key: "bothered",
        label: "Bothered",
        ...asset(
          feelingImage("angry", "feelings-angry-bothered.png"),
          "Bothered feeling illustration."
        ),
      },
      {
        key: "frustrated",
        label: "Frustrated",
        ...asset(
          feelingImage("angry", "feelings-angry-frustrated.png"),
          "Frustrated feeling illustration."
        ),
      },
      {
        key: "hurt",
        label: "Hurt",
        ...asset(feelingImage("angry", "feelings-angry-hurt.png"), "Hurt feeling illustration."),
      },
      {
        key: "defensive",
        label: "Defensive",
        ...asset(
          feelingImage("angry", "feelings-angry-defensive.png"),
          "Defensive feeling illustration."
        ),
      },
      {
        key: "furious",
        label: "Furious",
        ...asset(
          feelingImage("angry", "feelings-angry-furious.png"),
          "Furious feeling illustration."
        ),
      },
    ],
  },
  {
    key: "happy",
    label: "Happy Also Means",
    supportingLine: "These are other words someone might use for happy feelings.",
    folderPath: feelingFolder("happy"),
    feelings: [
      {
        key: "glad",
        label: "Glad",
        ...asset(feelingImage("happy", "feelings-happy-glad.png"), "Glad feeling illustration."),
      },
      {
        key: "excited",
        label: "Excited",
        ...asset(
          feelingImage("happy", "feelings-happy-Excited.png"),
          "Excited feeling illustration."
        ),
      },
      {
        key: "joyful",
        label: "Joyful",
        ...asset(
          feelingImage("happy", "feelings-happy-joyful.png"),
          "Joyful feeling illustration."
        ),
      },
      {
        key: "proud",
        label: "Proud",
        ...asset(feelingImage("happy", "feelings-happy-proud.png"), "Proud feeling illustration."),
      },
      {
        key: "hopeful",
        label: "Hopeful",
        ...asset(
          feelingImage("happy", "feelings-happy-hopeful.png"),
          "Hopeful feeling illustration."
        ),
      },
      {
        key: "loved",
        label: "Loved",
        ...asset(feelingImage("happy", "feelings-happy-loved.png"), "Loved feeling illustration."),
      },
      {
        key: "grateful",
        label: "Grateful",
        ...asset(
          feelingImage("happy", "feelings-happy-grateful.png"),
          "Grateful feeling illustration."
        ),
      },
      {
        key: "peaceful",
        label: "Peaceful",
        ...asset(
          feelingImage("happy", "feelings-happy-peaceful.png"),
          "Peaceful feeling illustration."
        ),
      },
      {
        key: "cheerful",
        label: "Cheerful",
        ...asset(
          feelingImage("happy", "feelings-happy-cheerful.png"),
          "Cheerful feeling illustration."
        ),
      },
    ],
  },
  {
    key: "sad",
    label: "Sad Also Means",
    supportingLine: "These are other words someone might use for sad feelings.",
    folderPath: feelingFolder("sad"),
    feelings: [
      {
        key: "down",
        label: "Down",
        ...asset(feelingImage("sad", "feelings-sad-down.png"), "Down feeling illustration."),
      },
      {
        key: "unhappy",
        label: "Unhappy",
        ...asset(
          feelingImage("sad", "feelings-sad-unhappy.png"),
          "Unhappy feeling illustration."
        ),
      },
      {
        key: "lonely",
        label: "Lonely",
        ...asset(feelingImage("sad", "feelings-sad-lonely.png"), "Lonely feeling illustration."),
      },
      {
        key: "disappointed",
        label: "Disappointed",
        ...asset(
          feelingImage("sad", "feelings-sad-dissapointed.png"),
          "Disappointed feeling illustration."
        ),
      },
      {
        key: "discouraged",
        label: "Discouraged",
        ...asset(
          feelingImage("sad", "feelings-sad-discouraged.png"),
          "Discouraged feeling illustration."
        ),
      },
      {
        key: "gloomy",
        label: "Gloomy",
        ...asset(feelingImage("sad", "feelings-sad-gloomy.png"), "Gloomy feeling illustration."),
      },
      {
        key: "heartbroken",
        label: "Heartbroken",
        ...asset(
          feelingImage("sad", "feelings-sad-heartbroken.png"),
          "Heartbroken feeling illustration."
        ),
      },
      {
        key: "depressed",
        label: "Depressed",
        ...asset(
          feelingImage("sad", "feelings-sad-depressed.png"),
          "Depressed feeling illustration."
        ),
      },
    ],
  },
  {
    key: "scared",
    label: "Scared Also Means",
    supportingLine: "These are other words someone might use for scared feelings.",
    folderPath: feelingFolder("scared"),
    feelings: [
      {
        key: "afraid",
        label: "Afraid",
        ...asset(
          feelingImage("scared", "feelings-scared-afraid.png"),
          "Afraid feeling illustration."
        ),
      },
      {
        key: "fearful",
        label: "Fearful",
        ...asset(
          feelingImage("scared", "feelings-scared-fearful.png"),
          "Fearful feeling illustration."
        ),
      },
      {
        key: "nervous",
        label: "Nervous",
        ...asset(
          feelingImage("scared", "feelings-scared-nervous.png"),
          "Nervous feeling illustration."
        ),
      },
    ],
  },
] as const satisfies readonly CheckinFeelingGroup[];

export const CHECKIN_BODY_CLUE_CATEGORIES = [
  {
    key: "heart-breathing",
    label: "Heart / Breathing",
    supportingLine: "Notice what your heart and breathing are doing right now.",
    folderPath: bodyClueFolder("Heart Breathing"),
    clues: [
      {
        key: "fast-heartbeat",
        label: "Fast Heartbeat",
        ...asset(
          bodyClueImage("Heart Breathing", "body-heart-fast-heartbeat.png.png"),
          "Fast heartbeat body clue illustration."
        ),
      },
      {
        key: "breathing-fast",
        label: "Breathing Fast",
        ...asset(
          bodyClueImage("Heart Breathing", "body-heart-breathing-fast.png.png"),
          "Breathing fast body clue illustration."
        ),
      },
      {
        key: "holding-my-breath",
        label: "Holding My Breath",
        ...asset(
          bodyClueImage("Heart Breathing", "body-heart-holding-my-breath.png"),
          "Holding my breath body clue illustration."
        ),
      },
      {
        key: "hard-to-breathe",
        label: "Hard to Breathe",
        ...asset(
          bodyClueImage("Heart Breathing", "body-heart-hard-to-breathe.png.png"),
          "Hard to breathe body clue illustration."
        ),
      },
    ],
  },
  {
    key: "head-face",
    label: "Head / Face",
    supportingLine: "Check for changes in your face, head, and eyes.",
    folderPath: bodyClueFolder("Head Face"),
    clues: [
      {
        key: "hot-face",
        label: "Hot Face",
        ...asset(
          bodyClueImage("Head Face", "body-head-hot-face.png.png"),
          "Hot face body clue illustration."
        ),
      },
      {
        key: "sweaty",
        label: "Sweaty",
        ...asset(
          bodyClueImage("Head Face", "body-head-sweaty.png.png"),
          "Sweaty body clue illustration."
        ),
      },
      {
        key: "headache",
        label: "Headache",
        ...asset(
          bodyClueImage("Head Face", "body-head-headache.png.png"),
          "Headache body clue illustration."
        ),
      },
      {
        key: "heavy-eyes",
        label: "Heavy Eyes",
        ...asset(
          bodyClueImage("Head Face", "body-head-heavy-eyes.png.png"),
          "Heavy eyes body clue illustration."
        ),
      },
    ],
  },
  {
    key: "stomach",
    label: "Stomach",
    supportingLine: "Listen for clues from your stomach and hunger signals.",
    folderPath: bodyClueFolder("Stomach"),
    clues: [
      {
        key: "butterflies",
        label: "Butterflies",
        ...asset(
          bodyClueImage("Stomach", "body-stomach-butterflies.png.png"),
          "Butterflies in stomach body clue illustration."
        ),
      },
      {
        key: "stomach-hurts",
        label: "Stomach Hurts",
        ...asset(
          bodyClueImage("Stomach", "body-stomach-stomach-hurts.png.png"),
          "Stomach hurts body clue illustration."
        ),
      },
      {
        key: "feel-sick",
        label: "Feel Sick",
        ...asset(
          bodyClueImage("Stomach", "body-stomach-feel-sick.png.png"),
          "Feel sick body clue illustration."
        ),
      },
      {
        key: "not-hungry",
        label: "Not Hungry",
        ...asset(
          bodyClueImage("Stomach", "body-stomach-not-hungry.png.png"),
          "Not hungry body clue illustration."
        ),
      },
      {
        key: "too-hungry",
        label: "Too Hungry",
        ...asset(
          bodyClueImage("Stomach", "body-stomach-too-hungry.png.png"),
          "Too hungry body clue illustration."
        ),
      },
    ],
  },
  {
    key: "hands-muscles",
    label: "Hands / Muscles",
    supportingLine: "See whether your muscles are shaky, tight, or clenched.",
    folderPath: bodyClueFolder("Hand Muscles"),
    clues: [
      {
        key: "shaky-hands",
        label: "Shaky Hands",
        ...asset(
          bodyClueImage("Hand Muscles", "body-muscles-shaky-hands.png.png"),
          "Shaky hands body clue illustration."
        ),
      },
      {
        key: "clenched-fists",
        label: "Clenched Fists",
        ...asset(
          bodyClueImage("Hand Muscles", "body-muscles-clenched-fists.png.png"),
          "Clenched fists body clue illustration."
        ),
      },
      {
        key: "tight-shoulders",
        label: "Tight Shoulders",
        ...asset(
          bodyClueImage("Hand Muscles", "body-muscles-tight-shoulders.png.png"),
          "Tight shoulders body clue illustration."
        ),
      },
      {
        key: "tight-jaw",
        label: "Tight Jaw",
        ...asset(
          bodyClueImage("Hand Muscles", "body-muscles-tight-jaw.png.png"),
          "Tight jaw body clue illustration."
        ),
      },
    ],
  },
  {
    key: "energy-movement",
    label: "Energy / Movement",
    supportingLine: "Notice whether your body wants to move, wiggle, or bounce.",
    folderPath: bodyClueFolder("Energy Movement"),
    clues: [
      {
        key: "cant-sit-still",
        label: "Can't Sit Still",
        ...asset(
          bodyClueImage("Energy Movement", "body-movement-cant-sit-still.png.png"),
          "Can't sit still body clue illustration."
        ),
      },
      {
        key: "restless",
        label: "Restless",
        ...asset(
          bodyClueImage("Energy Movement", "body-movement-restless.png.png"),
          "Restless body clue illustration."
        ),
      },
      {
        key: "need-to-move",
        label: "Need to Move",
        ...asset(
          bodyClueImage("Energy Movement", "body-movement-need-to-move.png.png"),
          "Need to move body clue illustration."
        ),
      },
      {
        key: "bouncing-fidgety",
        label: "Bouncing / Fidgety",
        ...asset(
          bodyClueImage("Energy Movement", "body-movement-bouncing-fidgety.png.png"),
          "Bouncing or fidgety body clue illustration."
        ),
      },
    ],
  },
  {
    key: "freeze-shutdown",
    label: "Freeze / Shutdown",
    supportingLine: "Look for signs that your body has gone still or shut down.",
    folderPath: bodyClueFolder("Freeze Shutdown"),
    clues: [
      {
        key: "stuck",
        label: "Stuck",
        ...asset(
          bodyClueImage("Freeze Shutdown", "body-freeze-stuck.png.png"),
          "Stuck body clue illustration."
        ),
      },
      {
        key: "blank-mind",
        label: "Blank Mind",
        ...asset(
          bodyClueImage("Freeze Shutdown", "body-freeze-blank-mind.png.png"),
          "Blank mind body clue illustration."
        ),
      },
      {
        key: "quiet",
        label: "Quiet",
        ...asset(
          bodyClueImage("Freeze Shutdown", "body-freeze-quiet.png.png"),
          "Quiet body clue illustration."
        ),
      },
      {
        key: "cant-talk",
        label: "Can't Talk",
        ...asset(
          bodyClueImage("Freeze Shutdown", "body-freeze-cant-talk.png.png"),
          "Can't talk body clue illustration."
        ),
      },
    ],
  },
  {
    key: "tears-sadness",
    label: "Tears / Sadness",
    supportingLine: "Notice whether sadness is showing up in your throat, eyes, or tears.",
    folderPath: bodyClueFolder("Tears Sadness"),
    clues: [
      {
        key: "lump-in-throat",
        label: "Lump in Throat",
        ...asset(
          bodyClueImage("Tears Sadness", "body-sadness-lump-in-throat.png.png"),
          "Lump in throat body clue illustration."
        ),
      },
      {
        key: "watery-eyes",
        label: "Watery Eyes",
        ...asset(
          bodyClueImage("Tears Sadness", "body-sadness-watery-eyes.png.png"),
          "Watery eyes body clue illustration."
        ),
      },
      {
        key: "want-to-cry",
        label: "Want to Cry",
        ...asset(
          bodyClueImage("Tears Sadness", "body-sadness-want-to-cry.png.png"),
          "Want to cry body clue illustration."
        ),
      },
    ],
  },
] as const satisfies readonly CheckinBodyClueCategory[];

export const CHECKIN_STRATEGY_CATEGORIES = [
  {
    key: "calm-your-mind",
    label: "Calm Your Mind",
    supportingLine: "Use words, humor, and imagination to steady what is happening inside.",
  },
  {
    key: "body-calmers",
    label: "Body Calmers",
    supportingLine: "Help your body release tension and slow physical stress signals.",
  },
  {
    key: "release-energy",
    label: "Release Energy",
    supportingLine: "Move strong energy in safe, intentional ways.",
  },
  {
    key: "social-support",
    label: "Social Support",
    supportingLine: "Lean on caring people when feelings are too big to hold alone.",
  },
  {
    key: "safe-distractions",
    label: "Safe Distractions",
    supportingLine: "Give your brain a gentle break so it can reset and refocus.",
  },
  {
    key: "basic-needs-self-care",
    label: "Basic Needs / Self-Care",
    supportingLine: "Meet the basics that help your body and brain feel more settled.",
  },
  {
    key: "creative-outlets",
    label: "Creative Outlets",
    supportingLine: "Use making and creating to express what is hard to say.",
  },
] as const satisfies readonly CheckinStrategyCategory[];

export const CHECKIN_STRATEGY_CARDS = [
  {
    key: "write-down-your-feelings",
    title: "Write Down Your Feelings",
    description: "Put your feelings into simple words on paper or in a notebook.",
    whyItHelps: "Naming feelings can make them feel less tangled and easier to understand.",
    category: "calm-your-mind",
    ...asset(
      strategyImage("strategy-write-down-your-feelings.png.png"),
      "Write down your feelings strategy illustration."
    ),
  },
  {
    key: "journaling",
    title: "Journaling",
    description: "Spend a few minutes writing whatever is on your mind.",
    whyItHelps: "Longer writing can slow racing thoughts and help you notice patterns.",
    category: "calm-your-mind",
    ...asset(strategyImage("strategy-journaling.png.png"), "Journaling strategy illustration."),
  },
  {
    key: "think-of-something-funny",
    title: "Think of Something Funny",
    description: "Bring a silly memory, joke, or image into your mind.",
    whyItHelps: "A little humor can soften stress and help your brain shift gears.",
    category: "calm-your-mind",
    ...asset(
      strategyImage("strategy-think-of-something-funny.png.png"),
      "Think of something funny strategy illustration."
    ),
  },
  {
    key: "positive-self-talk",
    title: "Positive Self-Talk",
    description: "Say one kind, steady sentence to yourself.",
    whyItHelps: "Supportive self-talk can interrupt harsh thoughts and build confidence.",
    category: "calm-your-mind",
    ...asset(
      strategyImage("strategy-positive-self-talk.png.png"),
      "Positive self-talk strategy illustration."
    ),
  },
  {
    key: "positive-notes",
    title: "Positive Notes",
    description: "Read or make short notes with encouraging words.",
    whyItHelps: "Friendly reminders can help your brain remember safety, hope, and support.",
    category: "calm-your-mind",
    ...asset(
      strategyImage("strategy-positive-notes.png.png"),
      "Positive notes strategy illustration."
    ),
  },
  {
    key: "visualize-your-favorite-place",
    title: "Visualize Your Favorite Place",
    description: "Picture a place where you feel calm, safe, or happy.",
    whyItHelps: "Imagining a safe place can help your body settle and slow down.",
    category: "calm-your-mind",
    ...asset(
      strategyImage("strategy-visualize-your-favorite-place.png.png"),
      "Visualize your favorite place strategy illustration."
    ),
  },
  {
    key: "make-a-to-do-list",
    title: "Make a To-Do List",
    description: "Write down the next small things you need to remember or do.",
    whyItHelps: "A short list can reduce overwhelm by turning big worry into clear steps.",
    category: "calm-your-mind",
    ...asset(
      strategyImage("strategy-make-a-to-do-list.png.png"),
      "Make a to-do list strategy illustration."
    ),
  },
  {
    key: "stretch-your-neck",
    title: "Stretch Your Neck",
    description: "Gently tip and stretch your neck to release tightness.",
    whyItHelps: "Slow stretching can lower tension your body is holding onto.",
    category: "body-calmers",
    ...asset(
      strategyImage("strategy-stretch-your-neck.png.png"),
      "Stretch your neck strategy illustration."
    ),
  },
  {
    key: "roll-your-shoulders",
    title: "Roll Your Shoulders",
    description: "Roll your shoulders slowly forward and backward a few times.",
    whyItHelps: "Shoulder rolls can loosen stress that gathers in the upper body.",
    category: "body-calmers",
    ...asset(
      strategyImage("strategy-roll-your-shoulders.png.png"),
      "Roll your shoulders strategy illustration."
    ),
  },
  {
    key: "close-your-eyes-and-relax",
    title: "Close Your Eyes and Relax",
    description: "Pause for a moment and let your eyes rest while you breathe.",
    whyItHelps: "Reducing visual input can help your brain and body calm down.",
    category: "body-calmers",
    ...asset(
      strategyImage("strategy-close-your-eyes-and-relax.png.png"),
      "Close your eyes and relax strategy illustration."
    ),
  },
  {
    key: "press-your-hands-together",
    title: "Press Your Hands Together",
    description: "Push your palms together and feel the steady pressure.",
    whyItHelps: "Heavy pressure can help organize your body when you feel tense or shaky.",
    category: "body-calmers",
    ...asset(
      strategyImage("strategy-press-your-hands-together.png.png"),
      "Press your hands together strategy illustration."
    ),
  },
  {
    key: "splash-water-on-your-face",
    title: "Splash Water on Your Face",
    description: "Use cool water on your face to help your body reset.",
    whyItHelps: "A quick sensory change can interrupt stress and help you refocus.",
    category: "body-calmers",
    ...asset(
      strategyImage("strategy-splash-water-on-your-face.png.png"),
      "Splash water on your face strategy illustration.",
      "pending",
      MISSING_STRATEGY_ASSET_NOTE
    ),
  },
  {
    key: "count-to-10",
    title: "Count to 10",
    description: "Count slowly from one to ten before you react.",
    whyItHelps: "Counting adds a pause that gives your body and brain time to settle.",
    category: "body-calmers",
    ...asset(
      strategyImage("strategy-count-to-10.png.png"),
      "Count to 10 strategy illustration."
    ),
  },
  {
    key: "count-on-your-fingers",
    title: "Count on Your Fingers",
    description: "Use your fingers to count each breath or number.",
    whyItHelps: "Touch plus counting can anchor your attention in one simple rhythm.",
    category: "body-calmers",
    ...asset(
      strategyImage("strategy-count-on-your-fingers.png.png"),
      "Count on your fingers strategy illustration."
    ),
  },
  {
    key: "shake-out-your-hands",
    title: "Shake Out Your Hands",
    description: "Shake your hands to let out extra energy.",
    whyItHelps: "Small movement can release tension before it builds bigger.",
    category: "release-energy",
    ...asset(
      strategyImage("strategy-shake-out-your-hands.png.png"),
      "Shake out your hands strategy illustration."
    ),
  },
  {
    key: "jog-in-place",
    title: "Jog in Place",
    description: "Move your feet for a short burst right where you are.",
    whyItHelps: "Quick movement helps your body use up restless energy safely.",
    category: "release-energy",
    ...asset(
      strategyImage("strategy-jog-in-place.png.png"),
      "Jog in place strategy illustration.",
      "pending",
      MISSING_STRATEGY_ASSET_NOTE
    ),
  },
  {
    key: "wall-pushes",
    title: "Wall Pushes",
    description: "Press into a wall with strong, steady pushes.",
    whyItHelps: "Heavy work helps your muscles release big energy in a safe way.",
    category: "release-energy",
    ...asset(
      strategyImage("strategy-wall-pushes.png.png"),
      "Wall pushes strategy illustration."
    ),
  },
  {
    key: "go-for-a-walk",
    title: "Go for a Walk",
    description: "Take a short walk to help your body reset.",
    whyItHelps: "Walking can calm strong feelings by giving them somewhere to go.",
    category: "release-energy",
    ...asset(
      strategyImage("strategy-go-for-a-walk.png.png"),
      "Go for a walk strategy illustration."
    ),
  },
  {
    key: "stretch-your-body",
    title: "Stretch Your Body",
    description: "Reach and stretch from head to toe.",
    whyItHelps: "Full-body movement can loosen tension and improve body awareness.",
    category: "release-energy",
    ...asset(
      strategyImage("strategy-stretch-your-body.png.png"),
      "Stretch your body strategy illustration."
    ),
  },
  {
    key: "talk-to-a-friend",
    title: "Talk to a Friend",
    description: "Check in with a friend who helps you feel understood.",
    whyItHelps: "Connection can make hard feelings feel lighter and less lonely.",
    category: "social-support",
    ...asset(
      strategyImage("strategy-talk-to-a-friend.png.png"),
      "Talk to a friend strategy illustration."
    ),
  },
  {
    key: "talk-to-an-adult",
    title: "Talk to an Adult",
    description: "Tell a trusted adult what is going on for you.",
    whyItHelps: "Adults can help you feel safe, supported, and less stuck.",
    category: "social-support",
    ...asset(
      strategyImage("strategy-talk-to-an-adult.png.png"),
      "Talk to an adult strategy illustration."
    ),
  },
  {
    key: "talk-to-a-parent",
    title: "Talk to a Parent",
    description: "Reach out to a parent or caregiver you trust.",
    whyItHelps: "Talking with home support can help you feel cared for and understood.",
    category: "social-support",
    ...asset(
      strategyImage("strategy-talk-to-a-parent.png.png"),
      "Talk to a parent strategy illustration.",
      "pending",
      MISSING_STRATEGY_ASSET_NOTE
    ),
  },
  {
    key: "get-a-hug",
    title: "Get a Hug",
    description: "Ask for a hug from a safe person if hugs feel helpful.",
    whyItHelps: "Safe comfort can help your nervous system feel more settled.",
    category: "social-support",
    ...asset(strategyImage("strategy-get-a-hug.png.png"), "Get a hug strategy illustration."),
  },
  {
    key: "do-something-kind",
    title: "Do Something Kind",
    description: "Choose one kind action for yourself or someone else.",
    whyItHelps: "Kindness can shift attention from stress toward connection and purpose.",
    category: "social-support",
    ...asset(
      strategyImage("strategy-do-something-kind.png.png"),
      "Do something kind strategy illustration."
    ),
  },
  {
    key: "listen-to-music",
    title: "Listen to Music",
    description: "Play music that helps your body feel calm or steady.",
    whyItHelps: "Music can change your pace, mood, and focus.",
    category: "safe-distractions",
    ...asset(
      strategyImage("strategy-listen-to-music.png.png"),
      "Listen to music strategy illustration."
    ),
  },
  {
    key: "play-a-game",
    title: "Play a Game",
    description: "Spend a few minutes on a simple game or playful activity.",
    whyItHelps: "Play can give your brain a break from looping thoughts.",
    category: "safe-distractions",
    ...asset(strategyImage("strategy-play-a-game.png.png"), "Play a game strategy illustration."),
  },
  {
    key: "distract-your-brain",
    title: "Distract Your Brain",
    description: "Choose a safe, short activity that helps you think about something else.",
    whyItHelps: "A healthy distraction can create space before you come back to the feeling.",
    category: "safe-distractions",
    ...asset(
      strategyImage("strategy-distract-your-brain.png.png"),
      "Distract your brain strategy illustration.",
      "pending",
      MISSING_STRATEGY_ASSET_NOTE
    ),
  },
  {
    key: "use-a-fidget",
    title: "Use a Fidget",
    description: "Keep your hands busy with a fidget or small object.",
    whyItHelps: "Hand movement can help your body focus and stay grounded.",
    category: "safe-distractions",
    ...asset(strategyImage("strategy-use-a-fidget.png.png"), "Use a fidget strategy illustration."),
  },
  {
    key: "find-a-comfy-spot",
    title: "Find a Comfy Spot",
    description: "Move to a cozy, calm place where your body can settle.",
    whyItHelps: "Comfort and quiet can lower stress and make it easier to reset.",
    category: "safe-distractions",
    ...asset(
      strategyImage("strategy-find-a-comfy-spot.png.png"),
      "Find a comfy spot strategy illustration."
    ),
  },
  {
    key: "get-a-snack",
    title: "Get a Snack",
    description: "Have a simple snack if hunger is making things feel harder.",
    whyItHelps: "Meeting hunger needs can improve focus, energy, and patience.",
    category: "basic-needs-self-care",
    ...asset(
      strategyImage("strategy-get-a-snack.png.png"),
      "Get a snack strategy illustration."
    ),
  },
  {
    key: "get-enough-sleep",
    title: "Get Enough Sleep",
    description: "Protect your sleep routine so your body can recharge.",
    whyItHelps: "Rest makes it easier to handle feelings, attention, and daily stress.",
    category: "basic-needs-self-care",
    ...asset(
      strategyImage("strategy-get-enough-sleep.png.png"),
      "Get enough sleep strategy illustration."
    ),
  },
  {
    key: "draw-something",
    title: "Draw Something",
    description: "Use drawing to show what you feel without needing many words.",
    whyItHelps: "Creative expression can help feelings move when talking is hard.",
    category: "creative-outlets",
    ...asset(
      strategyImage("strategy-draw-something.png.png"),
      "Draw something strategy illustration."
    ),
  },
  {
    key: "build-something",
    title: "Build Something",
    description: "Make or build with blocks, supplies, or small materials.",
    whyItHelps: "Hands-on creating can organize attention and channel energy into a plan.",
    category: "creative-outlets",
    ...asset(
      strategyImage("strategy-build-something.png.png"),
      "Build something strategy illustration."
    ),
  },
] as const satisfies readonly CheckinStrategyCard[];

export const GUIDED_CHECKIN_CONTENT = {
  zones: CHECKIN_ZONES,
  feelings: CHECKIN_FEELINGS,
  feelingGroups: CHECKIN_FEELING_GROUPS,
  bodyClueCategories: CHECKIN_BODY_CLUE_CATEGORIES,
  strategyCategories: CHECKIN_STRATEGY_CATEGORIES,
  strategyCards: CHECKIN_STRATEGY_CARDS,
} as const satisfies GuidedCheckinContent;

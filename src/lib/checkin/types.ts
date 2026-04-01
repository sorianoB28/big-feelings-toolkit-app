export type CheckinZoneKey = "red" | "yellow" | "blue" | "green";

export type CheckinFeelingKey =
  | "angry"
  | "terrified"
  | "hyper"
  | "overwhelmed"
  | "super-sad"
  | "scared"
  | "excited"
  | "nervous"
  | "confused"
  | "silly"
  | "worried"
  | "frustrated"
  | "sad"
  | "upset"
  | "tired"
  | "sick"
  | "bored"
  | "discouraged"
  | "happy"
  | "calm"
  | "thoughtful"
  | "okay"
  | "confident"
  | "curious";

export type CheckinFeelingGroupKey = "angry" | "happy" | "sad" | "scared";

export type CheckinBodyClueCategoryKey =
  | "heart-breathing"
  | "head-face"
  | "stomach"
  | "hands-muscles"
  | "energy-movement"
  | "freeze-shutdown"
  | "tears-sadness";

export type CheckinStrategyCategoryKey =
  | "calm-your-mind"
  | "body-calmers"
  | "release-energy"
  | "social-support"
  | "safe-distractions"
  | "basic-needs-self-care"
  | "creative-outlets";

export type CheckinStrategyKey =
  | "write-down-your-feelings"
  | "journaling"
  | "think-of-something-funny"
  | "positive-self-talk"
  | "positive-notes"
  | "visualize-your-favorite-place"
  | "make-a-to-do-list"
  | "stretch-your-neck"
  | "roll-your-shoulders"
  | "close-your-eyes-and-relax"
  | "press-your-hands-together"
  | "splash-water-on-your-face"
  | "count-to-10"
  | "count-on-your-fingers"
  | "shake-out-your-hands"
  | "jog-in-place"
  | "wall-pushes"
  | "go-for-a-walk"
  | "stretch-your-body"
  | "talk-to-a-friend"
  | "talk-to-an-adult"
  | "talk-to-a-parent"
  | "get-a-hug"
  | "do-something-kind"
  | "listen-to-music"
  | "play-a-game"
  | "distract-your-brain"
  | "use-a-fidget"
  | "find-a-comfy-spot"
  | "get-a-snack"
  | "get-enough-sleep"
  | "draw-something"
  | "build-something";

export type CheckinAssetStatus = "ready" | "pending";

export type CheckinImageAsset = {
  imagePath: string;
  alt: string;
  imageStatus: CheckinAssetStatus;
  assetNote?: string;
};

export type CheckinZone = CheckinImageAsset & {
  key: CheckinZoneKey;
  label: string;
  supportingLine: string;
  emotionalGrouping: string;
  feelings: readonly CheckinFeelingKey[];
};

export type CheckinFeeling = {
  key: CheckinFeelingKey;
  label: string;
  zoneKey: CheckinZoneKey;
  groupKey?: CheckinFeelingGroupKey;
};

export type CheckinFeelingVariant = CheckinImageAsset & {
  key: string;
  label: string;
};

export type CheckinFeelingGroup = {
  key: CheckinFeelingGroupKey;
  label: string;
  supportingLine: string;
  folderPath: string;
  feelings: readonly CheckinFeelingVariant[];
};

export type CheckinBodyClue = CheckinImageAsset & {
  key: string;
  label: string;
};

export type CheckinBodyClueCategory = {
  key: CheckinBodyClueCategoryKey;
  label: string;
  supportingLine: string;
  folderPath: string;
  clues: readonly CheckinBodyClue[];
};

export type CheckinStrategyCategory = {
  key: CheckinStrategyCategoryKey;
  label: string;
  supportingLine: string;
};

export type CheckinStrategyCard = CheckinImageAsset & {
  key: CheckinStrategyKey;
  title: string;
  description: string;
  whyItHelps: string;
  category: CheckinStrategyCategoryKey;
};

export type GuidedCheckinContent = {
  zones: readonly CheckinZone[];
  feelings: readonly CheckinFeeling[];
  feelingGroups: readonly CheckinFeelingGroup[];
  bodyClueCategories: readonly CheckinBodyClueCategory[];
  strategyCategories: readonly CheckinStrategyCategory[];
  strategyCards: readonly CheckinStrategyCard[];
};

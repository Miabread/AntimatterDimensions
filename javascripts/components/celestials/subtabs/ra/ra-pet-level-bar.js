"use strict";

Vue.component("ra-pet-level-bar", {
  props: {
    petConfig: Object
  },
  data() {
    return {
      isUnlocked: false,
      level: 0,
      exp: 0,
      requiredExp: 0,
      expBoost: 0,
      lastTenGlyphLevls: [],
      lastTenRunTimers: [],
    };
  },
  computed: {
    shift() {
      return ui.view.shiftDown;
    },
    importantLevels: () => [2, 3, 5, 10, 15, 25],
    pet() {
      return this.petConfig.pet;
    },
    petColor() {
      return this.pet.color;
    },
    unlocks() {
      return Object.values(RA_UNLOCKS).filter(unlock => unlock.pet.name === this.pet.name);
    },
    percentPerLevel() {
      return 100 / (this.currentLevelGoal - 1);
    },
    multiLevelStyle() {
      return {
        width: `${Math.min((this.level - 1 + this.exp / this.requiredExp) * this.percentPerLevel, 100)}%`
      };
    },
    singleLevelStyle() {
      return {
        width: `${this.exp / this.requiredExp * 100}%`
      };
    },
    petStyle() {
      return {
        "background-color": this.petColor
      };
    },
    currentLevelGoal() {
      if (this.shift) return this.level + 1;
      return this.importantLevels.find(goal => goal > this.level || goal === 25);
    },
    expPerMin() {
      const avgLvl = this.lastTenGlyphLevls.reduce((acc, value) => acc + value, 0) / 10;
      const avgTimeMs = this.lastTenRunTimers.reduce((acc, value) => acc + value, 0) / 10;
      const expGain = Math.pow(2, avgLvl / 500 - 10);
      return Math.round(expGain / (avgTimeMs / 60000));
    },
    activeUnlock() {
      if (this.shift) {
        return {
          description: `Get ${this.pet.name} to level ${this.currentLevelGoal}`,
          reward: `${shorten(Math.floor(this.exp), 2)}/${shorten(this.requiredExp, 2)} exp`,
          expPerMin: `${shorten(this.expPerMin, 2)}/min over last 10 realities`
        };
      }
      return this.unlocks.find(unlock => unlock.level === this.currentLevelGoal);
    }
  },
  methods: {
    update() {
      const pet = this.pet;
      this.isUnlocked = pet.isUnlocked;
      if (!this.isUnlocked) return;
      this.exp = pet.exp;
      this.expBoost = pet.expBoost;
      this.level = pet.level;
      this.requiredExp = pet.requiredExp;
      this.lastTenGlyphLevls = player.lastTenRealities.map(([, , , lvl]) => lvl);
      this.lastTenRunTimers = player.lastTenRealities.map(([, , time]) => time);
    },
    findUnlockByLevel(lvl) {
      return this.unlocks.find(unlock => unlock.level === lvl);
    }
  },
  template: `
    <div class="l-ra-bar-container">
      <div class="l-ra-exp-bar">
        <div v-if="shift">
          <ra-level-chevron v-for="lvl in 2"
            :key="currentLevelGoal - 2 + lvl"
            :level ="currentLevelGoal - 2 + lvl"
            :goal="currentLevelGoal"
            :singleLevel="true"
          />
        </div>
        <div v-else>
          <ra-level-chevron v-for="lvl in (currentLevelGoal - 1)"
            :key="lvl"
            :level="lvl"
            :goal="currentLevelGoal"
            :unlock="findUnlockByLevel(lvl)"
          />
        </div>
        <div class="l-ra-exp-bar-inner" :style="[shift ? singleLevelStyle : multiLevelStyle, petStyle]" />
      </div>
        <div class="l-ra-unlock" :style="petStyle">
          <div class="l-ra-unlock-inner">
            <b>{{ activeUnlock.description }}</b>
            <p>{{ activeUnlock.reward }}</p>
            <p v-if="shift">{{ activeUnlock.expPerMin }} </p>
          </div>
        </div>
    </div>
  `
});
import { Mofu } from './mofus/Mofu';
import type { MofuConfig } from '../../../mofus/types';
import { BackgroundRenderer } from './background/BackgroundRenderer';
import type { SceneSpec } from '../../../scenes/types';

// Extend the Window interface to include mofuConfigs, mofuFramesList, sceneConfig, and sceneTiles
declare global {
  interface Window {
    mofuConfigs: MofuConfig[];
    mofuFramesList: string[][];
    sceneConfig: SceneSpec;
    sceneTiles: Record<string, string>;
  }
}

class MofuKeeper {
  private configs: MofuConfig[];
  private framesList: string[][];
  private active: Map<string, Mofu> = new Map();
  private groundTileNum: number;
  private groundEdgeTileNum: number;

  constructor(configs: MofuConfig[], framesList: string[][], groundTileNum = 1, groundEdgeTileNum = 1) {
    this.configs = configs;
    this.framesList = framesList;
    this.groundTileNum = groundTileNum;
    this.groundEdgeTileNum = groundEdgeTileNum;
    this.summonMofu();
    this.scheduleNextMofu();
  }

  private scheduleNextMofu() {
    setTimeout(() => this.trySummonOrDismissMofu(), 20000 + Math.random() * 3000);
  }

  private summonMofu() {
    const available = this.configs.filter((cfg) => !this.active.has(cfg.id));
    if (available.length === 0) {
      return;
    }

    const idx = Math.floor(Math.random() * available.length);
    const config = available[idx];
    const frames = this.framesList[this.configs.indexOf(config)];
    const mofu = new Mofu(config, frames, this.groundTileNum, this.groundEdgeTileNum, () =>
      this.handleMofuDismissed(config.id),
    );
    this.active.set(config.id, mofu);
    console.log(`Mofu Summoned: ${config.name} (${config.id})`);
  }
  private dismissMofu() {
    const activeIds = Array.from(this.active.keys());
    if (activeIds.length === 0) {
      return;
    }
    const activeId = activeIds[Math.floor(Math.random() * activeIds.length)];
    const mofu = this.active.get(activeId);
    if (mofu) {
      mofu.dismissMofu();
    }
  }

  private trySummonOrDismissMofu() {
    const available = this.configs.filter((cfg) => !this.active.has(cfg.id));
    const activeIds = Array.from(this.active.keys());

    // Entry 60%, Exit 40%
    const shouldSummon = 0.6;
    if (available.length > 0 && Math.random() < shouldSummon) {
      this.summonMofu();
    } else if (activeIds.length > 2) {
      // Keeper-initiated exits only happen while 3+ Mofus are around, so at least 2 stay.
      // Mofus also leave on their own (see Mofu's MAX_ACTIVE_DURATION_MS); when the last one
      // does, handleMofuDismissed summons a replacement so the terrarium never looks empty.
      this.dismissMofu();
    }
    this.scheduleNextMofu();
  }

  private handleMofuDismissed(mofuId: string) {
    if (!this.active.delete(mofuId)) {
      return;
    }
    console.log(`Mofu Dismissed: ${mofuId}`);

    if (this.active.size === 0) {
      // The terrarium just became empty. Summon a replacement right away instead of
      // waiting up to ~23s for the next tick, which may also decide not to summon.
      this.summonMofu();
    }
  }
}

const configs = window.mofuConfigs;
const framesList = window.mofuFramesList;
const sceneConfig = window.sceneConfig;
const sceneTiles = window.sceneTiles;

if (configs && framesList && sceneConfig && sceneTiles) {
  const keeper = new MofuKeeper(
    configs,
    framesList,
    sceneConfig.ground.numTile,
    sceneConfig.groundEdge.numTile,
  );
  console.log('Mofu initialized:', configs.map((c) => c.name).join(', '));
} else {
  console.error('Failed to load mofu config or frames');
}

try {
  new BackgroundRenderer(sceneConfig, sceneTiles);
  console.log('Background initialized:', sceneConfig.name);
} catch (error) {
  console.error('Failed to load scene config or tiles', error);
}

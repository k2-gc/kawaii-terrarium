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
  private borderTileNum: number;

  constructor(configs: MofuConfig[], framesList: string[][], groundTileNum = 1, borderTileNum = 1) {
    this.configs = configs;
    this.framesList = framesList;
    this.groundTileNum = groundTileNum;
    this.borderTileNum = borderTileNum;
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
    const mofu = new Mofu(config, frames, this.groundTileNum, this.borderTileNum, () =>
      this.handleMofuDismissed(config.id)
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
      // Ensure at least one mofu remains
      this.dismissMofu();
    }
    this.scheduleNextMofu();
  }
  public dismissAll() {
    const activeCount = this.active.size;
    if (activeCount === 0) {
      this.notifyAllDismissed();
      return;
    }

    this.active.forEach((mofu) => {
      mofu.dismissMofu();
    });

    // Poll to check if all mofus are dismissed
    const checkInterval = setInterval(() => {
      if (this.active.size === 0) {
        clearInterval(checkInterval);
        this.notifyAllDismissed();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (this.active.size > 0) {
        console.warn('Some mofus did not dismiss in time');
        this.notifyAllDismissed();
      }
    }, 10000);
  }

  private notifyAllDismissed() {
    // @ts-ignore - VSCode API
    if (typeof acquireVsCodeApi !== 'undefined') {
      // @ts-ignore
      const vscode = acquireVsCodeApi();
      vscode.postMessage({ command: 'allMofusDismissed' });
      console.log('All mofus dismissed notification sent');
    }
  }

  private handleMofuDismissed(mofuId: string) {
    if (this.active.has(mofuId)) {
      this.active.delete(mofuId);
      console.log(`Mofu Dismissed: ${mofuId}`);
    }
  }
}

const configs = window.mofuConfigs;
const framesList = window.mofuFramesList;
const sceneConfig = window.sceneConfig;
const sceneTiles = window.sceneTiles;

type VsCodeCommandMessage = {
  command: 'dismissAll';
};

const isVsCodeCommandMessage = (message: unknown): message is VsCodeCommandMessage => {
  return (
    typeof message === 'object' &&
    message !== null &&
    'command' in message &&
    (message as { command?: unknown }).command === 'dismissAll'
  );
};

if (configs && framesList && sceneConfig && sceneTiles) {
  const keeper = new MofuKeeper(
    configs,
    framesList,
    sceneConfig.ground.numTile,
    sceneConfig.border.numTile
  );
  console.log('Mofu initialized:', configs.map((c) => c.name).join(', '));
  window.addEventListener('message', (event) => {
    const message = event.data;
    if (isVsCodeCommandMessage(message)) {
      keeper.dismissAll();
    }
  });
} else {
  console.error('Failed to load mofu config or frames');
}

try {
  new BackgroundRenderer(sceneConfig, sceneTiles);
  console.log('Background initialized:', sceneConfig.name);
} catch (error) {
  console.error('Failed to load scene config or tiles', error);
}

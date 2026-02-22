/**
 * 运行时加载默认材质
 */
const innerMaterials = {
    '456042ba-7dd1-452c-a76b-cf79a55fcd6c': 'text-mesh-mat',
};
const preloadAssets = Object.keys(innerMaterials);
if (CocosEngine < '3.6.0') {
    cc.game.onEngineInitedAsync(() => {
        return new Promise((resolve, reject) => {
            cc.assetManager.loadBundle('text-mesh', (err, bundle) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
    cc.game.on(cc.Game.EVENT_GAME_INITED, () => {
        cc.assetManager.loadAny(preloadAssets, (err, assets) => {
            if (err) {
                reject(err);
            }
            else {
                for (const mat of assets) {
                    mat.addRef();
                    const uuid = innerMaterials[mat._uuid];
                    cc.builtinResMgr._resources[uuid] = mat;
                    for (let j = 0; j < mat.passes.length; ++j) {
                        mat.passes[j].tryCompile();
                    }
                }
            }
        });
    });
}
else {
    cc.game.onPostProjectInitDelegate.add(() => {
        return new Promise((resolve, reject) => {
            cc.assetManager.loadBundle('text-mesh', (err, bundle) => {
                if (err) {
                    reject(err);
                    return;
                }
                cc.assetManager.loadAny(preloadAssets, (err, assets) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        for (const mat of assets) {
                            mat.addRef();
                            for (let i = 0; i < mat.passes.length; ++i) {
                                mat.passes[i].tryCompile();
                            }
                            cc.builtinResMgr.addAsset(mat.name, mat);
                        }
                        resolve();
                    }
                });
            });
        });
    });
}

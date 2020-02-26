// http://t.cn/AipSVR08
import { AppState, Alert } from 'react-native';
import codePush from 'react-native-code-push';

const codePushStatusDidChange = async (syncStatus: number) => {
  switch (syncStatus) {
    case codePush.SyncStatus.CHECKING_FOR_UPDATE:
      // 0 - 正在查询CodePush服务器以进行更新。
      console.info('[CodePush] Checking for update.');
      break;
    case codePush.SyncStatus.AWAITING_USER_ACTION:
      // 1 - 有可用的更新，并且向最终用户显示了一个确认对话框。（仅在updateDialog使用时适用）
      console.info('[CodePush] Awaiting user action.');
      break;
    case codePush.SyncStatus.DOWNLOADING_PACKAGE:
      // 2 - 正在从CodePush服务器下载可用更新。
      console.info('[CodePush] Downloading package.');
      break;
    case codePush.SyncStatus.INSTALLING_UPDATE:
      // 3 - 已下载一个可用的更新，并将其安装。
      console.info('[CodePush] Installing update.');
      break;
    case codePush.SyncStatus.UP_TO_DATE:
      // 4 - 应用程序已配置的部署完全最新。
      console.info('[CodePush] App is up to date.');
      break;
    case codePush.SyncStatus.UPDATE_IGNORED:
      // 5 该应用程序具有可选更新，最终用户选择忽略该更新。（仅在updateDialog使用时适用）
      console.info('[CodePush] User cancelled the update.');
      break;
    case codePush.SyncStatus.UPDATE_INSTALLED:
      // 6 - 安装了一个可用的更新，它将根据 SyncOptions 中的 InstallMode指定在 syncStatusChangedCallback 函数返回后立即或在下次应用恢复/重新启动时立即运行。

      // 由于安装了CodePush更新，暂时禁止任何程序性重启。这是高级API，当您应用中的组件（例如，入职流程）需要确保在其生命周期内不会出现最终用户中断时，此功能非常有用。
      // codePush.disallowRestart();
      console.info('[CodePush] Installed update.');
      break;
    case codePush.SyncStatus.SYNC_IN_PROGRESS:
      // 7 - 正在执行的 sync 操作
      console.info('[CodePush] Sync already in progress.');
      break;
    case codePush.SyncStatus.UNKNOWN_ERROR:
      // -1 - 同步操作遇到未知错误。
      console.info('[CodePush] Unknown Error.');
      break;
  }
};

const codePushDownloadDidProgress = progress => {
  const curPercent = (
    (progress.receivedBytes / progress.totalBytes) *
    100
  ).toFixed(0);
  console.log('[CodePushUtils] Downloading Progress', `${curPercent}%`);
};

const syncImmediate = async () => {
  codePush.sync(
    {
      updateDialog: {
        appendReleaseDescription: true,
        title: '更新',
        descriptionPrefix: '\n\n更新内容：\n',
        mandatoryContinueButtonLabel: '更新',
        mandatoryUpdateMessage: '',
        optionalIgnoreButtonLabel: '忽略',
        optionalInstallButtonLabel: '更新',
        optionalUpdateMessage: '有一个可用的更新，你要下载它吗？',
      },
      installMode: codePush.InstallMode.IMMEDIATE,
    },
    codePushStatusDidChange,
    codePushDownloadDidProgress,
  );
};

export const checkForUpdate = async () => {
  const update = await codePush.checkForUpdate();
  if (!update) {
    Alert.alert('提示', '已是最新版本');
  } else {
    syncImmediate();
  }
};

export const codePushSync = () => {
  syncImmediate();
  AppState.addEventListener('change', newState => {
    newState === 'active' && syncImmediate();
  });
};

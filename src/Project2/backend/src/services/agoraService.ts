
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export const generateAgoraToken = (channelName: string, uid: number) => {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERT;

  if (!appId || !appCertificate) {
    console.warn('⚠️ Agora credentials missing. Returning dummy token.');
    return 'DUMMY_TOKEN_PLEASE_SET_AGORA_KEYS';
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUint(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  return token;
};

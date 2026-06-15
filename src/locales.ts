import type { ReactNode } from 'react';

export interface CheckinTranslations {
  title: string;
  subtitle: string;
  note: string;
  dayLabel: string;
  buttonLabel: string;
  checkedInLabel: string;
  unitLabel: string;
}

export const locales: Record<string, CheckinTranslations> = {
  en: {
    title: 'Daily Check-in',
    subtitle: 'Check in to get {coin} {reward}',
    note: 'You must claim daily bonus every day to form a streak!',
    dayLabel: 'Day {num}',
    buttonLabel: 'CLAIM',
    checkedInLabel: 'CLAIMED ✓',
    unitLabel: 'Token',
  },
  es: {
    title: 'Registro Diario',
    subtitle: '¡Regístrate para obtener {coin} {reward}!',
    note: '¡Debes reclamar el bono diario todos los días para mantener tu racha!',
    dayLabel: 'Día {num}',
    buttonLabel: 'RECLAMAR',
    checkedInLabel: 'RECLAMADO ✓',
    unitLabel: 'Fichas',
  },
  fr: {
    title: 'Check-in Quotidien',
    subtitle: 'Connectez-vous pour obtenir {coin} {reward}',
    note: 'Vous devez réclamer le bonus quotidien chaque jour pour former une série !',
    dayLabel: 'Jour {num}',
    buttonLabel: 'RÉCLAMER',
    checkedInLabel: 'RÉCLAMÉ ✓',
    unitLabel: 'Jetons',
  },
  de: {
    title: 'Täglicher Check-in',
    subtitle: 'Checken Sie ein, um {coin} {reward} zu erhalten',
    note: 'Sie müssen jeden Tag den täglichen Bonus beanspruchen, um eine Serie aufzubauen!',
    dayLabel: 'Tag {num}',
    buttonLabel: 'BEANSPRUCHEN',
    checkedInLabel: 'BEANSPRUCHT ✓',
    unitLabel: 'Token',
  },
  hi: {
    title: 'दैनिक चेक-इन',
    subtitle: '{coin} {reward} प्राप्त करने के लिए चेक इन करें',
    note: 'लगातार सिलसिला (streak) बनाए रखने के लिए आपको हर दिन दैनिक बोनस का दावा करना होगा!',
    dayLabel: 'दिन {num}',
    buttonLabel: 'दावा करें',
    checkedInLabel: 'दावा किया ✓',
    unitLabel: 'टोकन',
  },
  zh: {
    title: '每日签到',
    subtitle: '签到以获得 {coin} {reward}',
    note: '您必须每天领取每日奖励以保持连续签到！',
    dayLabel: '第 {num} 天',
    buttonLabel: '领取',
    checkedInLabel: '已领取 ✓',
    unitLabel: '代币',
  },
  pt: {
    title: 'Check-in Diário',
    subtitle: 'Faça check-in para obter {coin} {reward}',
    note: 'Você deve reivindicar o bônus diário todos os dias para manter uma sequência!',
    dayLabel: 'Dia {num}',
    buttonLabel: 'REIVINDICAR',
    checkedInLabel: 'REIVINDICADO ✓',
    unitLabel: 'Fichas',
  },
  ja: {
    title: 'デイリーチェックイン',
    subtitle: 'チェックインして {coin} {reward} を獲得',
    note: 'ストリークを維持するには、毎日デイリーボーナスを受け取る必要があります！',
    dayLabel: '{num} 日目',
    buttonLabel: '受け取る',
    checkedInLabel: '受け取り済み ✓',
    unitLabel: 'トークン',
  },
  ko: {
    title: '일일 체크인',
    subtitle: '{coin} {reward}을(를) 받으려면 체크인하세요',
    note: '스트릭을 유지하려면 매일 일일 보너스를 받아야 합니다!',
    dayLabel: '{num} 일차',
    buttonLabel: '받기',
    checkedInLabel: '받음 ✓',
    unitLabel: '토큰',
  },
  it: {
    title: 'Check-in Giornaliero',
    subtitle: 'Accedi per ottenere {coin} {reward}',
    note: 'Devi riscattare il bonus giornaliero ogni giorno per mantenere la serie!',
    dayLabel: 'Giorno {num}',
    buttonLabel: 'RISCATTA',
    checkedInLabel: 'RISCATTATO ✓',
    unitLabel: 'Gettoni',
  },
  ru: {
    title: 'Ежедневный вход',
    subtitle: 'Войдите, чтобы получить {coin} {reward}',
    note: 'Вы должны забирать ежедневный бонус каждый день, чтобы сохранить серию!',
    dayLabel: 'День {num}',
    buttonLabel: 'ЗАБРАТЬ',
    checkedInLabel: 'ЗАБРАНО ✓',
    unitLabel: 'Токен',
  },
  ar: {
    title: 'تسجيل الوصول اليومي',
    subtitle: 'سجل الوصول للحصول على {coin} {reward}',
    note: 'يجب عليك المطالبة بالمكافأة اليومية كل يوم لتشكيل سلسلة متتالية!',
    dayLabel: 'اليوم {num}',
    buttonLabel: 'مطالبة',
    checkedInLabel: 'تمت المطالبة ✓',
    unitLabel: 'رمز',
  },
};

export function renderTemplate(
  template: string,
  replacements: Record<string, ReactNode>
): ReactNode[] {
  const regex = /\{([^}]+)\}/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(template)) !== null) {
    const key = match[1];
    const textBefore = template.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(textBefore);
    }
    if (key in replacements) {
      parts.push(replacements[key]);
    } else {
      parts.push(match[0]);
    }
    lastIndex = regex.lastIndex;
  }

  const textAfter = template.slice(lastIndex);
  if (textAfter) {
    parts.push(textAfter);
  }

  return parts;
}

export function interpolateDay(template: string, num: number): string {
  return template.replace('{num}', String(num));
}

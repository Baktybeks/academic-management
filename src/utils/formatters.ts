export const formatScore = (score: number | null | undefined): number => {
  // Используем Number(0) в случае null/undefined или преобразуем score.toFixed(2) в число
  const rounded = Number(score?.toFixed(2) || 0);

  // Если равно целому числу, возвращаем целое
  return rounded % 1 === 0 ? Math.floor(rounded) : rounded;
};

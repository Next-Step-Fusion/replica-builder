export function formatBytes(bytes: number, precision = 1): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const sign = bytes < 0 ? -1 : 1;
  bytes *= sign;
  const i = Number.parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());

  if (i === 0) return `${bytes * sign} ${sizes[i]}`;

  return `${Number.parseFloat(((bytes / 1024 ** i) * sign).toFixed(precision))} ${sizes[i]}`;
}

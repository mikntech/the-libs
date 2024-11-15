export const encodeUrn = (bucketKey: string, fileName: string): string => {
  const rawUrn = `urn:adsk.objects:os.object:${bucketKey}/${fileName}`;
  return Buffer.from(rawUrn).toString('base64');
};

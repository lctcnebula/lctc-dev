/** Shrinks an uploaded photo so it fits comfortably in browser storage. */
export function shrink(file: File, max = 1200): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = Object.assign(document.createElement("canvas"), { width: Math.round(img.width * k), height: Math.round(img.height * k) });
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL("image/jpeg", .8));
    };
    img.onerror = () => rej(new Error("That file isn't an image we can read."));
    img.src = URL.createObjectURL(file);
  });
}

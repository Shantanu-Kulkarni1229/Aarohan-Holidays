import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Crop, RefreshCw, Trash2, X, ZoomIn, ZoomOut, Maximize2, Minimize2, AlertTriangle, CheckCircle } from 'lucide-react';

// Cards on the website show thumbnails in a 16:9 frame. The editor always outputs exactly 1920x1080,
// so what the admin sees in the editor is what visitors see on the cards.
const OUT_W = 1920;
const OUT_H = 1080;
const RATIO = OUT_W / OUT_H;
const MAX_ZOOM = 4;

const BACKGROUNDS = [
  { key: 'blur', label: 'Blurred photo' },
  { key: 'white', label: 'White' },
  { key: 'black', label: 'Black' },
];

const formatBytes = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

const drawFrame = (ctx, img, scale, cx, cy, bg) => {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  if (bg === 'blur' && 'filter' in ctx) {
    // Cover-fit copy, blurred, behind the real image (only visible when the whole image is fitted)
    const cover = Math.max(OUT_W / iw, OUT_H / ih) * 1.15;
    ctx.save();
    ctx.filter = 'blur(28px) brightness(0.85)';
    ctx.drawImage(img, OUT_W / 2 - (iw * cover) / 2, OUT_H / 2 - (ih * cover) / 2, iw * cover, ih * cover);
    ctx.restore();
  } else {
    ctx.fillStyle = bg === 'white' ? '#ffffff' : bg === 'black' ? '#000000' : '#0F172A';
    ctx.fillRect(0, 0, OUT_W, OUT_H);
  }

  ctx.drawImage(img, cx - (iw * scale) / 2, cy - (ih * scale) / 2, iw * scale, ih * scale);
};

const ThumbnailEditor = ({ source, onApply, onCancel, onUseOriginal }) => {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const [img, setImg] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: OUT_W / 2, y: OUT_H / 2 });
  const [bg, setBg] = useState('blur');
  const [applying, setApplying] = useState(false);

  // Load the picture (a File the admin just picked, or the already-saved URL).
  // `cancelled` ignores results from a stale run (React StrictMode runs effects twice in development,
  // and the first run's revoked blob URL would otherwise report a bogus load error).
  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;
    const image = new Image();
    setImg(null);
    setLoadError('');

    image.onload = () => {
      if (cancelled) return;
      setImg(image);
      const aspect = image.naturalWidth / image.naturalHeight;
      // Far from 16:9 (portrait / square): start with the whole image visible
      const cover = Math.max(OUT_W / image.naturalWidth, OUT_H / image.naturalHeight);
      const contain = Math.min(OUT_W / image.naturalWidth, OUT_H / image.naturalHeight);
      setZoom(Math.abs(aspect - RATIO) / RATIO > 0.3 ? contain / cover : 1);
      setPos({ x: OUT_W / 2, y: OUT_H / 2 });
    };
    image.onerror = () => {
      if (cancelled) return;
      setLoadError(
        source instanceof File
          ? "This image format can't be edited in the browser (for example HEIC). Convert it to JPG, PNG or WebP, or use it as it is."
          : "The saved image couldn't be loaded for editing. Upload it again to re-fit it."
      );
    };

    if (source instanceof File) {
      objectUrl = URL.createObjectURL(source);
      image.src = objectUrl;
    } else {
      // Saved (remote) image: needs CORS so the canvas can export it
      image.crossOrigin = 'anonymous';
      image.src = source;
    }

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source]);

  const iw = img?.naturalWidth || 1;
  const ih = img?.naturalHeight || 1;
  const coverScale = Math.max(OUT_W / iw, OUT_H / ih);
  const containScale = Math.min(OUT_W / iw, OUT_H / ih);
  const minZoom = containScale / coverScale;
  const scale = coverScale * zoom;

  // Keep the image from being dragged away: covers the frame when zoomed in, stays inside it when fitted
  const clampPos = useCallback(
    (x, y, s) => {
      const w = iw * s;
      const h = ih * s;
      const cx = w >= OUT_W ? Math.min(w / 2, Math.max(OUT_W - w / 2, x)) : Math.min(OUT_W - w / 2, Math.max(w / 2, x));
      const cy = h >= OUT_H ? Math.min(h / 2, Math.max(OUT_H - h / 2, y)) : Math.min(OUT_H - h / 2, Math.max(h / 2, y));
      return { x: cx, y: cy };
    },
    [iw, ih]
  );

  const shown = img ? clampPos(pos.x, pos.y, scale) : pos;

  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, OUT_W, OUT_H);
    drawFrame(ctx, img, scale, shown.x, shown.y, bg);
  });

  const setZoomClamped = (z) => setZoom(Math.min(MAX_ZOOM, Math.max(minZoom, z)));
  const fill = () => {
    setZoom(1);
    setPos({ x: OUT_W / 2, y: OUT_H / 2 });
  };
  const fit = () => {
    setZoom(minZoom);
    setPos({ x: OUT_W / 2, y: OUT_H / 2 });
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, start: shown };
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const k = OUT_W / rect.width;
    const { x, y, start } = dragRef.current;
    setPos(clampPos(start.x + (e.clientX - x) * k, start.y + (e.clientY - y) * k, scale));
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  const apply = () => {
    if (!img) return;
    setApplying(true);
    const out = document.createElement('canvas');
    out.width = OUT_W;
    out.height = OUT_H;
    drawFrame(out.getContext('2d'), img, scale, shown.x, shown.y, bg);
    out.toBlob(
      (blob) => {
        setApplying(false);
        if (!blob) {
          setLoadError('Could not export the edited image. Try another picture.');
          return;
        }
        const base = source instanceof File ? source.name.replace(/\.[^.]+$/, '') : 'thumbnail';
        onApply(new File([blob], `${base}-1080p.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92
    );
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const aspect = iw / ih;
  const tooSmall = img && (iw < OUT_W || ih < OUT_H);
  const wrongShape = img && Math.abs(aspect - RATIO) / RATIO > 0.05;
  const suggestFit = img && Math.abs(aspect - RATIO) / RATIO > 0.3;
  const isFitted = img && zoom <= minZoom + 0.001 && minZoom < 0.999;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Edit thumbnail">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Fit your thumbnail to the card</h3>
            <p className="text-sm text-gray-500">Output is saved as 1920 × 1080 px (16:9), exactly how it shows on tour and trek cards.</p>
          </div>
          <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close editor">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loadError ? (
          <div className="p-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{loadError}</p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg border font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              {source instanceof File && onUseOriginal && (
                <button type="button" onClick={onUseOriginal} className="px-5 py-2.5 rounded-lg text-white font-semibold bg-gray-700 hover:bg-gray-800">Use as it is</button>
              )}
            </div>
          </div>
        ) : !img ? (
          <div className="p-16 text-center text-gray-500">Loading image…</div>
        ) : (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_16rem] gap-5">
            <div>
              <canvas
                ref={canvasRef}
                width={OUT_W}
                height={OUT_H}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className="w-full aspect-video rounded-xl border border-gray-200 bg-gray-100 touch-none cursor-grab active:cursor-grabbing"
              />
              <p className="text-xs text-gray-500 mt-2">Drag the picture to reposition it. Use the slider to zoom.</p>

              <div className="flex items-center gap-3 mt-4">
                <button type="button" onClick={() => setZoomClamped(zoom - 0.1)} className="p-2 rounded-lg border hover:bg-gray-50" aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></button>
                <input
                  type="range"
                  min={minZoom}
                  max={MAX_ZOOM}
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoomClamped(Number(e.target.value))}
                  className="flex-1 accent-[#1E9ABF]"
                  aria-label="Zoom"
                />
                <button type="button" onClick={() => setZoomClamped(zoom + 0.1)} className="p-2 rounded-lg border hover:bg-gray-50" aria-label="Zoom in"><ZoomIn className="w-4 h-4" /></button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button type="button" onClick={fill} className="flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm hover:bg-gray-50">
                  <Maximize2 className="w-4 h-4" /> Fill card (crop edges)
                </button>
                <button type="button" onClick={fit} disabled={minZoom >= 0.999} className="flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Minimize2 className="w-4 h-4" /> Fit whole image
                </button>
              </div>

              {isFitted || minZoom < 1 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Space around the image</p>
                  <div className="flex flex-wrap gap-2">
                    {BACKGROUNDS.map((b) => (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => setBg(b.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${bg === b.key ? 'bg-[#1E9ABF] text-white border-[#1E9ABF]' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="space-y-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="font-semibold text-gray-900 mb-2">Your image</p>
                <p className="text-gray-600">{iw} × {ih} px{source instanceof File ? ` · ${formatBytes(source.size)}` : ''}</p>
                <p className="text-gray-600">Shape {aspect >= 1 ? `${aspect.toFixed(2)} : 1` : `1 : ${(1 / aspect).toFixed(2)}`} (cards use 1.78 : 1)</p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4 text-blue-900">
                <p className="font-semibold mb-1">Suggested size</p>
                <p>1920 × 1080 px, 16:9, JPG or WebP. Keep the main subject near the centre.</p>
              </div>

              {tooSmall && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-amber-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>This image is smaller than 1080p, so it may look soft on large screens. A bigger original gives a sharper card.</p>
                </div>
              )}
              {wrongShape && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-amber-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    {suggestFit
                      ? 'This image is not wide. Use “Fit whole image” so nothing is cut off, or “Fill card” and drag to choose what stays.'
                      : 'Slightly different shape. “Fill card” trims a little from the edges; drag to choose which part.'}
                  </p>
                </div>
              )}
              {!tooSmall && !wrongShape && (
                <div className="flex items-start gap-2 rounded-xl bg-green-50 p-4 text-green-800">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>Great — size and shape already match the cards.</p>
                </div>
              )}
            </aside>
          </div>
        )}

        {img && !loadError && (
          <div className="flex justify-end gap-3 px-5 py-4 border-t">
            <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg border font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="button" onClick={apply} disabled={applying} className="px-6 py-2.5 rounded-lg text-white font-semibold bg-[#1E9ABF] hover:brightness-95 disabled:opacity-60">
              {applying ? 'Saving…' : 'Use this thumbnail'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Upload box + 16:9 preview + edit / replace / remove. Parent keeps the final File and preview URL.
const ThumbnailField = ({ label, required, hint, previewUrl, error, onChange, onRemove }) => {
  const inputRef = useRef(null);
  const [editing, setEditing] = useState(null); // File (new pick) or URL string (saved image)
  const [originalFile, setOriginalFile] = useState(null); // keep the untouched pick so re-editing never degrades it
  const [localError, setLocalError] = useState('');

  const handlePick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') && !/\.(heic|heif|avif|jfif|tiff?)$/i.test(file.name)) {
      setLocalError('Please choose an image file.');
      return;
    }
    setLocalError('');
    setOriginalFile(file);
    setEditing(file);
  };

  const commit = (file) => {
    onChange(file, URL.createObjectURL(file));
    setEditing(null);
  };

  const startEdit = () => setEditing(originalFile || previewUrl);

  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-gray-800">
        {label} {required && '*'}
        {hint && <span className="font-normal ml-2 text-gray-500">{hint}</span>}
      </label>

      <input ref={inputRef} type="file" accept="image/*" onChange={handlePick} className="hidden" id="thumbnail-upload" />

      {!previewUrl && (
        <label htmlFor="thumbnail-upload" className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors border-gray-300">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="mb-1 text-gray-700">Click to upload thumbnail</p>
          <p className="text-sm text-gray-500">Best: 1920 × 1080 px (16:9), JPG/PNG/WebP</p>
          <p className="text-xs text-gray-400 mt-1">Any size works — you’ll crop and fit it to the card next.</p>
        </label>
      )}

      {(error || localError) && <p className="text-red-500 text-sm mt-2">{error || localError}</p>}

      {previewUrl && (
        <div className="mt-1">
          <p className="text-sm font-medium mb-2 text-gray-800">Card preview <span className="font-normal text-gray-500">(16:9, as visitors see it)</span></p>
          <img src={previewUrl} alt="Thumbnail preview" className="w-full aspect-video object-cover rounded-xl shadow-lg" />
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={startEdit} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold bg-[#1E9ABF] hover:brightness-95">
              <Crop className="w-4 h-4" /> Edit &amp; fit
            </button>
            <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" /> Replace
            </button>
            <button
              type="button"
              onClick={() => {
                setOriginalFile(null);
                onRemove();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </div>
        </div>
      )}

      {editing && (
        <ThumbnailEditor
          source={editing}
          onCancel={() => setEditing(null)}
          onApply={commit}
          onUseOriginal={editing instanceof File ? () => commit(editing) : undefined}
        />
      )}
    </div>
  );
};

export default ThumbnailField;

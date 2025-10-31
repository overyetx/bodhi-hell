import { Check, Crop, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CropEditorModal = ({
  currentSettings,
  onSave,
  screenStream,
  sharingStatus,
  onClose,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [temp, setTemp] = useState(currentSettings);
  const [aspect, setAspect] = useState("free"); // "free" | "square"

  const [box, setBox] = useState({
    x: 200,
    y: 100,
    w: 300,
    h: 200,
  });

  const drag = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handle = () => settingsToBox();

    video.addEventListener("loadedmetadata", handle);
    video.addEventListener("resize", handle);

    return () => {
      video.removeEventListener("loadedmetadata", handle);
      video.removeEventListener("resize", handle);
    };
  }, [currentSettings]);

  /* ===========================
     LOAD VIDEO
  =========================== */
  useEffect(() => {
    if (sharingStatus !== "active" || !screenStream) return;

    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.srcObject = new MediaStream([screenStream.getVideoTracks()[0]]);

    video.onloadedmetadata = () => {
      video.play().catch(() => {});
    };
  }, [screenStream, sharingStatus]);


  const settingsToBox = () => {
    const video = videoRef.current;
    const cont = containerRef.current;
    if (!video || !cont) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const cw = cont.clientWidth;
    const ch = cont.clientHeight;

    if (!vw || !vh) return;

    const videoRatio = vw / vh;
    const contRatio = cw / ch;

    let displayW, displayH, offsetX = 0, offsetY = 0;

    if (videoRatio > contRatio) {
      displayW = cw;
      displayH = cw / videoRatio;
      offsetY = (ch - displayH) / 2;
    } else {
      displayH = ch;
      displayW = ch * videoRatio;
      offsetX = (cw - displayW) / 2;
    }

    const scaleX = displayW / vw;
    const scaleY = displayH / vh;
    const { top, right, bottom, left } = currentSettings;

    const x = offsetX + left * scaleX;
    const y = offsetY + top * scaleY;
    const w = (vw - left - right) * scaleX;
    const h = (vh - top - bottom) * scaleY;

    setBox({ x, y, w, h });
  };

  /* ===========================
     DRAG / RESIZE START
  =========================== */
  const startDrag = (e, mode) => {
    e.stopPropagation();
    e.preventDefault();

    const p = "touches" in e ? e.touches[0] : e;

    drag.current = {
      mode,
      sx: p.clientX,
      sy: p.clientY,
      start: { ...box },
    };

    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", doDrag, { passive: false });
    window.addEventListener("touchend", endDrag);
  };

  /* ===========================
     DRAG / RESIZE MOVE
  =========================== */
  const doDrag = (e) => {
    if (!drag.current) return;

    const p = "touches" in e ? e.touches[0] : e;
    const dx = p.clientX - drag.current.sx;
    const dy = p.clientY - drag.current.sy;

    let { x, y, w, h } = drag.current.start;

    if (drag.current.mode === "move") {
      x += dx;
      y += dy;
    } else {
      // handle corner resize
      if (drag.current.mode === "tl") {
        x += dx;
        y += dy;
        w -= dx;
        h -= dy;
      }
      if (drag.current.mode === "tr") {
        y += dy;
        w += dx;
        h -= dy;
      }
      if (drag.current.mode === "bl") {
        x += dx;
        w -= dx;
        h += dy;
      }
      if (drag.current.mode === "br") {
        w += dx;
        h += dy;
      }

      if (drag.current.mode === "tm") {
        y += dy;
        h -= dy;
      }
      if (drag.current.mode === "bm") {
        h += dy;
      }
      if (drag.current.mode === "ml") {
        x += dx;
        w -= dx;
      }
      if (drag.current.mode === "mr") {
        w += dx;
      }      

      // Square constraint
      if (aspect === "square") {
        const s = Math.min(w, h);
        // adjust based on corner
        if (drag.current.mode === "tl") {
          x = drag.current.start.x + (drag.current.start.w - s);
          y = drag.current.start.y + (drag.current.start.h - s);
        } else if (drag.current.mode === "tr") {
          y = drag.current.start.y + (drag.current.start.h - s);
        } else if (drag.current.mode === "bl") {
          x = drag.current.start.x + (drag.current.start.w - s);
        }
        w = s;
        h = s;
      }
    }

    // bounds
    const cont = containerRef.current.getBoundingClientRect();
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + w > cont.width) w = cont.width - x;
    if (y + h > cont.height) h = cont.height - y;

    setBox({ x, y, w, h });
  };

  /* ===========================
     DRAG END
  =========================== */
  const endDrag = () => {
    drag.current = null;
    window.removeEventListener("mousemove", doDrag);
    window.removeEventListener("mouseup", endDrag);
    window.removeEventListener("touchmove", doDrag);
    window.removeEventListener("touchend", endDrag);
  };

  /* ===========================
     SAVE
  =========================== */
  const handleSave = () => {
    const video = videoRef.current;
    const cont = containerRef.current;

    if (!video || !cont) {
      onSave(temp);
      onClose();
      return;
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const cw = cont.clientWidth;
    const ch = cont.clientHeight;

    const videoRatio = vw / vh;
    const contRatio = cw / ch;

    let displayW, displayH, offsetX = 0, offsetY = 0;

    if (videoRatio > contRatio) {
      displayW = cw;
      displayH = cw / videoRatio;
      offsetY = (ch - displayH) / 2;
    } else {
      displayH = ch;
      displayW = ch * videoRatio;
      offsetX = (cw - displayW) / 2;
    }

    const rx = vw / displayW;
    const ry = vh / displayH;

    const adjX = box.x - offsetX;
    const adjY = box.y - offsetY;

    const left   = Math.round(adjX * rx);
    const top    = Math.round(adjY * ry);
    const right  = Math.round(vw - (adjX + box.w) * rx);
    const bottom = Math.round(vh - (adjY + box.h) * ry);

    onSave({
      top: Math.max(0, top),
      right: Math.max(0, right),
      bottom: Math.max(0, bottom),
      left: Math.max(0, left),
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-[9999] select-none"
      onClick={onClose}
    >
      {/* === TOP BAR === */}
      <div
        className="fixed top-0 left-0 w-full p-4 z-[10010] 
                  flex items-center justify-between 
                  bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white text-lg font-semibold">
            <Crop /> Crop
          </div>

          {/* === ASPECT BUTTONS === */}
          <div className="flex gap-2">
            <button
              onClick={() => setAspect("free")}
              className={`px-3 py-1 rounded ${
                aspect === "free"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-600 text-white"
              }`}
            >
                Free
            </button>

            <button
              onClick={() => setAspect("square")}
              className={`px-3 py-1 rounded ${
                aspect === "square"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-600 text-white"
              }`}
            >
                Square
            </button>
          </div>
        </div>

        <button onClick={onClose} className="p-1">
          <X className="text-slate-300 hover:text-white" />
        </button>
      </div>

      {/* === VIDEO FULLSCREEN === */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-[1000] bg-black overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain bg-black"
        />

        {/* === OVERLAY CROP BOX === */}
        <div
          className="absolute border-2 border-sky-500 cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
          style={{
            left: box.x,
            top: box.y,
            width: box.w,
            height: box.h,
          }}
          onMouseDown={(e) => startDrag(e, "move")}
          onTouchStart={(e) => startDrag(e, "move")}
        >
          {["tl", "tr", "bl", "br"].map((h) => (
            <div
              key={h}
              onMouseDown={(e) => startDrag(e, h)}
              onTouchStart={(e) => startDrag(e, h)}
              className="absolute w-3 h-3 bg-white border-2 border-sky-500 rounded-full"
              style={{
                top: h.includes("t") ? -6 : undefined,
                bottom: h.includes("b") ? -6 : undefined,
                left: h.includes("l") ? -6 : undefined,
                right: h.includes("r") ? -6 : undefined,
                cursor: `${h}-resize`,
              }}
            />
          ))}

          {["tm", "bm", "ml", "mr"].map((h) => (
            <div
              key={h}
              onMouseDown={(e) => startDrag(e, h)}
              onTouchStart={(e) => startDrag(e, h)}
              className="absolute bg-white border-2 border-sky-500"
              style={{
                width: h === "tm" || h === "bm" ? 20 : 6,
                height: h === "ml" || h === "mr" ? 20 : 6,
                top:
                  h === "tm"
                    ? -3
                    : h === "bm"
                    ? undefined
                    : "50%",
                bottom: h === "bm" ? -3 : undefined,
                left:
                  h === "ml"
                    ? -3
                    : h === "mr"
                    ? undefined
                    : "50%",
                right: h === "mr" ? -3 : undefined,
                transform: "translate(-50%, -50%)",
                cursor: h === "tm" || h === "bm" ? "ns-resize" : "ew-resize",
              }}
            />
          ))}
        </div>
      </div>

      {/* === SAVE BUTTON BAR === */}
      <div
        className="fixed bottom-0 left-0 w-full p-4 z-[10010]
                  flex justify-end gap-3
                  bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Check /> Save
        </button>

        <button
          onClick={onClose}
          className="bg-slate-600 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );

};

export default CropEditorModal;